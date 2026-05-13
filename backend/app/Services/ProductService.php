<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ProductException;

class ProductService
{
    public function authorize(): bool
    {
        return true;
    }
    // danh sach - tim kiem - phan trang
    public function getAll($request)
    {
        $query = Product::with([
            'category',
            'images',
            'discounts' => fn($q) => $q
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
        ]);

        // Tìm kiếm theo tên hoặc id
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('id', $search);
            });
        }

        // Lọc theo danh mục
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // sap xep 
        switch ($request->sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            default:
                $query->orderBy('id', 'desc');
        }

        return $query->paginate(8);
    }

    // chi tiet san pham
    public function getById($id)
    {
        $product = Product::with([
            'images',
            'category',
            'discounts' => fn($q) => $q
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
        ])->find($id);

        if (!$product) {
            throw ProductException::notFound();
        }

        return $product;
    }

    // them san pham
    public function create($data, $files = [])
    {
        return DB::transaction(function () use ($data, $files) {

            // SLUG UNIQUE
            $slug = Str::slug($data['name']);
            $baseSlug = $slug;
            $count = 1;

            while (Product::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $count++;
            }

            $product = Product::create([
                'name' => $data['name'],
                'slug' => $slug,
                'description' => $data['description'] ?? null,
                'price' => $data['price'],
                'stock' => $data['stock'],
                'category_id' => $data['category_id'],
            ]);

            if (!empty($files)) {

                if (count($files) > 5) {
                    throw new \Exception("Chỉ được upload tối đa 5 ảnh");
                }

                $mainIndex = (int) ($data['main_index'] ?? 0);

                // clamp index
                $mainIndex = max(0, $mainIndex);
                $mainIndex = min($mainIndex, count($files) - 1);

                $destination = public_path('storage/products');
                if (!file_exists($destination)) {
                    mkdir($destination, 0777, true);
                }

                foreach ($files as $index => $file) {

                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $file->move($destination, $filename);

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url'  => 'storage/products/' . $filename,
                        'is_main'    => $index === $mainIndex,
                        'sort_order' => $index,
                    ]);
                }
            }

            return $product->load('images');
        });
    }

    // cap nhat
    public function update($id, $data, $files = [])
    {
        return DB::transaction(function () use ($id, $data, $files) {

            $product = Product::find($id);
            if (!$product) {
                throw ProductException::notFound();
            }

            $product->update([
                'name'        => $data['name'],
                'slug'        => Str::slug($data['name']),
                'description' => $data['description'] ?? null,
                'price'       => $data['price'],
                'stock'       => $data['stock'],
                'category_id' => $data['category_id'],
            ]);

            if ($files instanceof \Illuminate\Http\UploadedFile) {
                $files = [$files];
            }
            if (!is_array($files)) {
                $files = [];
            }
            $files = array_values(
                array_filter($files, fn($f) => $f instanceof \Illuminate\Http\UploadedFile)
            );

            $mainIndex = (int) ($data['main_index'] ?? 0);

            if (count($files) > 0) {

                if (count($files) > 5) {
                    throw new \Exception("Tối đa 5 ảnh");
                }

                // Xóa ảnh cũ
                foreach ($product->images as $img) {
                    $oldPath = public_path($img->image_url);
                    if (file_exists($oldPath)) {
                        unlink($oldPath);
                    }
                }
                $product->images()->delete();

                $destination = public_path('storage/products');
                if (!file_exists($destination)) {
                    mkdir($destination, 0777, true);
                }

                foreach ($files as $index => $file) {
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $file->move($destination, $filename);

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url'  => 'storage/products/' . $filename,
                        'is_main'    => $index === $mainIndex,
                        'sort_order' => $index,
                    ]);
                }
            }
            // khong upload anh moi - de anh cu

            return $product->load('images');
        });
    }

    // xoa
    public function delete($id)
    {
        $product = Product::find($id);

        if (!$product) {
            throw ProductException::notFound();
        }

        $product->delete();

        return true;
    }
}
