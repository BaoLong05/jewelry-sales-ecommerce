<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $roles): mixed
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $allowedRoles = explode('|', $roles);
        $userRole = $user->role?->name
                 ?? $user->roles?->pluck('name');

        if ($user->role instanceof \App\Models\Role) {
            if (!in_array($user->role->name, $allowedRoles)) {
                return response()->json(['message' => 'Không có quyền truy cập.'], 403);
            }
            return $next($request);
        }
        if ($user->roles) {
            $userRoles = $user->roles->pluck('name')->toArray();
            if (empty(array_intersect($userRoles, $allowedRoles))) {
                return response()->json(['message' => 'Không có quyền truy cập.'], 403);
            }
            return $next($request);
        }

        return response()->json(['message' => 'Không có quyền truy cập.'], 403);
    }
}