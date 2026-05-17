<?php

namespace App\Exceptions\Discount;

use Exception;
use Illuminate\Http\JsonResponse;

class DiscountNotFoundException extends Exception
{
    public function __construct()
    {
        parent::__construct('Không tìm thấy chương trình giảm giá.', 404);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
        ], $this->getCode());
    }
}