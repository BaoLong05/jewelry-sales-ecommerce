<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\AuthException;
use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    protected $authService;
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    //dang ky
    public function register(RegisterRequest $request)
    {
        $data = $this->authService->register($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký tài khoản thành công!',
            'data' => $data
        ], 201);
    }
    //dang nhap
    public function login(LoginRequest $request)
    {
        $data = $this->authService->login($request->validated());
        if (!$data) {
            throw new AuthException('Email hoặc mật khẩu không đúng!');
        }
        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'data' => $data
        ]);
    }

    //lay thong tin dang nhap hien tai
    public function me(Request $request)
    {
        $user = $this->authService->me($request->user());
        return response()->json([
            'data' => $user
        ]);
    }

    //dang xuat
    public function logout(Request $request)
    {
        $this->authService->logout($request->user());
        return response()->json([
            'message' => 'Đăng xuất thành công!'
        ]);
    }
}
