<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

    public function update(StoreAddressRequest $request, $id)
    {
        $user = Auth::user();
        $address = $user->addresses()->findOrFail($id);

        if ($request->is_default) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($request->validated());

        return response()->json(['data' => $address->fresh()]);
    }

    public function destroy($id)
    {
        $address = Auth::user()->addresses()->findOrFail($id);
        $address->delete();

        return response()->json([
            'message' => 'Xoa dia chi thanh cong.',
        ]);
    }
}
