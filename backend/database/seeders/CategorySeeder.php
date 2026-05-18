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

        $this->upsertCategory('Nhẫn', $jewelry->id);
        $this->upsertCategory('Dây chuyền', $jewelry->id);
        $this->upsertCategory('Bông tai', $jewelry->id);
        $this->upsertCategory('Lắc tay', $jewelry->id);
        $this->upsertCategory('Đồng hồ nam', $watch->id);
        $this->upsertCategory('Đồng hồ nữ', $watch->id);
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
