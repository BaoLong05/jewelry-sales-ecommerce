<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Services\UserProfileService;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    public function __construct(private readonly UserProfileService $profileService)
    {
    }

    public function show(Request $request)
    {
        return response()->json([
            'data' => $this->profileService->show($request->user()),
        ]);
    }

    public function update(UpdateUserProfileRequest $request)
    {
        return response()->json([
            'message' => 'Cap nhat thong tin thanh cong.',
            'data' => $this->profileService->update($request->user(), $request->validated()),
        ]);
    }
}
