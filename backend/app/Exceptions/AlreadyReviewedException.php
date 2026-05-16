<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class AlreadyReviewedException extends Exception
{
    public function __construct()
    {
        parent::__construct('Sản phẩm này đã được đánh giá!', 422);
    }
    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage()
        ], $this->getCode());
    }
}
