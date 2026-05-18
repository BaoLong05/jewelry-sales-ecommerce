<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'phone' => '0901000001',
                'address' => 'Lumina Admin Office',
                'role' => 'admin',
            ],
            [
                'name' => 'Staff',
                'email' => 'staff@gmail.com',
                'phone' => '0901000002',
                'address' => 'Lumina Store',
                'role' => 'staff',
            ],
            [
                'name' => 'User',
                'email' => 'user@gmail.com',
                'phone' => '0901000003',
                'address' => '123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh',
                'role' => 'user',
            ],
        ];

        foreach ($users as $item) {
            $user = User::updateOrCreate(
                ['email' => $item['email']],
                [
                    'name' => $item['name'],
                    'phone' => $item['phone'],
                    'address' => $item['address'],
                    'password' => Hash::make('123123'),
                ]
            );

            $user->assignRole($item['role']);
        }
    }
}
