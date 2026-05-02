<?php

namespace App\Exceptions\Auth;

use Exception;

class InvalidGoogleTokenException extends Exception
{
    public function __construct($message = "Google không hợp lệ!", $code = 401)
    {
        parent::__construct($message, $code);
    }
}
