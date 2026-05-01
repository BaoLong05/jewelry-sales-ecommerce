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
        'end_date'
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_discounts');
    }
}
