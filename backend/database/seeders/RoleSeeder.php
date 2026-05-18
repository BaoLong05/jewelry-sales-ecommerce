<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['admin', 'staff', 'user'] as $role) {
            Role::updateOrCreate(['name' => $role], ['name' => $role]);
        }
    }
}
