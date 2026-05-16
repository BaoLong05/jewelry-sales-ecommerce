<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class OrderItemNotFoundException extends Exception
{
    public function __construct()
    {
        parent::__construct('Sản phẩm không thuộc đơn hàng này!', 404);
    }
    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage()
        ], $this->getCode());
    }
}
