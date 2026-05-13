<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use App\Models\Discount;
use Exception;

class CartService
{
    //lay hoac tao san pham gio hang cho user hien tai
    public function getOrCreateCart(int $userId): Cart
    {
        return Cart::firstOrCreate(['user_id' => $userId]);
    }

    //lay toan bo san pham  va anh
    public function getCart(int $userId): array
    {
        $cart = $this->getOrCreateCart($userId);

        $items = $cart->items()
            ->with([
                'product' => fn($q) => $q->select('id', 'name', 'price', 'description', 'stock'),
                'product.images' => fn($q) => $q->where('is_main', true)
                    ->select('product_id', 'image_url')
                    ->orderBy('sort_order'),
            ])
            ->get()
            ->map(fn($item) => $this->formatCartItem($item));

        $total = $items->sum('subtotal');

        return [
            'cart_id'     => $cart->id,
            'total_price' => round($total, 2),
            'total_items' => $items->sum('quantity'),
            'items'       => $items->values(),
        ];
    }

    private function calculatePrice(Product $product): float
    {
        // Lấy discount đang áp dụng (nếu có)
        $discount = $product->discounts()
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();

        if ($discount) {
            if ($discount->type === 'percent') {
                return round($product->price * (1 - $discount->value / 100), 2);
            } else {
                return max(0, round($product->price - $discount->value, 2));
            }
        }

        return $product->price;
    }
    //lay anh vao gio hang, them san pham vao gio hang neu trung tang so luong
    public function addToCart(int $userId, int $productId, int $quantity = 1): array
    {
        return DB::transaction(function () use ($userId, $productId, $quantity) {
            $product = Product::with([
                'images' => fn($q) => $q->where('is_main', true)
                    ->select('product_id', 'image_url')
                    ->orderBy('sort_order'),
            ])->findOrFail($productId);

            // check ton kho
            if ($product->stock < 1) {
                throw new Exception('Sản phẩm đã hết hàng.');
            }

            $cart = $this->getOrCreateCart($userId);

            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $productId)
                ->first();

            if ($cartItem) {
                $newQty = $cartItem->quantity + $quantity;

                if ($newQty > $product->stock) {
                    throw new Exception("Chỉ còn {$product->stock} sản phẩm trong kho.");
                }

                $cartItem->update([
                    'quantity' => $newQty,
                    'price' => $this->calculatePrice($product),
                ]);
            } else {
                $cartItem = CartItem::create([
                    'cart_id'    => $cart->id,
                    'product_id' => $productId,
                    'quantity'   => $quantity,
                    'price'      => $this->calculatePrice($product),
                ]);

                if (!$cartItem) {
                    throw new \Exception("Không thể tạo sản phẩm trong giỏ hàng.");
                }
            }

            // reload de tra ve day du gio hang
            if ($cartItem) {
                $cartItem->load([
                    'product' => fn($q) => $q->select('id', 'name', 'description', 'price', 'stock'),
                    'product.images',
                ]);
            }

            return $this->formatCartItem($cartItem);
        });
    }

    //cap nhat so luong gio hang
    public function updateCartItem(int $userId, int $cartItemId, int $quantity): array
    {
        return DB::transaction(function () use ($userId, $cartItemId, $quantity) {
            $cart     = $this->getOrCreateCart($userId);
            $cartItem = CartItem::where('id', $cartItemId)
                ->where('cart_id', $cart->id)
                ->firstOrFail();

            $product = Product::findOrFail($cartItem->product_id);

            if ($quantity > $product->stock) {
                throw new Exception("Chỉ còn {$product->stock} sản phẩm trong kho.");
            }

            $cartItem->update([
                'quantity' => $quantity,
                'price' => $this->calculatePrice($product),
            ]);

            $cartItem->load([
                'product' => fn($q) => $q->select('id', 'name', 'price', 'description', 'stock'),
                'product.images',
            ]);

            return $this->formatCartItem($cartItem);
        });
    }

    //xoa 1 sp khoi gio hang
    public function removeCartItem(int $userId, int $cartItemId): bool
    {
        $cart     = $this->getOrCreateCart($userId);
        $cartItem = CartItem::where('id', $cartItemId)
            ->where('cart_id', $cart->id)
            ->firstOrFail();

        return (bool) $cartItem->delete();
    }

    //xoa toan bo khoi gio hang
    public function clearCart(int $userId): bool
    {
        $cart = $this->getOrCreateCart($userId);
        return (bool) $cart->items()->delete();
    }

    //private helper
    private function formatCartItem(CartItem $item): array
    {
        $product   = $item->product;
        $mainImage = $product->images->first()?->image_url ?? null;

        return [
            'cart_item_id' => $item->id,
            'quantity'     => $item->quantity,
            'price' => (float) $item->price,
            'subtotal'     => round($item->price * $item->quantity, 2),
            'product'      => [
                'id'             => $product->id,
                'name'           => $product->name,
                'description'    => $product->description,
                'price' => (float) $item->price,
                'original_price' => (float) $product->price,
                'stock'          => $product->stock,
                'image_url'      => $mainImage,
            ],
        ];
    }
}
