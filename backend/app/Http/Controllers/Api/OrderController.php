<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Exceptions\OrderException;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Requests\OrderListRequest;
use App\Services\OrderService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    //danh sach don hang
    public function index(OrderListRequest $request): JsonResponse
    {
        $order = $this->orderService->getAll($request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách đơn hàng thành công!',
            'data' => $order
        ]);
    }


    //chi tiet don hang
    public function show(int $id): JsonResponse
    {
        try {
            $order = $this->orderService->getByid($id);

            return response()->json([
                'success' => true,
                'message' => 'Lấy chi tiết đơn hàng thành công!',
                'data' => $order
            ]);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng không tồn tại.',

            ], 404);
        }
    }
    // cap nhat trang thai don hang
    public function update(UpdateOrderStatusRequest $request, int $id): JsonResponse
    {
        try {
            $order = $this->orderService->updateStatus(
                $id,
                $request->validated('status')
            );
            return response()->json([
                'success' => true,
                'message' => 'Trạng thái đã được cập nhật thành công!',
                'data' => $order
            ]);
        } catch (ModelNotFoundException) {
            return response()->json([
                'success' =>  false,
                'message' => 'Đơn hàng không tồn tại.'
            ], 404);
        } catch (OrderException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()

            ], 422);
        }
    }
}
