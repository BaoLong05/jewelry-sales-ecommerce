<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required'
        ];
    }

    public function messages(): array
    {
        return [
            //email
            'email.required' => 'Email không được để trống!',
            'email.email' => 'Email không đúng định dạng!',

            //passowrd
            'password.required' => 'Mật khẩu không được để trống'
        ];
    }
}
