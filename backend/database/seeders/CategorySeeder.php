<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::insert([
            ['name' => 'Nhẫn', 'slug' => 'nhan'],
            ['name' => 'Dây chuyền', 'slug' => 'day-chuyen'],
            ['name' => 'Bông tai', 'slug' => 'bong-tai'],
        ]);
    }
}
