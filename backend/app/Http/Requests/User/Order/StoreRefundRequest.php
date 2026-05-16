<?php

namespace App\Http\Requests\User\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreRefundRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [
            'reason'   => ['required', 'string', 'min:20', 'max:1000'],
            'images'   => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages()
    {
        return [
            'reason.required' => 'Vui lòng nhập lý do hoàn hàng.',
            'reason.min'      => 'Lý do phải có ít nhất 20 ký tự để mô tả rõ vấn đề.',
            'reason.max'      => 'Lý do không quá 1000 ký tự.',
            'images.max'      => 'Tối đa 5 ảnh minh chứng.',
            'images.*.max'    => 'Mỗi ảnh không quá 2MB.',
        ];
    }
}
