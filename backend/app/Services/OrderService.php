<?php

namespace App\Services;

use App\Exceptions\OrderException;
use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderService
{
    public function getAll(array $filter): LengthAwarePaginator
    {
        $query = Order::with([
            'user:id,name,email',
            'items.product',
            'payment'

        ])->latest();

        //tim kiem theo user , ten, email
        if (!empty($filter['search'])) {
            $search = $filter['search'];
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->orWhere('id', (int)$search);
                }

                $q->orWhereHas('user', function ($uq) use ($search) {
                    $uq->Where('name', 'like', "%{$search}%")
                        ->orWhere('eamil', 'like', "%{$search}%");
                });
            });
        }

        //tim kiem theo trang thai
        if (!empty($filter['status'])) {
            $query->where('status', $filter['status']);
        }

        //tim kiem theo user_id
        if (!empty($filter['user_id'])) {
            $query->where('user_id', $filter['user_id']);
        }

        //tim kiem theo date from
        if (!empty($filter['date_from'])) {
            $query->where('created_at', $filter['date_from']);
        }

        //tim kiem theo date to
        if (!empty($filter['date_to'])) {
            $query->where('created_at', $filter['date_to']);
        }

        //phan trang
        $perpage = $filter['per_page'] ?? 10;

        return $query->paginate($perpage);
    }

    //chi tiet don hang
    public function getByid(int $id): Order
    {
        return Order::with([
            'user:id,name,email',
            'items.product.images',
            'payment'
        ])->findOrFail($id);
    }

    //cap nhat trang thai don hang
    public function updateStatus(int $id, string $status): Order
    {
        //lay ra don hang theo id     
        $order = Order::findOrFail($id);

        $allowedStatus = [
            'pending',
            'paid',
            'shipping',
            'completed',
            'cancelled',
            'confirmed',
            'processing',
            'delivered',
            'refunded',
        ];

        //kiem tra trang thai don hang 
        if (!in_array($status, $allowedStatus)) {
            throw new OrderException('Trạng thái đơn hàng không hợp lệ.');
        }

        //neu don hang dang la trang thai: completed, refuned, canceled thi ko cho cap nhat
        if (!in_array($order->status, ['completed', 'cancelled', 'refunded'])) {
            throw new OrderException("Không thể thay đổi trạng thái đơn hàng đang ở trạng thái .'{$order->status}'.");
        }

        //tien hanh cap nhat
        $order->update([
            'status' => $status
        ]);

        return $this->getByid($order->id);
    }
}
