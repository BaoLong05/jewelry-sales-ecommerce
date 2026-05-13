<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'rating_avg',
        'rating_count',
        'category_id'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
    public function discounts()
    {
        return $this->belongsToMany(Discount::class, 'product_discounts');
    }

    public function activeDiscounts()
    {
        return $this->discounts()
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    public function getDiscountedPrice(): float
    {
        $discount = $this->activeDiscounts()->first();
        if (!$discount) return (float) $this->price;

        return match ($discount->type) {
            'percent'  => $this->price * (1 - $discount->value / 100),
            'fixed'    => max(0, $this->price - $discount->value),
            'freeship' => (float) $this->price,
            default    => (float) $this->price,
        };
    }
}
