<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use App\Models\Role;

class PermissionController extends Controller
{
    //lay ra danh sach phan quyen 
    public function index()
    {
        $permissions = Permission::all()->groupBy('module');
        return response()->json($permissions);
    }

    //gan permission cho role
    public function assignPermissions(Request $request)
    {
        $role = Role::findOrFail($request->role_id);

        $role->permissions()->sync($request->permission_ids);

        return response()->json([
            'message' => 'Permissions updated'
        ]);
    }
}
