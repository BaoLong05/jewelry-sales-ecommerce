<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            'Nhẫn' => [
                ['Nhẫn Kim Cương Aurora', 9800, 12],
                ['Nhẫn Vàng Trắng Celeste', 7600, 18],
                ['Nhẫn Đính Đá Moonlight', 4300, 24],
                ['Nhẫn Cặp Eternal Love', 6200, 16],
                ['Nhẫn Ruby Scarlet', 8900, 10],
            ],
            'Dây chuyền' => [
                ['Dây Chuyền Ngọc Trai Classic', 6900, 14],
                ['Dây Chuyền Kim Cương Stella', 9900, 8],
                ['Mặt Dây Chuyền Hoa Hồng', 3200, 26],
                ['Dây Chuyền Vàng Ý Lumina', 5700, 20],
                ['Dây Chuyền Sapphire Blue', 8400, 9],
            ],
            'Bông tai' => [
                ['Bông Tai Kim Cương Halo', 7200, 11],
                ['Bông Tai Ngọc Trai Nữ Hoàng', 5100, 15],
                ['Bông Tai Vàng Hồng Petite', 2800, 30],
                ['Bông Tai Emerald Grace', 6300, 13],
                ['Bông Tai Đá Trắng Lily', 3500, 22],
            ],
            'Lắc tay' => [
                ['Lắc Tay Tennis Diamond', 9300, 7],
                ['Lắc Tay Vàng Hồng Charm', 4600, 21],
                ['Lắc Tay Bạc Ý Minimal', 1900, 35],
                ['Lắc Tay Ngọc Trai Belle', 5400, 17],
                ['Lắc Tay Sapphire Night', 7100, 10],
            ],
            'Đồng hồ nam' => [
                ['Đồng Hồ Nam Royal Steel', 6600, 18],
                ['Đồng Hồ Nam Chrono Black', 7400, 15],
                ['Đồng Hồ Nam Classic Gold', 8200, 12],
                ['Đồng Hồ Nam Moonphase', 9700, 6],
            ],
            'Đồng hồ nữ' => [
                ['Đồng Hồ Nữ Rose Petite', 4500, 20],
                ['Đồng Hồ Nữ Pearl Dial', 6800, 13],
                ['Đồng Hồ Nữ Diamond Bezel', 8800, 8],
                ['Đồng Hồ Nữ Milanese Silver', 5600, 19],
            ],
        ];

        foreach ($products as $categoryName => $items) {
            $category = Category::where('slug', Str::slug($categoryName))->first();
            if (!$category) {
                continue;
            }

            foreach ($items as [$name, $price, $stock]) {
                Product::updateOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'name' => $name,
                        'description' => $this->descriptionFor($name, $categoryName),
                        'price' => $price,
                        'stock' => $stock,
                        'rating_avg' => fake()->randomFloat(1, 4.4, 5),
                        'rating_count' => fake()->numberBetween(8, 96),
                        'category_id' => $category->id,
                    ]
                );
            }
        }
    }

    private function descriptionFor(string $productName, string $categoryName): string
    {
        return "{$productName} thuộc bộ sưu tập {$categoryName} của Lumina, phù hợp làm quà tặng hoặc sử dụng hằng ngày.";
    }
}
