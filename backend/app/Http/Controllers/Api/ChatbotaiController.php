<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\Discount;

class ChatBotAiController extends Controller
{
    private string $apiKey;
    // ✅ FIX 1: Đổi model name đúng
    private string $model = 'gpt-4o-mini';
    // ✅ FIX 2: Dùng Chat Completions API thay vì /v1/responses
    private string $apiUrl = 'https://api.openai.com/v1/chat/completions';

    public function __construct()
    {
        $this->apiKey = env('OPENAI_API_KEY');
    }

    public function chat(Request $request)
    {
        $request->validate(['message' => 'required|string|max:500']);

        $message      = $request->input('message');
        $messageLower = mb_strtolower($message, 'UTF-8');

        // ✅ FIX 3: Dùng đúng format Chat Completions
        $intentResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type'  => 'application/json',
        ])->post($this->apiUrl, [
            'model' => $this->model,
            'messages' => [
                [
                    'role'    => 'system',
                    'content' => 'Bạn là bộ phân tích ý định cho hệ thống thương mại điện tử.

BẮT BUỘC:
- Chỉ trả về JSON hợp lệ, không giải thích, không thêm text nào khác.

Format JSON:
{"action":"<action>","table":"<table>","filter":"<filter hoặc null>"}

BẢNG (table):
- sản phẩm, hàng hóa, item → product
- danh mục, loại, category → category
- đơn hàng, order → order
- đánh giá, review, nhận xét → review
- khuyến mãi, giảm giá, voucher, discount → discount

HÀNH ĐỘNG (action):
- "có bao nhiêu", "tổng số", "đếm" → count
- "danh sách", "liệt kê", "xem", "hiện" → list
- "tìm", "tìm kiếm" → search
- "thống kê", "báo cáo", "tình trạng" → stats
- "doanh thu", "revenue" → revenue

FILTER (lấy từ câu hỏi nếu có):
- trạng thái đơn hàng: pending/confirmed/processing/shipping/delivered/completed/cancelled/refunded
- "bán chạy", "nhiều nhất" → top
- "hết hàng", "stock = 0" → out_of_stock
- "còn hàng" → in_stock
- "đang hoạt động", "còn hiệu lực" → active (cho discount)
- nếu không có filter → null

Không hiểu → {"action":"unknown","table":"none","filter":null}',
                ],
                [
                    'role'    => 'user',
                    'content' => $message,
                ],
            ],
            'max_tokens'  => 200,
            'temperature' => 0,
        ]);

        // ✅ FIX 4: Parse đúng response format của Chat Completions
        $raw = $intentResponse->json('choices.0.message.content')
            ?? '{"action":"unknown","table":"none","filter":null}';

        // ✅ FIX 5: Strip markdown code block nếu model trả về ```json ... ```
        $raw = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));
        $raw = preg_replace('/\s*```$/', '', $raw);

        $json   = json_decode($raw, true) ?? [];
        $action = $json['action'] ?? 'unknown';
        $table  = $json['table']  ?? 'none';
        $filter = $json['filter'] ?? null;

        // Fallback keyword matching
        if ($action === 'unknown') {
            foreach (['bao nhiêu' => 'count', 'danh sách' => 'list', 'tìm' => 'search', 'doanh thu' => 'revenue', 'thống kê' => 'stats'] as $kw => $act) {
                if (str_contains($messageLower, $kw)) {
                    $action = $act;
                    break;
                }
            }
        }
        if ($table === 'none') {
            foreach (['sản phẩm' => 'product', 'danh mục' => 'category', 'đơn hàng' => 'order', 'đánh giá' => 'review', 'khuyến mãi' => 'discount', 'giảm giá' => 'discount'] as $kw => $tbl) {
                if (str_contains($messageLower, $kw)) {
                    $table = $tbl;
                    break;
                }
            }
        }

        if ($action === 'unknown' || $table === 'none') {
            return response()->json([
                'reply' => 'Xin chào! Tôi là trợ lý thương mại điện tử. Bạn có thể hỏi tôi về: sản phẩm, danh mục, đơn hàng, đánh giá, khuyến mãi. Ví dụ: "Có bao nhiêu sản phẩm?", "Danh sách đơn hàng đang vận chuyển", "Doanh thu tháng này".',
            ]);
        }

        $data = $this->fetchData($action, $table, $filter, $messageLower);

        // ✅ FIX 6: Final response cũng dùng Chat Completions format
        $finalResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type'  => 'application/json',
        ])->post($this->apiUrl, [
            'model' => $this->model,
            'messages' => [
                [
                    'role'    => 'system',
                    'content' => "Bạn là trợ lý quản lý cửa hàng thương mại điện tử. Hãy trả lời ngắn gọn, thân thiện, dùng số liệu cụ thể từ dữ liệu bên dưới. Dùng emoji phù hợp (🛍️📦✅❌📊💰).

Dữ liệu hiện tại:
" . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "

Chỉ trả lời dựa trên dữ liệu trên. Không bịa thêm số liệu.",
                ],
                [
                    'role'    => 'user',
                    'content' => $message,
                ],
            ],
            'max_tokens'  => 500,
            'temperature' => 0.7,
        ]);

        $reply = $finalResponse->json('choices.0.message.content')
            ?? 'Xin lỗi, không thể xử lý yêu cầu lúc này.';

        return response()->json(['reply' => $reply]);
    }

    private function fetchData(string $action, string $table, ?string $filter, string $messageLower): array
    {
        return match ($table) {
            'product'  => $this->fetchProduct($action, $filter, $messageLower),
            'category' => $this->fetchCategory($action),
            'order'    => $this->fetchOrder($action, $filter, $messageLower),
            'review'   => $this->fetchReview($action),
            'discount' => $this->fetchDiscount($action, $filter),
            default    => [],
        };
    }

    private function fetchProduct(string $action, ?string $filter, string $msg): array
    {
        if ($action === 'count') {
            $data = [
                'total'      => Product::count(),
                'in_stock'   => Product::where('stock', '>', 0)->count(),
                'out_stock'  => Product::where('stock', 0)->count(),
            ];
        } elseif ($action === 'stats') {
            $data = [
                'total'          => Product::count(),
                'avg_price'      => round(Product::avg('price'), 0),
                'avg_rating'     => round(Product::avg('rating_avg'), 2),
                'total_reviews'  => Product::sum('rating_count'),
                'out_of_stock'   => Product::where('stock', 0)->count(),
                'by_category'    => Product::selectRaw('category_id, count(*) as total')
                    ->groupBy('category_id')
                    ->with('category:id,name')
                    ->get()
                    ->map(fn($p) => ['category' => $p->category?->name, 'total' => $p->total]),
            ];
        } else {
            $query = Product::with(['category:id,name'])->limit(10);

            if ($filter === 'out_of_stock' || str_contains($msg, 'hết hàng')) {
                $query->where('stock', 0);
            } elseif ($filter === 'in_stock' || str_contains($msg, 'còn hàng')) {
                $query->where('stock', '>', 0);
            } elseif ($filter === 'top' || str_contains($msg, 'bán chạy')) {
                $query->orderByDesc('rating_count');
            } else {
                $query->orderByDesc('created_at');
            }

            $data = $query->get()->map(fn($p) => [
                'id'       => $p->id,
                'name'     => $p->name,
                'price'    => number_format($p->price, 0, ',', '.') . 'đ',
                'stock'    => $p->stock,
                'rating'   => $p->rating_avg . ' (' . $p->rating_count . ' đánh giá)',
                'category' => $p->category?->name,
            ]);
        }

        return is_array($data) ? $data : $data->toArray();
    }

    private function fetchCategory(string $action): array
    {
        if ($action === 'count') {
            return [
                'total'        => Category::count(),
                'parent_only'  => Category::whereNull('parent_id')->count(),
                'sub_category' => Category::whereNotNull('parent_id')->count(),
            ];
        }

        return Category::with('parent:id,name')
            ->withCount('products')
            ->limit(15)
            ->get()
            ->map(fn($c) => [
                'id'       => $c->id,
                'name'     => $c->name,
                'parent'   => $c->parent?->name ?? 'Danh mục gốc',
                'products' => $c->products_count,
            ])
            ->toArray();
    }

    private function fetchOrder(string $action, ?string $filter, string $msg): array
    {
        $statusMap = [
            'chờ xác nhận' => 'pending',
            'đã xác nhận'  => 'confirmed',
            'chuẩn bị'     => 'processing',
            'vận chuyển'   => 'shipping',
            'đã giao'      => 'delivered',
            'hoàn thành'   => 'completed',
            'đã hủy'       => 'cancelled',
            'hoàn tiền'    => 'refunded',
        ];

        $status = $filter;
        foreach ($statusMap as $kw => $val) {
            if (str_contains($msg, $kw)) {
                $status = $val;
                break;
            }
        }

        if ($action === 'count') {
            $data = ['total' => Order::count()];
            foreach (Order::STATUSES as $s) {
                $data[$s] = Order::where('status', $s)->count();
            }
            return $data;
        }

        if ($action === 'revenue') {
            return [
                'total_revenue'   => number_format(Order::where('status', 'completed')->sum('total_price'), 0, ',', '.') . 'đ',
                'total_orders'    => Order::where('status', 'completed')->count(),
                'avg_order_value' => number_format(Order::where('status', 'completed')->avg('total_price') ?? 0, 0, ',', '.') . 'đ',
                'total_discount'  => number_format(Order::where('status', 'completed')->sum('discount_amount'), 0, ',', '.') . 'đ',
                'pending_revenue' => number_format(Order::whereIn('status', ['pending', 'confirmed', 'processing', 'shipping'])->sum('total_price'), 0, ',', '.') . 'đ',
            ];
        }

        if ($action === 'stats') {
            $stats = [];
            foreach (Order::STATUSES as $s) {
                $stats[$s] = [
                    'count'   => Order::where('status', $s)->count(),
                    'revenue' => number_format(Order::where('status', $s)->sum('total_price'), 0, ',', '.') . 'đ',
                ];
            }
            return $stats;
        }

        $query = Order::with('user:id,name,email')->limit(10)->orderByDesc('created_at');
        if ($status) $query->where('status', $status);

        return $query->get()->map(fn($o) => [
            'order_code' => $o->order_code,
            'customer'   => $o->user?->name,
            'total'      => number_format($o->total_price, 0, ',', '.') . 'đ',
            'discount'   => number_format($o->discount_amount, 0, ',', '.') . 'đ',
            'status'     => $o->status_label,
            'payment'    => $o->payment_method,
            'created_at' => $o->created_at?->format('d/m/Y H:i'),
        ])->toArray();
    }

    private function fetchReview(string $action): array
    {
        if ($action === 'count') {
            return [
                'total'      => Review::count(),
                'avg_rating' => round(Review::avg('rating'), 2),
                'by_rating'  => Review::selectRaw('rating, count(*) as total')
                    ->groupBy('rating')
                    ->orderByDesc('rating')
                    ->pluck('total', 'rating'),
            ];
        }

        return Review::with(['user:id,name', 'product:id,name'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'product' => $r->product?->name,
                'user'    => $r->user?->name,
                'rating'  => $r->rating . '/5 ⭐',
                'comment' => mb_substr($r->comment, 0, 100, 'UTF-8') . (mb_strlen($r->comment, 'UTF-8') > 100 ? '...' : ''),
                'date'    => $r->created_at?->format('d/m/Y'),
            ])
            ->toArray();
    }

    private function fetchDiscount(string $action, ?string $filter): array
    {
        if ($action === 'count') {
            return [
                'total'    => Discount::count(),
                'active'   => Discount::where('start_date', '<=', now())->where('end_date', '>=', now())->count(),
                'expired'  => Discount::where('end_date', '<', now())->count(),
                'upcoming' => Discount::where('start_date', '>', now())->count(),
            ];
        }

        $query = Discount::withCount('products')->limit(10);
        if ($filter === 'active') {
            $query->where('start_date', '<=', now())->where('end_date', '>=', now());
        }

        return $query->get()->map(fn($d) => [
            'name'      => $d->name,
            'type'      => $d->type_label,
            'value'     => $d->type === 'percent' ? $d->value . '%' : number_format($d->value, 0, ',', '.') . 'đ',
            'min_order' => number_format($d->min_order_amount ?? 0, 0, ',', '.') . 'đ',
            'products'  => $d->products_count,
            'active'    => $d->isActive() ? 'Đang hoạt động ✅' : 'Không hoạt động ❌',
            'end_date'  => $d->end_date?->format('d/m/Y'),
        ])->toArray();
    }
}