<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Discount\StoreDiscountRequest;
use App\Http\Requests\Admin\Discount\UpdateDiscountRequest;
use App\Http\Resources\DiscountResource;
use App\Services\Admin\DiscountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDiscountController extends Controller
{
    public function __construct(
        private readonly DiscountService $discountService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $discounts = $this->discountService->list($request->only('search', 'is_active', 'per_page'));

        return response()->json([
            'success' => true,
            'data'    => DiscountResource::collection($discounts),
            'meta'    => [
                'current_page' => $discounts->currentPage(),
                'last_page'    => $discounts->lastPage(),
                'total'        => $discounts->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $discount = $this->discountService->findById($id);

        return response()->json([
            'success' => true,
            'data'    => new DiscountResource($discount),
        ]);
    }
    public function store(StoreDiscountRequest $request): JsonResponse
    {
        $discount = $this->discountService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Tạo chương trình giảm giá thành công.',
            'data'    => new DiscountResource($discount),
        ], 201);
    }
    public function update(UpdateDiscountRequest $request, int $id): JsonResponse
    {
        $discount = $this->discountService->update($id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thành công.',
            'data'    => new DiscountResource($discount),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->discountService->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Đã xoá chương trình giảm giá.',
        ]);
    }
}