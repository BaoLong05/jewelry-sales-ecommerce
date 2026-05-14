<?php

namespace App\Services;

use App\Models\{CartItem, Order, OrderItem, Payment, Address, Product};
use Illuminate\Support\Facades\{DB, Http, Log};
use Illuminate\Support\Str;

class CheckoutService
{
    public function placeOrder($user, array $data): array
    {
        return DB::transaction(function () use ($user, $data) {
            $cartItems = CartItem::whereIn('id', $data['cart_item_ids'])
                ->whereHas('cart', fn($q) => $q->where('user_id', $user->id))
                ->with([
                    'product.discounts' => fn($q) => $q
                        ->where('start_date', '<=', now())
                        ->where('end_date', '>=', now())
                ])
                ->lockForUpdate()
                ->get();

            if ($cartItems->isEmpty()) {
                throw new \Exception('Không có sản phẩm nào hợp lệ');
            }

            $subtotal = $discountAmount = 0;
            $hasFreeship = false;
            $itemsData = [];

            foreach ($cartItems as $item) {
                $product = $item->product;
                if ($product->stock < $item->quantity) {
                    throw new \Exception("Sản phẩm '{$product->name}' không đủ hàng");
                }

                $originalPrice   = (float) $product->price;
                $discountedPrice = $product->getDiscountedPrice();
                $itemDiscount    = ($originalPrice - $discountedPrice) * $item->quantity;

                $subtotal       += $discountedPrice * $item->quantity;
                $discountAmount += $itemDiscount;

                if ($product->activeDiscounts()->where('type', 'freeship')->exists()) {
                    $hasFreeship = true;
                }

                $itemsData[] = [
                    'product'         => $product,
                    'quantity'        => $item->quantity,
                    'original_price'  => $originalPrice,
                    'price'           => $discountedPrice,
                    'discount_amount' => $itemDiscount,
                ];
            }

            $total = $subtotal;

            $address = Address::where('id', $data['address_id'])
                ->where('user_id', $user->id)
                ->firstOrFail();

            $addressSnapshot = json_encode([
                'receiver_name' => $address->receiver_name,
                'phone'         => $address->phone,
                'province'      => $address->province,
                'district'      => $address->district,
                'ward'          => $address->ward,
                'street'        => $address->street,
            ]);

            $order = Order::create([
                'user_id'         => $user->id,
                'order_code'      => 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6)),
                'total_price'     => $total,
                'discount_amount' => $discountAmount,
                'status'          => 'pending',
                'address'         => $addressSnapshot,
                'payment_method'  => $data['payment_method'],
            ]);

            foreach ($itemsData as $item) {
                OrderItem::create([
                    'order_id'        => $order->id,
                    'product_id'      => $item['product']->id,
                    'quantity'        => $item['quantity'],
                    'price'           => $item['price'],
                    'original_price'  => $item['original_price'],
                    'discount_amount' => $item['discount_amount'],
                ]);
                $item['product']->decrement('stock', $item['quantity']);
            }

            $payment = Payment::create([
                'order_id'        => $order->id,
                'payment_date'    => now(),
                'amount'          => $total,
                'method'          => $data['payment_method'],
                'status'          => 'pending',
                'idempotency_key' => (string) Str::uuid(),
                'payment_token'   => Str::random(64),
            ]);

            // COD
            if ($data['payment_method'] === 'cod') {
                $payment->update(['status' => 'paid', 'paid_at' => now()]);
                $order->update(['status' => 'paid']);
                CartItem::whereIn('id', $data['cart_item_ids'])->delete();
                return [
                    'payment_method'  => 'cod',
                    'payment_token'   => $payment->payment_token,
                    'order_code'      => $order->order_code,
                    'total_amount'    => $total,
                    'discount_amount' => $discountAmount,
                ];
            }

            // Bank transfer
            if ($data['payment_method'] === 'bank_transfer') {
                return [
                    'payment_method'   => 'bank_transfer',
                    'payment_id'       => $payment->id,
                    'amount'           => $total,
                    'transfer_content' => $payment->idempotency_key,
                    'bank_account'     => config('payment.bank_account'),
                    'bank_name'        => config('payment.bank_name'),
                    'bank_owner'       => config('payment.bank_owner'),
                    'qr_url'           => $this->generateVietQR($total, $payment->idempotency_key),
                    'discount_amount'  => $discountAmount,
                ];
            }

            // MoMo
            if ($data['payment_method'] === 'momo') {
                $redirectUrl = $this->buildMomoUrl($payment, $order);
                return [
                    'payment_method' => 'momo',
                    'redirect_url'   => $redirectUrl,
                    'order_code'     => $order->order_code,
                ];
            }

            throw new \Exception('Phương thức thanh toán không hợp lệ');
        });
    }

    // ── MoMo ──────────────────────────────────────────────────────────────────

    private function buildMomoUrl(Payment $payment, Order $order): string
    {
        $cfg         = config('payment.momo');
        $partnerCode = $cfg['partner_code'];
        $accessKey   = $cfg['access_key'];
        $secretKey   = $cfg['secret_key'];
        $orderId     = $payment->idempotency_key;
        $orderInfo   = 'ThanhToan_' . $order->order_code;
        $amount      = (int) round($payment->amount);
        $requestId   = (string) Str::uuid();
        $redirectUrl = $cfg['redirect_url'];
        $ipnUrl      = $cfg['ipn_url'];
        $requestType = 'captureWallet';
        $extraData   = '';

        $rawHash = "accessKey={$accessKey}"
            . "&amount={$amount}"
            . "&extraData={$extraData}"
            . "&ipnUrl={$ipnUrl}"
            . "&orderId={$orderId}"
            . "&orderInfo={$orderInfo}"
            . "&partnerCode={$partnerCode}"
            . "&redirectUrl={$redirectUrl}"
            . "&requestId={$requestId}"
            . "&requestType={$requestType}";

        $signature = hash_hmac('sha256', $rawHash, $secretKey);

        $body = [
            'partnerCode' => $partnerCode,
            'accessKey'   => $accessKey,
            'requestId'   => $requestId,
            'amount'      => $amount,
            'orderId'     => $orderId,
            'orderInfo'   => $orderInfo,
            'redirectUrl' => $redirectUrl,
            'ipnUrl'      => $ipnUrl,
            'extraData'   => $extraData,
            'requestType' => $requestType,
            'signature'   => $signature,
            'lang'        => 'vi',
        ];

        $response = Http::post($cfg['endpoint'], $body);
        $result   = $response->json();

        Log::info('MoMo create payment', $result);

        if (($result['resultCode'] ?? -1) !== 0) {
            throw new \Exception('MoMo: ' . ($result['message'] ?? 'Lỗi tạo thanh toán'));
        }

        return $result['payUrl'];
    }

    // ── MoMo Callback (IPN + redirect) ────────────────────────────────────────

    public function handleCallback(string $method, array $data): array
    {
        if ($method === 'momo') {
            return $this->handleMomoCallback($data);
        }

        $ref     = $data['orderId'] ?? $data['vnp_TxnRef'] ?? null;
        $payment = Payment::where('idempotency_key', $ref)->lockForUpdate()->firstOrFail();

        if ($payment->status === 'paid') {
            return ['success' => true, 'payment_token' => $payment->payment_token];
        }

        if (!$this->verifySignature($method, $data)) {
            Log::warning("Invalid $method signature", $data);
            return ['success' => false];
        }

        DB::transaction(function () use ($payment, $data) {
            $payment->update([
                'status'           => 'paid',
                'paid_at'          => now(),
                'transaction_ref'  => $data['transId'] ?? $data['vnp_TransactionNo'] ?? null,
                'gateway_response' => $data,
            ]);
            $payment->order->update(['status' => 'paid']);
            CartItem::whereHas('cart', fn($q) => $q->where('user_id', $payment->order->user_id))
                ->whereIn('product_id', $payment->order->items->pluck('product_id'))
                ->delete();
        });

        return ['success' => true, 'payment_token' => $payment->payment_token];
    }

    private function handleMomoCallback(array $data): array
    {
        $orderId = $data['orderId'] ?? null;
        if (!$orderId) return ['success' => false];

        // Verify signature
        $cfg       = config('payment.momo');
        $accessKey = $cfg['access_key'];
        $secretKey = $cfg['secret_key'];

        $rawHash = "accessKey={$accessKey}"
            . "&amount={$data['amount']}"
            . "&extraData={$data['extraData']}"
            . "&message={$data['message']}"
            . "&orderId={$data['orderId']}"
            . "&orderInfo={$data['orderInfo']}"
            . "&orderType={$data['orderType']}"
            . "&partnerCode={$data['partnerCode']}"
            . "&payType={$data['payType']}"
            . "&requestId={$data['requestId']}"
            . "&responseTime={$data['responseTime']}"
            . "&resultCode={$data['resultCode']}"
            . "&transId={$data['transId']}";

        $signature = hash_hmac('sha256', $rawHash, $secretKey);

        if ($signature !== ($data['signature'] ?? '')) {
            Log::warning('MoMo callback: sai signature', $data);
            return ['success' => false];
        }

        if ((int) ($data['resultCode'] ?? -1) !== 0) {
            Log::info('MoMo callback: thanh toán thất bại', $data);
            return ['success' => false];
        }

        $payment = Payment::where('idempotency_key', $orderId)
            ->lockForUpdate()
            ->firstOrFail();

        if ($payment->status === 'paid') {
            return ['success' => true, 'payment_token' => $payment->payment_token];
        }

        DB::transaction(function () use ($payment, $data) {
            $payment->update([
                'status'           => 'paid',
                'paid_at'          => now(),
                'transaction_ref'  => (string) ($data['transId'] ?? null),
                'gateway_response' => $data,
            ]);
            $payment->order->update(['status' => 'paid']);
            CartItem::whereHas('cart', fn($q) => $q->where('user_id', $payment->order->user_id))
                ->whereIn('product_id', $payment->order->items->pluck('product_id'))
                ->delete();
        });

        return ['success' => true, 'payment_token' => $payment->payment_token];
    }

    // ── Bank webhook ───────────────────────────────────────────────────────────

    public function handleBankWebhook(array $data): void
    {
        $content = $data['description'] ?? $data['content'] ?? '';
        $amount  = (float) ($data['amount'] ?? 0);
        preg_match('/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i', $content, $matches);
        if (!isset($matches[0])) return;

        $payment = Payment::where('idempotency_key', $matches[0])
            ->where('status', 'pending')->first();
        if (!$payment || $amount < (float) $payment->amount) return;

        DB::transaction(function () use ($payment, $data) {
            $payment->update([
                'status'           => 'paid',
                'paid_at'          => now(),
                'transaction_ref'  => $data['id'] ?? null,
                'gateway_response' => $data,
            ]);
            $payment->order->update(['status' => 'paid']);
            CartItem::whereHas('cart', fn($q) => $q->where('user_id', $payment->order->user_id))
                ->whereIn('product_id', $payment->order->items->pluck('product_id'))
                ->delete();
        });
    }

    public function checkPaymentStatus(int $paymentId, $user): array
    {
        $payment = Payment::whereHas('order', fn($q) => $q->where('user_id', $user->id))
            ->findOrFail($paymentId);
        return [
            'status'        => $payment->status,
            'payment_token' => $payment->status === 'paid' ? $payment->payment_token : null,
            'order_code'    => $payment->order->order_code,
        ];
    }

    public function verifyToken(string $token, $user): array
    {
        $payment = Payment::where('payment_token', $token)
            ->where('status', 'paid')
            ->whereHas('order', fn($q) => $q->where('user_id', $user->id))
            ->with('order.items.product')
            ->firstOrFail();
        return [
            'order_code'      => $payment->order->order_code,
            'total_amount'    => $payment->order->total_price,
            'discount_amount' => $payment->order->discount_amount,
            'payment_method'  => $payment->method,
            'items'           => $payment->order->items,
        ];
    }

    private function generateVietQR(float $amount, string $content): string
    {
        $bin     = config('payment.bank_bin');
        $account = config('payment.bank_account');
        return "https://img.vietqr.io/image/{$bin}-{$account}-compact2.jpg"
            . "?amount=" . (int) $amount
            . "&addInfo=" . urlencode($content);
    }

    private function verifySignature(string $method, array $data): bool
    {
        return true;
    }


    //mothod check mau ngay khong qua gio hang
    public function placeOrderDirect($user, array $data): array
    {
        return DB::transaction(function () use ($user, $data) {
            $product = Product::with([
                'discounts' => fn($q) => $q
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
            ])->lockForUpdate()->findOrFail($data['product_id']);

            // kiem tra con hang khong
            if ($product->stock <= 0) {
                throw new \Exception("Sản phẩm '{$product->name}' đã hết hàng.");
            }

            if ($product->stock < $data['quantity']) {
                throw new \Exception("Sản phẩm '{$product->name}' không đủ hàng");
            }

            $originalPrice   = (float) $product->price;
            $discountedPrice = $product->getDiscountedPrice();
            $itemDiscount    = ($originalPrice - $discountedPrice) * $data['quantity'];
            $total           = $discountedPrice * $data['quantity'];

            $address = Address::where('id', $data['address_id'])
                ->where('user_id', $user->id)
                ->firstOrFail();

            $addressSnapshot = json_encode([
                'receiver_name' => $address->receiver_name,
                'phone'         => $address->phone,
                'province'      => $address->province,
                'district'      => $address->district,
                'ward'          => $address->ward,
                'street'        => $address->street,
            ]);

            $order = Order::create([
                'user_id'         => $user->id,
                'order_code'      => 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6)),
                'total_price'     => $total,
                'discount_amount' => $itemDiscount,
                'status'          => 'pending',
                'address'         => $addressSnapshot,
                'payment_method'  => $data['payment_method'],
            ]);

            OrderItem::create([
                'order_id'        => $order->id,
                'product_id'      => $product->id,
                'quantity'        => $data['quantity'],
                'price'           => $discountedPrice,
                'original_price'  => $originalPrice,
                'discount_amount' => $itemDiscount,
            ]);

            $product->decrement('stock', $data['quantity']);

            $payment = Payment::create([
                'order_id'        => $order->id,
                'payment_date'    => now(),
                'amount'          => $total,
                'method'          => $data['payment_method'],
                'status'          => 'pending',
                'idempotency_key' => (string) Str::uuid(),
                'payment_token'   => Str::random(64),
            ]);

            if ($data['payment_method'] === 'cod') {
                $payment->update(['status' => 'paid', 'paid_at' => now()]);
                $order->update(['status' => 'paid']);
                return [
                    'payment_method'  => 'cod',
                    'payment_token'   => $payment->payment_token,
                    'order_code'      => $order->order_code,
                    'total_amount'    => $total,
                    'discount_amount' => $itemDiscount,
                ];
            }

            if ($data['payment_method'] === 'bank_transfer') {
                return [
                    'payment_method'   => 'bank_transfer',
                    'payment_id'       => $payment->id,
                    'amount'           => $total,
                    'transfer_content' => $payment->idempotency_key,
                    'bank_account'     => config('payment.bank_account'),
                    'bank_name'        => config('payment.bank_name'),
                    'bank_owner'       => config('payment.bank_owner'),
                    'qr_url'           => $this->generateVietQR($total, $payment->idempotency_key),
                    'discount_amount'  => $itemDiscount,
                ];
            }

            if ($data['payment_method'] === 'momo') {
                $redirectUrl = $this->buildMomoUrl($payment, $order);
                return [
                    'payment_method' => 'momo',
                    'redirect_url'   => $redirectUrl,
                    'order_code'     => $order->order_code,
                ];
            }

            throw new \Exception('Phương thức thanh toán không hợp lệ');
        });
    }
}
