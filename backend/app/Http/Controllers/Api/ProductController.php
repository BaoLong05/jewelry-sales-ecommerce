<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use Illuminate\Http\Request;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
    protected $service;

    public function __construct(ProductService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->getAll($request)
        ]);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->getById($id)
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $data = $this->service->create(
            $request->validated(),
            $request->file('images') ?? []
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function update(UpdateProductRequest $request, $id)
    {
        try {
            $data = $this->service->update(
                $id,
                $request->validated(),
                $request->file('images') ?? []
            );
            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            $status = str_contains($e->getMessage(), 'tải lại') ? 409 : 500;
            return response()->json(['success' => false, 'message' => $e->getMessage()], $status);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $this->service->delete($id, $request->input('updated_at'));
            return response()->json(['success' => true, 'message' => 'Xóa sản phẩm thành công']);
        } catch (\Exception $e) {
            $status = match (true) {
                str_contains($e->getMessage(), 'tải lại') => 409,
                str_contains($e->getMessage(), 'không tồn tại') => 404,
                default => 500,
            };
            return response()->json(['success' => false, 'message' => $e->getMessage()], $status);
        }
    }
}
