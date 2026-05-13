<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlaceOrderRequest;
use App\Models\Payment;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckoutController extends Controller
{
    public function __construct(private CheckoutService $checkoutService) {}

    public function placeOrder(PlaceOrderRequest $request)
    {
        try {
            $user = auth()->user();
            $result = $this->checkoutService->placeOrder($user, $request->validated());
            return response()->json(['data' => $result]); // phải có dòng này
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function paymentStatus(int $id)
    {
        try {
            $data = $this->checkoutService->checkPaymentStatus($id, auth()->user());
            return response()->json(['data' => $data]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không tìm thấy'], 404);
        }
    }
    public function verifyToken(string $token)
    {
        try {
            $data = $this->checkoutService->verifyToken($token, auth()->user());
            return response()->json(['data' => $data]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token không hợp lệ'], 404);
        }
    }
    public function paymentCallback(Request $request, string $method)
    {
        $result = $this->checkoutService->handleCallback($method, $request->all());
        if ($result['success']) {
            return redirect(env('FRONTEND_URL') . '/order-success?token=' . $result['payment_token']);
        }
        return redirect(env('FRONTEND_URL') . '/order-failed');
    }

    public function bankWebhook(Request $request)
    {
        $this->checkoutService->handleBankWebhook($request->all());
        return response()->json(['status' => 'ok']);
    }
}
