<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Str;
use App\Exceptions\CategoryException;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CategoryService
{
    //danh sach danh muc 
    public function getAll(Request $request)
    {
        $query = Category::with('children')
            ->whereNull('parent_id');

        // tim kiem
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('id', $search);
            });
        }

        // phan trang
        return $query->orderBy('id', 'asc')->paginate(15);
    }

    public function getById($id)
    {
        $category = Category::with('children')->find($id);

        if (!$category) {
            throw CategoryException::notFound();
        }

        return $category;
    }

    //Them danh muc
    public function create($data)
    {
        return Category::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'parent_id' => $data['parent_id'] ?? null
        ]);
    }

    //cap nhat danh muc
    public function update($id, $data)
    {
        $category = Category::find($id);

        if (!$category) {
            throw CategoryException::notFound();
        }

        // kiem tra sua trung
        if (isset($data['updated_at']) && $category->updated_at) {

            $clientTime = Carbon::parse($data['updated_at']);
            $serverTime = $category->updated_at;

            // so sanh 
            if (!$clientTime->equalTo($serverTime)) {
                throw new CategoryException(
                    "Dữ liệu đã được cập nhật bởi người khác. Vui lòng reload!"
                );
            }
        }

        $category->update([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'parent_id' => $data['parent_id'] ?? null
        ]);

        return $category;
    }
    //xoa danh muc
    public function delete($id)
    {
        $category = Category::with(['children', 'products'])->find($id);

        if (!$category) {
            throw CategoryException::notFound();
        }

        if ($category->children->count() > 0 || $category->products->count() > 0) {
            throw CategoryException::cannotDelete();
        }

        $category->delete();

        return true;
    }
}
