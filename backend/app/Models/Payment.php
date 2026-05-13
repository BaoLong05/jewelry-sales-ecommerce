<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'payment_date',
        'amount',
        'method',
        'status',           
        'idempotency_key', 
        'payment_token',    
        'transaction_ref',  
        'gateway_response', 
        'paid_at',          
    ];

    protected $casts = ['gateway_response' => 'array']; 

    public function order() { return $this->belongsTo(Order::class); }
}