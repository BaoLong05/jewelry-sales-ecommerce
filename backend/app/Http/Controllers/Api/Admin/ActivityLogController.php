<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ActivityLog\ListActivityLogRequest;
use App\Http\Requests\Admin\ActivityLog\ListLoginLogRequest;
use App\Services\Admin\ActivityLogService;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $service
    ) {}

    public function activityLogs(ListActivityLogRequest $request): JsonResponse
    {
        $logs = $this->service->listActivityLogs($request->validated());

        return response()->json([
            'success' => true,
            'data'    => $logs->getCollection()->map(fn($log) => [
                'id'          => $log->id,
                'action'      => $log->action,
                'module'      => $log->module,
                'description' => $log->description,
                'ip_address'  => $log->ip_address,
                'user_agent'  => $log->user_agent,
                'created_at'  => $log->created_at->format('d/m/Y H:i:s'),
                'user' => [
                    'id'    => $log->user?->id,
                    'name'  => $log->user?->name,
                    'email' => $log->user?->email,
                ],
            ]),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }

    public function loginLogs(ListLoginLogRequest $request): JsonResponse
    {
        $logs = $this->service->listLoginLogs($request->validated());

        return response()->json([
            'success' => true,
            'data'    => $logs->getCollection()->map(fn($log) => [
                'id'            => $log->id,
                'ip_address'    => $log->ip_address,
                'user_agent'    => $log->user_agent,
                'login_at'      => $log->login_at->format('d/m/Y H:i:s'),
                'logout_at'     => $log->logout_at?->format('d/m/Y H:i:s'),
                'last_activity' => $log->last_activity?->format('d/m/Y H:i:s'),
                'duration'      => $log->duration, // giây
                'user' => [
                    'id'    => $log->user?->id,
                    'name'  => $log->user?->name,
                    'email' => $log->user?->email,
                ],
            ]),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }
}