<?php

namespace App\Exceptions;

use Exception;

class AuthException extends Exception
{
    protected $statusCode = 401;
    public function render($request)
    {
        return response()->json([
            'message' => $this->getMessage() ?: "Unauthorized"
        ], $this->statusCode);
    }
}
