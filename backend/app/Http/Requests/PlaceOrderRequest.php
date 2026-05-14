<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlaceOrderRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'cart_item_ids'   => 'required|array|min:1',
            'cart_item_ids.*' => 'integer|exists:cart_items,id',
            'address_id'      => [
                'required',
                'integer',
                Rule::exists('addresses', 'id')->where('user_id', $this->user()->id),
            ],
            'payment_method'  => 'required|in:cod,bank_transfer,momo,vnpay',
        ];
    }

    public function messages()
    {
        return [
            'cart_item_ids.required'  => 'Vui lòng chọn sản phẩm',
            'address_id.required'     => 'Vui lòng chọn địa chỉ giao hàng',
            'address_id.exists'       => 'Địa chỉ không hợp lệ hoặc không thuộc tài khoản của bạn',
            'payment_method.in'       => 'Phương thức thanh toán không hợp lệ',
        ];
    }
}