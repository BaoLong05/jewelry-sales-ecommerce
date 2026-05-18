<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'view_product', 'module' => 'product'],
            ['name' => 'create_product', 'module' => 'product'],
            ['name' => 'update_product', 'module' => 'product'],
            ['name' => 'delete_product', 'module' => 'product'],
            ['name' => 'category.create', 'module' => 'category'],
            ['name' => 'category.update', 'module' => 'category'],
            ['name' => 'category.delete', 'module' => 'category'],
            ['name' => 'manage_orders', 'module' => 'order'],
            ['name' => 'manage_users', 'module' => 'user'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                ['module' => $permission['module']]
            );
        }

        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->permissions()->sync(Permission::pluck('id'));
        }
    }
}
