<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        $basePath = public_path('storage/products');

        Product::with(['category', 'images'])->orderBy('id')->get()->each(function (Product $product) use ($basePath) {
            $product->images()->delete();

            $imagePaths = $this->productImagePaths($basePath, $product);

            if (empty($imagePaths)) {
                if ($this->command) {
                    $this->command->warn("No images found for product: {$product->name}");
                }

                return;
            }

            foreach (array_slice($imagePaths, 0, 3) as $index => $imagePath) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $imagePath,
                    'is_main' => $index === 0,
                    'sort_order' => $index + 1,
                ]);
            }
        });
    }

    private function productImagePaths(string $basePath, Product $product): array
    {
        foreach ($this->pathCandidates($basePath, $product) as $directory) {
            if (!File::isDirectory($directory)) {
                continue;
            }

            return collect(File::files($directory))
                ->filter(fn ($file) => in_array(Str::lower($file->getExtension()), ['jpg', 'jpeg', 'png', 'webp']))
                ->sortBy(fn ($file) => $file->getFilename(), SORT_NATURAL)
                ->values()
                ->take(3)
                ->map(fn ($file) => 'storage/products/'
                    . basename(dirname($directory))
                    . '/'
                    . basename($directory)
                    . '/'
                    . $file->getFilename())
                ->all();
        }

        return [];
    }

    private function pathCandidates(string $basePath, Product $product): array
    {
        $categoryName = $product->category ? $product->category->name : '';
        $categorySlug = $product->category ? $product->category->slug : null;

        $categorySlugs = $this->slugCandidates($categoryName);
        $categorySlugs[] = $categorySlug;

        $productSlugs = $this->slugCandidates($product->name);
        $productSlugs[] = $product->slug;

        $paths = [];
        foreach (array_filter(array_unique($categorySlugs)) as $categorySlug) {
            foreach (array_filter(array_unique($productSlugs)) as $productSlug) {
                $paths[] = $basePath . DIRECTORY_SEPARATOR . $categorySlug . DIRECTORY_SEPARATOR . $productSlug;
            }
        }

        return array_unique($paths);
    }

    private function slugCandidates(string $value): array
    {
        return array_unique([
            Str::slug($value),
            Str::slug(str_replace(['Đ', 'đ'], '', $value)),
        ]);
    }
}
