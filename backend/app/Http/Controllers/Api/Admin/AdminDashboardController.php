<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardService;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Thống kê tổng quan',
            'data'    => [
                'kpi'              => $this->dashboardService->getKpi(),
                'order_status_chart' => $this->dashboardService->getOrderStatusChart(),
                'revenue_trend'    => $this->dashboardService->getRevenueTrend(30),
                'revenue_by_month' => $this->dashboardService->getRevenueByMonth(),
                'top_products'     => $this->dashboardService->getTopProducts(5),
                'low_stock'        => $this->dashboardService->getLowStockProducts(5),
                'recent_orders'    => $this->dashboardService->getRecentOrders(5),
                'pending_refunds'  => $this->dashboardService->getPendingRefunds(5),
                'new_users_by_month' => $this->dashboardService->getNewUsersByMonth(),
            ],
        ]);
    }
}