<?php

namespace Database\Seeders;

use App\Models\Discount;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DiscountSeeder extends Seeder
{
    public function run(): void
    {
        $percentDiscount = Discount::updateOrCreate(
            ['name' => 'Ưu đãi Lumina 15%'],
            [
                'type' => 'percent',
                'value' => 15,
                'start_date' => now()->subDays(7),
                'end_date' => now()->addDays(30),
                'min_order_amount' => 0,
                'max_discount_amount' => 0,
            ]
        );

        $fixedDiscount = Discount::updateOrCreate(
            ['name' => 'Giảm 500 bộ sưu tập nổi bật'],
            [
                'type' => 'fixed',
                'value' => 500,
                'start_date' => now()->subDays(3),
                'end_date' => now()->addDays(20),
                'min_order_amount' => 0,
                'max_discount_amount' => 0,
            ]
        );

        $freeshipDiscount = Discount::updateOrCreate(
            ['name' => 'Freeship toàn quốc'],
            [
                'type' => 'freeship',
                'value' => 0,
                'start_date' => now()->subDay(),
                'end_date' => now()->addDays(45),
                'min_order_amount' => 0,
                'max_discount_amount' => 0,
            ]
        );

        $products = Product::orderBy('id')->pluck('id')->values();

        $percentDiscount->products()->sync($products->slice(0, 8)->all());
        $fixedDiscount->products()->sync($products->slice(8, 6)->all());
        $freeshipDiscount->products()->sync($products->slice(14, 8)->all());
    }
}
