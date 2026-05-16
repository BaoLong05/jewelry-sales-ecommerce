<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Order\ListOrderRequest;
use App\Http\Requests\User\Order\StoreRefundRequest;
use App\Http\Requests\User\Order\StoreReviewRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\RefundRequestResource;
use App\Http\Resources\ReviewResource;
use App\Services\User\OrderService;
use Illuminate\Http\JsonResponse;

class UserOrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    public function index(ListOrderRequest $request): JsonResponse
    {
        $orders = $this->orderService->listOrders(
            userId:  auth()->id(),
            filters: $request->validated(),
        );

        return response()->json([
            'success' => true,
            'data'    => OrderResource::collection($orders),
            'meta'    => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'total'        => $orders->total(),
                'per_page'     => $orders->perPage(),
            ],
        ]);
    }
    public function show(string $orderCode): JsonResponse
    {
        $order = $this->orderService->getOrderDetail(
            userId:    auth()->id(),
            orderCode: $orderCode,
        );

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
        ]);
    }

    public function storeReview(
        StoreReviewRequest $request,
        string $orderCode,
        int $orderItemId
    ): JsonResponse {
        $review = $this->orderService->storeReview(
            userId:      auth()->id(),
            orderCode:   $orderCode,
            orderItemId: $orderItemId,
            data:        $request->validated(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá sản phẩm thành công.',
            'data'    => new ReviewResource($review),
        ], 201);
    }

    public function storeRefundRequest(
        StoreRefundRequest $request,
        string $orderCode,
        int $orderItemId
    ): JsonResponse {
        $refundRequest = $this->orderService->storeRefundRequest(
            userId:      auth()->id(),
            orderCode:   $orderCode,
            orderItemId: $orderItemId,
            data:        $request->validated(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Yêu cầu hoàn hàng đã được gửi. Admin sẽ phản hồi sớm nhất.',
            'data'    => new RefundRequestResource($refundRequest),
        ], 201);
    }
}