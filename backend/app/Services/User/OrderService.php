<?php

namespace App\Services\User;

use App\Exceptions\AlreadyReviewedException;
use App\Exceptions\OrderItemNotFoundException;
use App\Exceptions\OrderNotFoundException;
use App\Exceptions\OrderNotCompletedException;
use App\Exceptions\RefundRequestAlreadyExistsException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RefundRequest;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OrderService
{
    public function listOrders(int $userId, array $filters): LengthAwarePaginator
    {
        $query = Order::query()
            ->where('user_id', $userId)
            ->with(['items.product', 'payment'])
            ->latest();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $query->where('order_code', 'like', '%' . $filters['search'] . '%');
        }

        $orders = $query->paginate($filters['per_page'] ?? 10);

        $this->attachItemMeta($userId, $orders->getCollection());

        return $orders;
    }


    /**
     * @throws OrderNotFoundException
     */
    public function getOrderDetail(int $userId, string $orderCode): Order
    {
        $order = Order::query()
            ->where('order_code', $orderCode)
            ->where('user_id', $userId)
            ->with(['items.product', 'payment'])
            ->first();

        if (!$order) {
            throw new OrderNotFoundException();
        }

        $this->attachItemMeta($userId, collect([$order]));

        return $order;
    }

    /**
     * @throws OrderNotFoundException
     * @throws OrderItemNotFoundException
     * @throws OrderNotCompletedException
     * @throws AlreadyReviewedException
     */
    public function storeReview(
        int $userId,
        string $orderCode,
        int $orderItemId,
        array $data
    ): Review {
        $order = $this->findOrder($userId, $orderCode);

        if (!$order->canReview()) {
            throw new OrderNotCompletedException('đánh giá sản phẩm');
        }

        $item = $this->findOrderItem($order, $orderItemId);

        // Kiểm tra đã review item này chưa
        $alreadyReviewed = Review::where('order_id', $order->id)
            ->where('product_id', $item->product_id)
            ->where('user_id', $userId)
            ->exists();

        if ($alreadyReviewed) {
            throw new AlreadyReviewedException();
        }

        return DB::transaction(function () use ($userId, $order, $item, $data) {
            $review = Review::create([
                'user_id'    => $userId,
                'product_id' => $item->product_id,
                'order_id'   => $order->id,
                'rating'     => $data['rating'],
                'comment'    => $data['comment'] ?? null,
            ]);

            if (!empty($data['images'])) {
                foreach ($data['images'] as $image) {
                    $path = $image->store('reviews', 'public');
                    ReviewImage::create([
                        'review_id' => $review->id,
                        'image_url' => Storage::url($path),
                    ]);
                }
            }

            $review->load('images');

            return $review;
        });
    }

    /**
     * @throws OrderNotFoundException
     * @throws OrderItemNotFoundException
     * @throws OrderNotCompletedException
     * @throws RefundRequestAlreadyExistsException
     */
    public function storeRefundRequest(
        int $userId,
        string $orderCode,
        int $orderItemId,
        array $data
    ): RefundRequest {
        $order = $this->findOrder($userId, $orderCode);

        if (!$order->canRequestRefund()) {
            throw new OrderNotCompletedException('yêu cầu hoàn hàng');
        }

        $item = $this->findOrderItem($order, $orderItemId);

        // Kiểm tra item này đã có refund request chưa
        $exists = RefundRequest::where('order_id', $order->id)
            ->where('order_item_id', $item->id)
            ->where('user_id', $userId)
            ->exists();

        if ($exists) {
            throw new RefundRequestAlreadyExistsException();
        }

        // Upload ảnh minh chứng nếu có
        $imageUrls = [];
        if (!empty($data['images'])) {
            foreach ($data['images'] as $image) {
                $path = $image->store('refunds', 'public');
                $imageUrls[] = Storage::url($path);
            }
        }

        return RefundRequest::create([
            'user_id'       => $userId,
            'order_id'      => $order->id,
            'order_item_id' => $item->id,
            'reason'        => $data['reason'],
            'images'        => $imageUrls,
            'status'        => RefundRequest::STATUS_PENDING,
        ]);
    }

    // ---------------------------------------------------------------
    // PRIVATE HELPERS
    // ---------------------------------------------------------------

    /**
     *
     * @throws OrderNotFoundException
     */
    private function findOrder(int $userId, string $orderCode): Order
    {
        $order = Order::query()
            ->where('order_code', $orderCode)
            ->where('user_id', $userId)
            ->with('items.product')
            ->first();

        if (!$order) {
            throw new OrderNotFoundException();
        }

        return $order;
    }

    /**
     *
     * @throws OrderItemNotFoundException
     */
    private function findOrderItem(Order $order, int $orderItemId): OrderItem
    {
        $item = $order->items->firstWhere('id', $orderItemId);

        if (!$item) {
            throw new OrderItemNotFoundException();
        }

        return $item;
    }

    private function attachItemMeta(int $userId, Collection $orders): void
    {
        $orderIds = $orders->pluck('id');

        // Load tất cả reviews của user trong các đơn này
        $reviews = Review::whereIn('order_id', $orderIds)
            ->where('user_id', $userId)
            ->with('images')
            ->get()
            ->groupBy('order_id')
            ->map(fn($group) => $group->keyBy('product_id'));

        // Load tất cả refund requests của user trong các đơn này
        $refunds = RefundRequest::whereIn('order_id', $orderIds)
            ->where('user_id', $userId)
            ->get()
            ->groupBy('order_id')
            ->map(fn($group) => $group->keyBy('order_item_id'));

        foreach ($orders as $order) {
            $orderReviews = $reviews->get($order->id, collect());
            $orderRefunds = $refunds->get($order->id, collect());

            foreach ($order->items as $item) {
                // Gắn review theo product_id
                $item->loaded_review = $orderReviews->get($item->product_id);
                // Gắn refund theo order_item_id
                $item->loaded_refund = $orderRefunds->get($item->id);
            }
        }
    }
}
