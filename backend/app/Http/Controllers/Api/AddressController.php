<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreAddressRequest;

class AddressController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Auth::user()->load('addresses')->addresses
        ]);
    }

   public function store(StoreAddressRequest $request)
{
    $user = Auth::user();

    if ($request->is_default) {
        $user->addresses()->update(['is_default' => false]);
    }

    $address = $user->addresses()->create($request->validated());

    return response()->json(['data' => $address], 201);
}
}
