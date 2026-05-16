<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_SHIPPING = 'shipping';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REFUNDED = 'refunded';
    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
        self::STATUS_PROCESSING,
        self::STATUS_SHIPPING,
        self::STATUS_DELIVERED,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
        self::STATUS_REFUNDED,
    ];


    protected $fillable = [
        'user_id',
        'order_code',
        'total_price',
        'discount_amount',
        'status',
        'address',
        'payment_method',
    ];

    protected $casts = [
        'address' => 'array',
        'total_price' => 'decimal:2',
        'discount_amount' => 'decimal:2'
    ];

    protected $appends = ['status_label'];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function getStatusLabelAttribute()
    {
        return match ($this->status) {
            'pending'    => 'Chờ xác nhận',
            'confirmed'  => 'Đã xác nhận',
            'processing' => 'Đang chuẩn bị hàng',
            'shipping'   => 'Đang vận chuyển',
            'delivered'  => 'Đã giao hàng',
            'completed'  => 'Hoàn thành',
            'cancelled'  => 'Đã hủy',
            'refunded'   => 'Đã hoàn tiền',
            default      => ucfirst($this->status),
        };
    }

    //helper
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }
    //cho phep binh luan khi don hang hoan thanh
    public function canReview(): bool
    {
        return $this->isCompleted();
    }
    //cho phep gui yeu cau hoan hang khi don hang da hoan thanh
    public function canRequestRefund(): bool
    {
        return $this->isCompleted();
    }

    public const PROGRESS_STEPS  = [
        'pending',
        'confirmed',
        'processing',
        'shipping',
        'delivered',
        'completed',
    ];

    public function currentProgressStep(): int
    {
        $index = array_search($this->status, self::PROGRESS_STEPS);
        return $index !== false ? $index : 0;
    }
}
