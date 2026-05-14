<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();

        foreach ($categories as $category) {
            for ($i = 1; $i <= 5; $i++) {
                Product::create([
                    'name' => $category->name . " " . $i,
                    'slug' => strtolower($category->slug . "-" . $i),
                    'description' => 'Sản phẩm test',
                    'price' => rand(1000, 10000),
                    'stock' => rand(10, 50),
                    'category_id' => $category->id
                ]);
            }
        }
    }
}
