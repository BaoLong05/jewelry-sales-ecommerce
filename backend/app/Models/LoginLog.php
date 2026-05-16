<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    protected $fillable = [
        'user_id', 'ip_address', 'user_agent',
        'login_at', 'logout_at', 'last_activity', 'duration'
    ];

    protected $casts = [
        'login_at'      => 'datetime',
        'logout_at'     => 'datetime',
        'last_activity' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}