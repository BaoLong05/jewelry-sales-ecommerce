<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_code', 'total_price',
        'discount_amount', 'status', 'address',
        'payment_method',
    ];

    protected $casts = ['address' => 'array'];

    public function user()    { return $this->belongsTo(User::class); }
    public function items()   { return $this->hasMany(OrderItem::class); }
    public function payment() { return $this->hasOne(Payment::class); }
}