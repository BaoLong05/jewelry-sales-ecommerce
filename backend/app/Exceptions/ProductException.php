<?php

namespace App\Exceptions;

use Exception;

class ProductException extends Exception
{
    public static function notFound()
    {
        return new self("Sản phẩm không tồn tại");
    }
}
