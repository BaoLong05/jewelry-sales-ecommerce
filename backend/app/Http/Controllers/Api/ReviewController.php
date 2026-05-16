<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function getByProduct(Request $request, int $productId): JsonResponse
    {
        $review = Review::where('product_id', $productId)->with(['user:id,name', 'images'])
            ->latest()->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $review->map(fn($r) => [
                'id'         => $r->id,
                'rating'     => $r->rating,
                'comment'    => $r->comment,
                'created_at' => $r->created_at->format('d/m/Y'),
                'user'       => ['name' => $r->user?->name],
                'images'     => $r->images->pluck('image_url'),
            ]),
            'meta' => [
                'current_page' => $review->currentPage(),
                'last_page'    => $review->lastPage(),
                'total'        => $review->total(),
                'avg_rating'   => round(Review::where('product_id', $productId)->avg('rating'), 1),
            ],
        ]);
    }
}
