<?php

namespace App\Exceptions;

use Exception;

class CategoryException extends Exception
{
    public static function notFound()
    {
        return new self("Danh mục không tồn tại");
    }

    public static function cannotDelete()
    {
        return new self("Không thể xóa danh mục đang có dữ liệu liên quan");
    }
}
