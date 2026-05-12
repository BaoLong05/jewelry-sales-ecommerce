<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Exception;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService
    ) {}

    //danh sach san pham co trong gio hang
    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->cartService->getCart($request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Lấy giỏ hàng thành công.',
                'data'    => $data,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    //them san pham gio hang
    public function store(AddToCartRequest $request): JsonResponse
    {
        try {
            $cartItem = $this->cartService->addToCart(
                userId: $request->user()->id,
                productId: $request->validated('product_id'),
                quantity: $request->validated('quantity', 1),
            );

            return response()->json([
                'success' => true,
                'message' => 'Thêm vào giỏ hàng thành công.',
                'data'    => $cartItem,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    //cap nhat san pham trong gio hang
   public function update(UpdateCartItemRequest $request, $cartItemId)
{
    $data = $this->cartService->updateCartItem(
        Auth::id(),                      
        (int) $cartItemId,               
        $request->validated()['quantity']
    );

    return response()->json([
        'success' => true,
        'message' => 'Cập nhật giỏ hàng thành công.',
        'data' => $data
    ]);
}



    //xoa 1 san pham khoi gio hang
    public function destroy(Request $request, int $cartItemId): JsonResponse
    {
        try {
            $this->cartService->removeCartItem($request->user()->id, $cartItemId);

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa sản phẩm khỏi giỏ hàng.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
    //xoa toan bo san pham khoi gio hang
    public function clear(Request $request): JsonResponse
    {
        try {
            $this->cartService->clearCart($request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa toàn bộ giỏ hàng.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
