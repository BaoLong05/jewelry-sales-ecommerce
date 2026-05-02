<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\AuthController;


//api đăng nhập, đăng ký, lấy user hiện tại, đăng xuất
Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

//api phân quyền màn hình
Route::middleware(['auth:sanctum', 'permission:manage_users'])
    ->prefix('permissions')
    ->group(function () {

        Route::get('/', [PermissionController::class, 'index']);
        Route::post('/assign', [PermissionController::class, 'assignPermissions']);
    });
