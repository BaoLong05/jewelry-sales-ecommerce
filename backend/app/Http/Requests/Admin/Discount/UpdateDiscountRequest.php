<?php

namespace App\Http\Requests\Admin\Discount;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDiscountRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                => ['sometimes', 'string', 'max:255'],
            'type'                => ['sometimes', Rule::in(['percent', 'fixed', 'freeship'])],
            'value'               => ['sometimes', 'numeric', 'min:0'],
            'start_date'          => ['sometimes', 'date'],
            'end_date'            => ['sometimes', 'date', 'after:start_date'],
            'min_order_amount'    => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'product_ids'         => ['nullable', 'array'],
            'product_ids.*'       => ['integer', 'exists:products,id'],
        ];
    }
}