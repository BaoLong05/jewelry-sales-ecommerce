<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Permission::insert([
            // PRODUCT
            ['name' => 'view_product', 'module' => 'product'],
            ['name' => 'create_product', 'module' => 'product'],
            ['name' => 'update_product', 'module' => 'product'],
            ['name' => 'delete_product', 'module' => 'product'],

            // ORDER
            ['name' => 'manage_orders', 'module' => 'order'],

            // USER
            ['name' => 'manage_users', 'module' => 'user'],
        ]);

        $admin = Role::where('name', 'admin')->first();
        $permissions = Permission::pluck('id');

        $admin->permissions()->sync($permissions);
    }
}
