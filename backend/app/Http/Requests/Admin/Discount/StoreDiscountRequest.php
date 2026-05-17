<?php

namespace App\Http\Requests\Admin\Discount;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDiscountRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                => ['required', 'string', 'max:255'],
            'type'                => ['required', Rule::in(['percent', 'fixed', 'freeship'])],
            'value'               => ['required_unless:type,freeship', 'numeric', 'min:0'],
            'start_date'          => ['required', 'date'],
            'end_date'            => ['required', 'date', 'after:start_date'],
            'min_order_amount'    => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'product_ids'         => ['nullable', 'array'],
            'product_ids.*'       => ['integer', 'exists:products,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Vui lòng nhập tên chương trình.',
            'type.required'        => 'Vui lòng chọn loại giảm giá.',
            'type.in'              => 'Loại giảm giá không hợp lệ.',
            'value.required_unless'=> 'Vui lòng nhập giá trị giảm.',
            'value.min'            => 'Giá trị giảm phải lớn hơn 0.',
            'end_date.after'       => 'Ngày kết thúc phải sau ngày bắt đầu.',
            'product_ids.*.exists' => 'Sản phẩm không tồn tại.',
        ];
    }
}