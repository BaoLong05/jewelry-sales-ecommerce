<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'string',
                'in:pending,shipping,completed,cancelled,confirmed,processing,delivered,refunded',
            ],
        ];
    }

    //in ra message

    public function messages(): array
    {
        return [
            'status.required' => 'Trạng thái chưa được cập nhật!',
            'status.string' => 'Trạng thái phải là chuỗi!',
            'status.in' => 'Trạng thái không hợp lệ!'
        ];
    }
}
