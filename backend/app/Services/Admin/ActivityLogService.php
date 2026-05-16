<?php

namespace App\Services\Admin;

use App\Models\ActivityLog;
use App\Models\LoginLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ActivityLogService
{
    //ghi activity log
    public function log(
        ?int $userId,
        string $action,
        string $module,
        ?string $description = null,
        ?string $ip = null,
        ?string $userAgent = null
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'ip_address' => $ip ?? request()->ip(),
            'user_agent' => $userAgent ?? request()->userAgent()
        ]);
    }

    //ghi lai log
    public function logLogin(int $userId): LoginLog
    {
        return LoginLog::create([
            'user_id' => $userId,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'login_at' => now(),
            'last_activity' => now()
        ]);
    }

    //ghi logout
    public function logLogout(int $userId): void
    {
        $log = LoginLog::where('user_id', $userId)
            ->whereNull('logout_at')
            ->latest('login_at')
            ->first();

        if ($log) {
            $duration = $log->login_at->diffInSeconds(now());
            $log->update([
                'logout_at' => now(),
                'duration' => $duration
            ]);
        }
    }

    //danh sach activity log
    public function listActivityLogs(array $filters): LengthAwarePaginator
{
    return ActivityLog::with('user:id,name,email')
        ->when($filters['user_id'] ?? null, fn($q, $v) => $q->where('user_id', $v))
        ->when($filters['module']  ?? null, fn($q, $v) => $q->where('module', $v))
        ->when($filters['action']  ?? null, fn($q, $v) => $q->where('action', $v))
        ->latest()
        ->paginate($filters['per_page'] ?? 20);
}

    // danh sach login log
    public function listLoginLogs(array $filters): LengthAwarePaginator
    {
        return LoginLog::with('user:id,name,email')
            ->when($filters['user_id'] ?? null, fn($q, $v) => $q->where('user_id', $v))
            ->latest('login_at')
            ->paginate($filters['per_page'] ?? 20);
    }
}
