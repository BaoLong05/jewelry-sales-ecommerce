<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class RefundRequestAlreadyExistsException extends Exception
{
    public function __construct()
    {
        parent::__construct('Sản phẩm này đã được gửi yêu cầu hoàn hàng, vui lòng chờ xử lý!', 422);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage()
        ], $this->getCode());
    }
}
