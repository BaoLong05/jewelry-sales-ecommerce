<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    protected $fillable = [
        'name',
        'type',
        'value',
        'start_date',
        'end_date',
        'min_order_amount',    
        'max_discount_amount', 
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_discounts');
    }

    public function isActive(): bool 
    {
        return now()->between($this->start_date, $this->end_date);
    }
}