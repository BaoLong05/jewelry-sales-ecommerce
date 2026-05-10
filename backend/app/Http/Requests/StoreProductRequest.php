<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',

            'images' => 'required|array|max:5',
            'images.*' => 'image|mimes:jpg,jpeg,png|max:2048',

            'main_index' => 'required|integer|min:0'
        ];
    }


    public function messages(): array
    {
        return [
            'name.required' => 'Tên sản phẩm là bắt buộc.',
            'name.string' => 'Tên sản phẩm phải là chuỗi.',
            'name.max' => 'Tên sản phẩm không được vượt quá 255 ký tự.',

            'description.string' => 'Mô tả phải là chuỗi.',

            'price.required' => 'Giá là bắt buộc.',
            'price.numeric' => 'Giá phải là số.',
            'price.min' => 'Giá phải >= 0.',

            'stock.required' => 'Số lượng là bắt buộc.',
            'stock.integer' => 'Số lượng phải là số nguyên.',
            'stock.min' => 'Số lượng phải >= 0.',

            'category_id.required' => 'Danh mục là bắt buộc.',
            'category_id.exists' => 'Danh mục không tồn tại.',

            // images
            'images.required' => 'Vui lòng chọn hình ảnh sản phẩm.',
            'images.array' => 'Danh sách hình ảnh không hợp lệ.',
            'images.max' => 'Chỉ được tối đa 5 hình ảnh.',

            'images.*.image' => 'File phải là hình ảnh.',
            'images.*.mimes' => 'Chỉ chấp nhận jpg, jpeg, png.',
            'images.*.max' => 'Mỗi ảnh tối đa 2MB.',

            // main index
            'main_index.required' => 'Vui lòng chọn ảnh đại diện.',
            'main_index.integer' => 'Ảnh đại diện không hợp lệ.',
            'main_index.min' => 'Ảnh đại diện không hợp lệ.',
        ];
    }
}
