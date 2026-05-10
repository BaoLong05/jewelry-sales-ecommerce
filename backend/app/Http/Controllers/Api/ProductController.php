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
        $data = $this->service->update(
            $id,
            $request->validated(),
            $request->file('images') ?? []
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function destroy($id)
    {
        $this->service->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Xóa sản phẩm thành công'
        ]);
    }
}
