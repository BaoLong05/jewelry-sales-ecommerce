<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{


    public function rules(): array
    {
        return [
            'name' => 'required|string|max:500',
            'parent_id' => 'nullable|exists:categories,id'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên danh mục không được để trống!',
            'name.string' => 'Tên danh mục không đúng định dạng!',
            'name.max' => 'Tên danh mục không được dài hơn 500 ký tự!',
        ];
    }
}
