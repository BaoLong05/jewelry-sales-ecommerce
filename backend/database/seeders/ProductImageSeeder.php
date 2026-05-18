<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    private array $palettes = [
        ['FEF3C7', '92400E'],
        ['FCE7F3', '9D174D'],
        ['E0F2FE', '075985'],
        ['ECFDF5', '047857'],
        ['F5F3FF', '6D28D9'],
        ['FFF7ED', 'C2410C'],
        ['F8FAFC', '334155'],
        ['FAE8FF', 'A21CAF'],
    ];

    public function run(): void
    {
        Product::with('images')->orderBy('id')->get()->each(function (Product $product, int $index) {
            $product->images()->delete();

            for ($sort = 1; $sort <= 3; $sort++) {
                [$background, $text] = $this->palettes[($index + $sort - 1) % count($this->palettes)];
                $imageText = rawurlencode($product->name . ' ' . $sort);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => "https://placehold.co/900x900/{$background}/{$text}.png?text={$imageText}",
                    'is_main' => $sort === 1,
                    'sort_order' => $sort,
                ]);
            }
        });
    }
}
