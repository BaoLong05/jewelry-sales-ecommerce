<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\RefundRequest;
use App\Models\Product;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'original_price',
        'discount_amount'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',

    ];


    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function review()
    {
        return $this->hasOne(Review::class, 'product_id', 'product_id')
            ->whereColumn('order_id', 'order_items.order_id')
            ->where('user_id', $this->order?->user_id);
    }

    //yeu cau hoan hang cho don hang nay
    public function refundRequest()
    {
        return $this->hasOne(refundRequest::class);
    }

    public function isReview(): bool
    {
        return Review::where('order_id', $this->order_id)
            ->where('product_id', $this->product_id)
            ->where('user_id', $this->order->user_id)
            ->exists();
    }

    public function canReview(): bool
    {
        return $this->order && $this->order->isCompleted() && $this->order->isReview();
    }

    public function requesRefunded(): bool
    {
        return $this->order && $this->order->isCompleted();
    }
}
