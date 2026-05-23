<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $jewelry = $this->upsertCategory('Trang sức');
        $watch = $this->upsertCategory('Đồng hồ');

        $jewelryCategories = [
            'Nhẫn',
            'Bông tai',
            'Dây chuyền',
            'Lắc tay',
        ];

        $watchCategories = [
            'Đồng hồ nam',
            'Đồng hồ nữ',
        ];

        foreach ($jewelryCategories as $categoryName) {
            $this->upsertCategory($categoryName, $jewelry->id);
        }

        foreach ($watchCategories as $categoryName) {
            $this->upsertCategory($categoryName, $watch->id);
        }
    }

    private function upsertCategory(string $name, ?int $parentId = null): Category
    {
        return Category::updateOrCreate(
            ['slug' => Str::slug($name)],
            [
                'name' => $name,
                'parent_id' => $parentId,
            ]
        );
    }
}
