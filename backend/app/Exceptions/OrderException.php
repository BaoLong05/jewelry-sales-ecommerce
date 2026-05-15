<?php

namespace App\Exceptions;

use Exception;

class OrderException extends Exception
{
    public static function update(){
        return new self("Cập nhật thất bại. Vui lòng thử lại!");
    }
}
