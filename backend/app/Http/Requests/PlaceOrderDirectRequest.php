<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlaceOrderDirectRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'product_id'     => 'required|integer|exists:products,id',
            'quantity'        => 'required|integer|min:1',
            'address_id'      => [
                'required',
                'integer',
                Rule::exists('addresses', 'id')->where('user_id', $this->user()->id),
            ],
            'payment_method'  => 'required|in:cod,bank_transfer,momo,vnpay',
        ];
    }
}