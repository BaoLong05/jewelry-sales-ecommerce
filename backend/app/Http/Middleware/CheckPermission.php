<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{

    public function handle(Request $request, Closure $next, $permission)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        //kiem tra 
        if (!$user || !$user->hasPermission($permission)) {
            return response()->json(
                ["message" => "Forbidden"],
                403
            );
        }
        return $next($request);
    }
}
