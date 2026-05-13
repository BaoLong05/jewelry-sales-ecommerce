<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    /**
     * Authorize
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules
     */
    public function rules(): array
    {
        return [
            'receiver_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:15'],

            'province' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'ward' => ['required', 'string', 'max:255'],

            'street' => ['nullable', 'string', 'max:255'],

            'is_default' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Custom messages
     */
    public function messages(): array
    {
        return [
            'receiver_name.required' => 'Vui lòng nhập tên người nhận',
            'phone.required' => 'Vui lòng nhập số điện thoại',

            'province.required' => 'Vui lòng chọn tỉnh/thành phố',
            'district.required' => 'Vui lòng chọn quận/huyện',
            'ward.required' => 'Vui lòng chọn phường/xã',
        ];
    }
}