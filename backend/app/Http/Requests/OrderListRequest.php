<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function perpareForValidation(): void
    {
        if ($this->filled('per_page')) {
            $this->merge([
                'per_page' => (int) $this->per_page
            ]);
        }
    }
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => [
                'nullable',
                'string',
                'in:pending,paid,shipping,completed,cancelled,confirmed,processing,delivered,refunded',
            ],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    //in ra message
    public function messages(): array
    {
        return [
            'search.string' => 'Ký tự tìm kiếm không hợp lệ!',
            'search.max' => 'Tìm kiếm không được vượt quá 255 ký tự!',

            'status.string' => 'Trạng thái không không phải là chuỗi!',
            'status.in' => 'Trạng thái đơn hàng không hợp lệ',

            'user_id.exists' => 'Người dùng không tồn tại!',
            'date_to.after_or_equal' => 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.',
            'per_page.min' => 'Số bản ghi mỗi trang phải lớn hơn 0.',
            'per_page.max' => 'Số bản ghi mỗi trang không được vượt quá 100.',
        ];
    }
}
