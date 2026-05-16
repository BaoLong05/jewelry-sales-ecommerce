<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\RefundRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminRefundController extends Controller
{
    //danh sach hoan don 
    public function index(Request $request): JsonResponse
    {
        $requests = RefundRequest::with([
            'user:id,name,email',
            'order:id,order_code,status',
            'order_item.product:id,name',
            'order_item.product.images'
        ])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,

            'data' => $requests->getCollection()->map(fn($r) => [
                'id' => $r->id,
                'reason' => $r->reason,
                'images' => collect($r->images)->map(fn($path) => url($path))->toArray(),
                'status' => $r->status,
                'status_label' => $r->status_label,
                'admin_note' => $r->admin_note,
                'processed_at' => $r->processed_at?->format('d/m/Y H:i'),
                'created_at' => $r->created_at->format('d/m/Y H:i'),

                'user' => [
                    'id' => $r->user?->id,
                    'name' => $r->user?->name,
                    'email' => $r->user?->email,
                ],

                'order' => [
                    'id' => $r->order?->id,
                    'order_code' => $r->order?->order_code,
                ],

                'product' => [
                    'name' => $r->order_item?->product?->name,
                    'thumbnail' => $r->order_item?->product?->images
                        ->where('is_main', true)->first()?->image_url
                        ?? $r->order_item?->product?->images->first()?->image_url,
                ],
            ]),

            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    // chap nhan hoan don
    public function approve(Request $request, int $id): JsonResponse
    {
        $refund = RefundRequest::findOrFail($id);

        if (!$refund->isPending()) {
            return response()->json(['success' => false, 'message' => 'Yêu cầu này đã được xử lý.'], 422);
        }

        DB::transaction(function () use ($refund, $request) {
            $refund->update([
                'status'       => RefundRequest::STATUS_APPROVED,
                'admin_note'   => $request->admin_note,
                'processed_at' => now(),
            ]);

            // Chuyển đơn hàng sang refunded
            $refund->order->update(['status' => Order::STATUS_REFUNDED]);
        });

        return response()->json(['success' => true, 'message' => 'Đã chấp nhận yêu cầu hoàn hàng.']);
    }

    // tu choi hoan don
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate(['admin_note' => 'required|string|min:10']);

        $refund = RefundRequest::findOrFail($id);

        if (!$refund->isPending()) {
            return response()->json(['success' => false, 'message' => 'Yêu cầu này đã được xử lý.'], 422);
        }

        $refund->update([
            'status'       => RefundRequest::STATUS_REJECTED,
            'admin_note'   => $request->admin_note,
            'processed_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Đã từ chối yêu cầu hoàn hàng.']);
    }
}
