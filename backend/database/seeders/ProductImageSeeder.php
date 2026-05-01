<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        foreach ($products as $product) {
            for ($i = 1; $i <= 3; $i++) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => "https://via.placeholder.com/300?text=Product+" . $product->id . "-" . $i,
                    'is_main' => $i === 1,
                    'sort_order' => $i
                ]);
            }
        }
    }
}
