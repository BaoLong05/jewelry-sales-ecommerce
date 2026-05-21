<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\RefundRequest;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    //kpi tong quan
    public function getKpi(): array
    {
        $now         = Carbon::now();
        $startMonth  = $now->copy()->startOfMonth();
        $startToday  = $now->copy()->startOfDay();
        $lastMonth   = $now->copy()->subMonth()->startOfMonth();
        $endLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Doanh thu
        $revenueTotal = Order::where('status', Order::STATUS_COMPLETED)
            ->sum('total_price');

        $revenueThisMonth = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$startMonth, $now])
            ->sum('total_price');

        $revenueLastMonth = Order::where('status', Order::STATUS_COMPLETED)
            ->whereBetween('created_at', [$lastMonth, $endLastMonth])
            ->sum('total_price');

        $revenueToday = Order::where('status', Order::STATUS_COMPLETED)
            ->where('created_at', '>=', $startToday)
            ->sum('total_price');

        // Đơn hàng
        $totalOrders       = Order::count();
        $ordersToday       = Order::where('created_at', '>=', $startToday)->count();
        $ordersThisMonth   = Order::where('created_at', '>=', $startMonth)->count();
        $ordersPending     = Order::where('status', Order::STATUS_PENDING)->count();
        $ordersCompleted   = Order::where('status', Order::STATUS_COMPLETED)->count();
        $ordersCancelled   = Order::where('status', Order::STATUS_CANCELLED)->count();
        $ordersRefunded    = Order::where('status', Order::STATUS_REFUNDED)->count();

        // Tỉ lệ tăng trưởng doanh thu so với tháng trước
        $revenueGrowth = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : 0;

        // Sản phẩm
        $totalProducts     = Product::count();
        $lowStockProducts  = Product::where('stock', '<', 10)->where('stock', '>', 0)->count();
        $outOfStockProducts = Product::where('stock', 0)->count();

        // Khách hàng
        $totalUsers        = User::count();
        $newUsersThisMonth = User::where('created_at', '>=', $startMonth)->count();

        // Đánh giá
        $totalReviews      = Review::count();
        $avgRating         = round(Review::avg('rating'), 1);

        // Hoàn hàng
        $pendingRefunds    = RefundRequest::where('status', RefundRequest::STATUS_PENDING)->count();

        return [
            'revenue' => [
                'total'        => (float) $revenueTotal,
                'today'        => (float) $revenueToday,
                'this_month'   => (float) $revenueThisMonth,
                'last_month'   => (float) $revenueLastMonth,
                'growth'       => $revenueGrowth,
            ],
            'orders' => [
                'total'        => $totalOrders,
                'today'        => $ordersToday,
                'this_month'   => $ordersThisMonth,
                'pending'      => $ordersPending,
                'completed'    => $ordersCompleted,
                'cancelled'    => $ordersCancelled,
                'refunded'     => $ordersRefunded,
            ],
            'products' => [
                'total'        => $totalProducts,
                'low_stock'    => $lowStockProducts,
                'out_of_stock' => $outOfStockProducts,
            ],
            'users' => [
                'total'        => $totalUsers,
                'new_this_month' => $newUsersThisMonth,
            ],
            'reviews' => [
                'total'        => $totalReviews,
                'avg_rating'   => $avgRating,
            ],
            'refunds' => [
                'pending'      => $pendingRefunds,
            ],
        ];
    }

    //bieu do trang thai don hang

    public function getOrderStatusChart(): array
    {
        $statusLabels = [
            'pending'    => 'Chờ xác nhận',
            'confirmed'  => 'Đã xác nhận',
            'processing' => 'Đang chuẩn bị',
            'shipping'   => 'Đang vận chuyển',
            'delivered'  => 'Đã giao hàng',
            'completed'  => 'Hoàn thành',
            'cancelled'  => 'Đã huỷ',
            'refunded'   => 'Đã hoàn tiền',
        ];

        return Order::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn($row) => [
                'name'  => $statusLabels[$row->status] ?? $row->status,
                'value' => $row->total,
            ])
            ->toArray();
    }

    //bieu do doanh thu theo ngay

    public function getRevenueTrend(int $days = 30): array
    {
        return Order::where('status', Order::STATUS_COMPLETED)
            ->where('created_at', '>=', Carbon::now()->subDays($days))
            ->selectRaw('DATE(created_at) as date, SUM(total_price) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($row) => [
                'date'    => $row->date,
                'revenue' => (float) $row->revenue,
                'orders'  => $row->orders,
            ])
            ->toArray();
    }

    //bieu do doanh thu theo thang

    public function getRevenueByMonth(): array
    {
        return Order::where('status', Order::STATUS_COMPLETED)
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(total_price) as revenue, COUNT(*) as orders')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(fn($row) => [
                'label'   => "{$row->month}/{$row->year}",
                'revenue' => (float) $row->revenue,
                'orders'  => $row->orders,
            ])
            ->toArray();
    }

    //top san pham ban chay

    public function getTopProducts(int $limit = 5): array
    {
        return OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', Order::STATUS_COMPLETED)
            ->select(
                'products.id',
                'products.name',
                'products.stock',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.stock')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get()
            ->map(fn($row) => [
                'id'            => $row->id,
                'name'          => $row->name,
                'stock'         => $row->stock,
                'total_sold'    => $row->total_sold,
                'total_revenue' => (float) $row->total_revenue,
            ])
            ->toArray();
    }

    //san pham het hang

    public function getLowStockProducts(int $limit = 5): array
    {
        return Product::where('stock', '<=', 10)
            ->orderBy('stock')
            ->limit($limit)
            ->get(['id', 'name', 'stock', 'price'])
            ->map(fn($p) => [
                'id'    => $p->id,
                'name'  => $p->name,
                'stock' => $p->stock,
                'price' => (float) $p->price,
            ])
            ->toArray();
    }

    //don hang moi nhat

    public function getRecentOrders(int $limit = 5): array
    {
        return Order::with('user:id,name,email')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn($o) => [
                'id'           => $o->id,
                'order_code'   => $o->order_code,
                'status'       => $o->status,
                'status_label' => $o->status_label,
                'final_price'  => (float) $o->total_price,
                'created_at'   => $o->created_at->format('d/m/Y H:i'),
                'user'         => [
                    'name'  => $o->user?->name,
                    'email' => $o->user?->email,
                ],
            ])
            ->toArray();
    }

    // cho duyet hoan hang
    public function getPendingRefunds(int $limit = 5): array
    {
        return RefundRequest::with([
            'user:id,name,email',
            'order:id,order_code',
            'order_item.product:id,name',
        ])
            ->where('status', RefundRequest::STATUS_PENDING)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn($r) => [
                'id'         => $r->id,
                'reason'     => $r->reason,
                'created_at' => $r->created_at->format('d/m/Y H:i'),
                'user'       => ['name' => $r->user?->name, 'email' => $r->user?->email],
                'order_code' => $r->order?->order_code,
                'product'    => $r->order_item?->product?->name,
            ])
            ->toArray();
    }

    //khach hang moi theo thang

    public function getNewUsersByMonth(): array
    {
        return User::where('created_at', '>=', Carbon::now()->subMonths(12))
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as total')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(fn($row) => [
                'label' => "{$row->month}/{$row->year}",
                'total' => $row->total,
            ])
            ->toArray();
    }
}
