<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
class OrderNotFoundException extends Exception
{
    public function __construct(){
        parent::__construct('Không tìm thấy đơn hàng', 404);
    }

    public function render():JsonResponse{
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
        ], $this->getCode());
    }
}
