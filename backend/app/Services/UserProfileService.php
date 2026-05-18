<?php

namespace App\Services;

use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserProfileService
{
    public function show($user)
    {
        return $user->load(['roles', 'addresses']);
    }

    public function update($user, array $data)
    {
        $payload = [];

        foreach (['name', 'phone', 'address'] as $field) {
            if (array_key_exists($field, $data)) {
                $payload[$field] = $data[$field];
            }
        }

        if (!empty($data['password'])) {
            if (empty($data['current_password']) || !Hash::check($data['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Mat khau hien tai khong dung.'],
                ]);
            }

            $payload['password'] = Hash::make($data['password']);
        }

        if (!empty($payload)) {
            $user->update($payload);
        }

        return $this->show($user->fresh());
    }
}
