<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:15'],
            'address' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'current_password' => ['nullable', 'string', 'required_with:password'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui long nhap ho ten.',
            'phone.max' => 'So dien thoai khong duoc vuot qua 15 ky tu.',
            'current_password.required_with' => 'Vui long nhap mat khau hien tai.',
            'password.min' => 'Mat khau moi phai co it nhat 6 ky tu.',
            'password.confirmed' => 'Xac nhan mat khau moi khong khop.',
        ];
    }
}
