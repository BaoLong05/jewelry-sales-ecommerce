<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    //ham validate
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    //in thong bao loi
    public function messages(): array
    {
        return [
            'product_id.required' => 'Vui lòng cung cấp sản phẩm.',
            'product_id.exists'   => 'Sản phẩm không tồn tại.',
            'quantity.integer'    => 'Số lượng phải là số nguyên.',
            'quantity.min'        => 'Số lượng tối thiểu là 1.',
            'quantity.max'        => 'Số lượng tối đa là 100.',
        ];
    }
}