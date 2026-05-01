<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|regex:/^[0-9]{10,11}$/',
            'address' => 'required|string|max:500',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed'
        ];
    }

    public function messages(): array
    {
        return [

            //name
            'name.required' => 'Tên không được để trống!',
            'name.string' => 'Tên không đúng định dạng!',
            'name.max' => 'Tên không được lớn hơn 255 ký tự!',

            //phone
            'phone.required' => 'Số điện thoại không được để trống!',
            'phone.regex' => 'Số điện thoại phải là số!',

            //address
            'address.required' => 'Địa chỉ không được để trống!',
            'address.string' => 'Địa chỉ phải là chuỗi!',
            'address.max' => 'Địa chỉ không được nhiều hơn 500 ký tự!',

            //email
            'email.unique' => 'Email đã tồn tại hoặc không đúng!',
            'email.required' => 'Email không được để trống!',
            'email.email' => 'Email sai định dạng!',

            //password
            'password.confirmed' => 'Mật khẩu không khớp!',
            'password.min' => 'Mật khẩu không được nhỏ hơn 6 ký tự!',
            'password.required' => 'Mật khẩu không được để trống!',

        ];
    }
}
