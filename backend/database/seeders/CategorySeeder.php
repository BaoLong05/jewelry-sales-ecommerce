<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jewelry = Category::create([
            'name' => 'Trang sức',
            'slug' => Str::slug('Trang sức')
        ]);

        $watch = Category::create([
            'name' => 'Đồng hồ',
            'slug' => Str::slug('Đồng hồ')
        ]);

        Category::create([
            'name' => 'Nhẫn',
            'slug' => Str::slug('Nhẫn'),
            'parent_id' => $jewelry->id
        ]);

        Category::create([
            'name' => 'Dây chuyền',
            'slug' => Str::slug('Dây chuyền'),
            'parent_id' => $jewelry->id
        ]);

        Category::create([
            'name' => 'Bông tai',
            'slug' => Str::slug('Bông tai'),
            'parent_id' => $jewelry->id
        ]);

        Category::create([
            'name' => 'Đồng hồ nam',
            'slug' => Str::slug('Đồng hồ nam'),
            'parent_id' => $watch->id
        ]);

        Category::create([
            'name' => 'Đồng hồ nữ',
            'slug' => Str::slug('Đồng hồ nữ'),
            'parent_id' => $watch->id
        ]);
    }
}
