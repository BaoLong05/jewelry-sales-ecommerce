<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;


//api đăng nhập, đăng ký, lấy user hiện tại, đăng xuất
Route::prefix('auth')->group(function () {

    Route::post('/google', [AuthController::class, 'loginWithGoogle']);
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


//api danh muc
Route::prefix('v1')->group(function () {

    // all 
    Route::get('/category', [CategoryController::class, 'index']);
    //tim kiem
    Route::get('/category/{id}', [CategoryController::class, 'show']);

    // staff - admin
    Route::middleware(['auth:sanctum', 'permission:category.create'])
        ->post('/category', [CategoryController::class, 'store']);

    Route::middleware(['auth:sanctum', 'permission:category.update'])
        ->put('/category/{id}', [CategoryController::class, 'update']);

    Route::middleware(['auth:sanctum', 'permission:category.delete'])
        ->delete('/category/{id}', [CategoryController::class, 'destroy']);
});
