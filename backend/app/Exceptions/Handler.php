<?php

namespace App\Exceptions;

use Throwable;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use App\Exceptions\Auth\InvalidGoogleTokenException;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        if ($exception instanceof InvalidGoogleTokenException) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 401);
        }

        return parent::render($request, $exception);
    }
}
