<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class OrderNotCompletedException extends Exception
{
    public function __construct(string $action = 'thực hiện thao tác')
    {
        parent::__construct("Chỉ có thể {$action} khi đơn hàng đã hoàn thành!", 422);
    }
    public function render():JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage()
        ], $this->getCode());
    }
}
