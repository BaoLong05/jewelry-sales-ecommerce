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

    protected $casts = [
        'start_date'          => 'datetime',
        'end_date'            => 'datetime',
        'value'               => 'decimal:2',
        'min_order_amount'    => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
    ];

    const TYPE_PERCENT  = 'percent';
    const TYPE_FIXED    = 'fixed';
    const TYPE_FREESHIP = 'freeship';

    const TYPE_LABELS = [
        'percent'  => 'Giảm theo %',
        'fixed'    => 'Giảm tiền cố định',
        'freeship' => 'Miễn phí vận chuyển',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_discounts');
    }

    public function isActive(): bool
    {
        return now()->between($this->start_date, $this->end_date);
    }

    public function getTypeLabelAttribute(): string
    {
        return self::TYPE_LABELS[$this->type] ?? $this->type;
    }
    public function calcDiscountedPrice(float $originalPrice): float
    {
        return match ($this->type) {
            self::TYPE_PERCENT  => $originalPrice * (1 - $this->value / 100),
            self::TYPE_FIXED    => max(0, $originalPrice - $this->value),
            self::TYPE_FREESHIP => $originalPrice, 
            default             => $originalPrice,
        };
    }
}