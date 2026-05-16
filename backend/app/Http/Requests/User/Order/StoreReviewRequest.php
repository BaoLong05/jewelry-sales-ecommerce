<?php

namespace App\Http\Requests\User\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
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
            'rating'    => ['required', 'integer', 'min:1', 'max:5'],
            'comment'   => ['nullable', 'string', 'max:1000'],
            'images'    => ['nullable', 'array', 'max:5'],
            'images.*'  => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages()
    {
        return [
            'rating.required' => 'Vui lòng chọn số sao đánh giá.',
            'rating.min'      => 'Đánh giá tối thiểu 1 sao.',
            'rating.max'      => 'Đánh giá tối đa 5 sao.',
            'comment.max'     => 'Nhận xét không quá 1000 ký tự.',
            'images.max'      => 'Tối đa 5 ảnh cho mỗi đánh giá.',
            'images.*.image'  => 'File phải là hình ảnh.',
            'images.*.max'    => 'Mỗi ảnh không quá 2MB.',
        ];
    }
}
