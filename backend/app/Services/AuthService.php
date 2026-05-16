<?php

namespace App\Services;

use App\Exceptions\AuthException;
use App\Models\User;
use App\Services\Admin\ActivityLogService;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use App\Exceptions\Auth\InvalidGoogleTokenException;

class AuthService
{
    public function __construct(
        private readonly ActivityLogService $activityLogService
    ) {}

    public function loginWithGoogle(string $token): array
    {
        try {
            $google = Socialite::driver('google');
            $googleUser = $google->userFromToken($token);
        } catch (\Exception $e) {
            throw new InvalidGoogleTokenException();
        }

        $user = User::updateOrCreate([
            'email' => $googleUser->getEmail()
        ], [
            'name'     => $googleUser->getName(),
            'password' => bcrypt(Str::random(16))
        ]);

        $accessToken = $user->createToken('token')->plainTextToken;

        // Ghi log
        $this->activityLogService->logLogin($user->id);
        $this->activityLogService->log(
            userId:      $user->id,
            action:      'login_google',
            module:      'auth',
            description: "Đăng nhập bằng Google: {$user->email}",
        );

        return ['user' => $user, 'token' => $accessToken];
    }

    public function register($data)
    {
        $user = User::create([
            'name'     => $data['name'],
            'phone'    => $data['phone'],
            'address'  => $data['address'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password'])
        ]);

        $user->assignRole('user');
        $token = $user->createToken('Token')->plainTextToken;

        // Ghi log
        $this->activityLogService->log(
            userId:      $user->id,
            action:      'register',
            module:      'auth',
            description: "Đăng ký tài khoản: {$user->email}",
        );

        return ['user' => $user->load('roles'), 'token' => $token];
    }

    public function login($data)
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            throw new AuthException("Email không tồn tại");
        }
        if (!Hash::check($data['password'], $user->password)) {
            throw new AuthException('Mật khẩu không đúng');
        }

        $token = $user->createToken('Token')->plainTextToken;

        // Ghi log
        $this->activityLogService->logLogin($user->id);
        $this->activityLogService->log(
            userId:      $user->id,
            action:      'login',
            module:      'auth',
            description: "Đăng nhập: {$user->email}",
        );

        return ['user' => $user->load('roles'), 'token' => $token];
    }

    public function me($user)
    {
        if (!$user) {
            throw new AuthException('Không có người dùng!');
        }
        return $user->load('roles');
    }

    public function logout($user)
    {
        if (!$user) {
            throw new AuthException('Không có người dùng!');
        }

        // Ghi log trước khi xóa token
        $this->activityLogService->logLogout($user->id);
        $this->activityLogService->log(
            userId:      $user->id,
            action:      'logout',
            module:      'auth',
            description: "Đăng xuất: {$user->email}",
        );

        $user->tokens()->delete();
        return true;
    }
}