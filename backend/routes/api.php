<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\AddressController;



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

    // public 
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

Route::prefix('v1')->group(function () {

    // public api 
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{id}', [ProductController::class, 'show']);

    // admin- staff
    Route::middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::post('products', [ProductController::class, 'store']);
        Route::match(['PUT', 'POST'], 'products/{id}', [ProductController::class, 'update']);
        Route::delete('products/{id}', [ProductController::class, 'destroy']);
    });
});

//Cart
Route::prefix('v1')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('cart',              [CartController::class, 'index']);   // danh sach gio hang
        Route::post('cart',              [CartController::class, 'store']);   // them san pham vao gio hang
        Route::put('cart/{cartItemId}', [CartController::class, 'update']); // sua so luong trong gio hang
        Route::delete('cart/{cartItemId}', [CartController::class, 'destroy']); // xoa 1 item
        Route::delete('cart',              [CartController::class, 'clear']);   // xoa toan bo item

    });
});

//checkout 
Route::prefix('v1')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        //them xoa sua dia chi
        Route::get('/addresses',    [AddressController::class, 'index']);
        Route::post('/addresses',   [AddressController::class, 'store']);
        Route::put('/addresses/{id}',    [AddressController::class, 'update']);
        Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);

        //tien hanh thanh toan
        Route::post('/checkout/place-order',            [CheckoutController::class, 'placeOrder']);
        Route::post('/checkout/place-order-direct', [CheckoutController::class, 'placeOrderDirect']);
        Route::get('/checkout/payment-status/{id}',     [CheckoutController::class, 'paymentStatus']);
        //kiem tra token
        Route::get('/checkout/verify-token/{token}',    [CheckoutController::class, 'verifyToken']);
    });

    // Callback 
    Route::match(['GET', 'POST'], '/checkout/callback/{method}', [CheckoutController::class, 'paymentCallback']);
    Route::post('/checkout/bank-webhook',       [CheckoutController::class, 'bankWebhook']);
});
