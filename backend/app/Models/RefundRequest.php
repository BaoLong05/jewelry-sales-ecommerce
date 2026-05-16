<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefundRequest extends Model
{
    //constrain
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_REFUNDED = 'refunded';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
        self::STATUS_REFUNDED,
    ];

    protected $fillable = [
        'user_id',
        'order_id',
        'order_item_id',
        'reason',
        'images',
        'status',
        'admin_note',
        'processed_at'
    ];

    protected $casts = [
        'images' => 'array',
        'processed_at' => 'datetime'
    ];

    protected $appends = [
        'status_label'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function order_item()
    {
        return $this->belongsTo(OrderItem::class);
    }

    //lay ra status
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'Đang xử lý',
            self::STATUS_APPROVED => 'Đã chấp nhận yêu cầu',
            self::STATUS_REJECTED => 'Yêu cầu bị từ chối',
            self::STATUS_REFUNDED => 'Đã hoàn tiền',
            default => ucfirst($this->status)
        };
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApprove(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function isRefunded(): bool
    {
        return $this->status === self::STATUS_REFUNDED;
    }
}
