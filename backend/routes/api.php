<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PermissionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// api permission tick man cho admin
Route::middleware('auth:sanctum')->prefix('permissions')->group(function () {
    Route::get('/', [PermissionController::class, 'index']);
    Route::post('/assign', [PermissionController::class, 'assignPermissions']);
});
