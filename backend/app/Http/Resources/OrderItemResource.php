<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'product_id'      => $this->product_id,
            'quantity'        => $this->quantity,
            'price'           => (float) $this->price,
            'original_price'  => (float) $this->original_price,
            'discount_amount' => (float) $this->discount_amount,
            'subtotal'        => (float) $this->price * $this->quantity,

            'product' => $this->whenLoaded('product', fn() => [
                'id'        => $this->product->id,
                'name'      => $this->product->name,
                'slug'      => $this->product->slug ?? null,
                'thumbnail' => $this->product->thumbnail ?? null,
            ]),

            // review
            'review' => $this->when(
                isset($this->loaded_review),
                fn() => $this->loaded_review
                    ? new ReviewResource($this->loaded_review)
                    : null
            ),

            // refund request 
            'refund_request' => $this->when(
                isset($this->loaded_refund),
                fn() => $this->loaded_refund
                    ? new RefundRequestResource($this->loaded_refund)
                    : null
            ),

            // flags
            'is_reviewed'          => isset($this->loaded_review) && $this->loaded_review !== null,
            'has_refund_request'   => isset($this->loaded_refund) && $this->loaded_refund !== null,
        ];
    }
}
