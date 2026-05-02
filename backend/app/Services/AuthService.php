<?php

namespace App\Services;

use App\Exceptions\AuthException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use App\Exceptions\Auth\InvalidGoogleTokenException;

class AuthService
{
    //dang nhap bang google
    public function loginWithGoogle(string $token): array
    {
        try {
            /** @var \Laravel\Socialite\Two\GoogleProvider $google */
            $google = Socialite::driver('google');

            $googleUser = $google->userFromToken($token);
        } catch (\Exception $e) {
            throw new InvalidGoogleTokenException();
        }

        $user = User::updateOrCreate([
            'email' => $googleUser->getEmail()
        ], [
            'name' => $googleUser->getName(),
            'password' => bcrypt(Str::random(16))
        ]);

        $accessToken = $user->createToken('token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $accessToken
        ];
    }
    //dang ky
    public function register($data)
    {
        $user = User::create([
            'name' => $data['name'],
            'phone' => $data['phone'],
            'address' => $data['address'],
            'email' => $data['email'],
            'password' => Hash::make($data['password'])
        ]);

        //gan role mac dinh
        $user->assignRole('user');
        $token = $user->createToken('Token')->plainTextToken;

        return [
            'user' => $user->load('roles'),
            'token' => $token
        ];
    }

    //dang nhap
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

        return [
            'user' => $user->load('roles'),
            'token' => $token
        ];
    }

    //lay tai khoan dang dang nhap
    public function me($user)
    {
        if (!$user) {
            throw new AuthException('Không có người dùng!');
        }
        return $user->load('roles');
    }

    //dang xuat
    public function logout($user)
    {
        if (!$user) {
            throw new AuthException('Không có người dùng!');
        }
        $user->tokens()->delete();
        return true;
    }
}
