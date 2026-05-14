<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CategoryService;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Illuminate\Http\Request;
use Symfony\Component\Console\Input\Input;

class CategoryController extends Controller
{
    protected $service;

    public function __construct(CategoryService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $data = $this->service->getAll($request);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->getById($id)
        ]);
    }

    public function store(StoreCategoryRequest $request)
    {
        $data = $this->service->create($request->validated());

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function update(UpdateCategoryRequest $request, $id)
    {
         try {
        $data = $this->service->update($id, $request->validated());
        return response()->json(['success' => true, 'data' => $data]);
    } catch (\App\Exceptions\CategoryException $e) {
        // notFound → 404, các lỗi CategoryException khác → 422
        return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
    } catch (\Exception $e) {
        $status = str_contains($e->getMessage(), 'reload') ? 409 : 500;
        return response()->json(['success' => false, 'message' => $e->getMessage()], $status);
    }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $this->service->delete($id, $request->input('updated_at'));
            return response()->json([
                'success' => true,
                'message' => "Xóa thành công!"
            ]);
        } catch (\App\Exceptions\CategoryException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        } catch (\Exception $e) {
            $status =   str_contains($e->getMessage(), 'reload') ? 409 : 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $status);
        }
    }
}
