<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiscountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'type'                => $this->type,
            'type_label'          => $this->type_label,
            'value'               => (float) $this->value,
            'start_date'          => $this->start_date?->format('Y-m-d'),
            'end_date'            => $this->end_date?->format('Y-m-d'),
            'min_order_amount'    => (float) ($this->min_order_amount ?? 0),
            'max_discount_amount' => (float) ($this->max_discount_amount ?? 0),
            'is_active'           => $this->isActive(),
            'created_at'          => $this->created_at->format('d/m/Y'),
            'products' => $this->whenLoaded('products', fn() =>
                $this->products->map(fn($p) => [
                    'id'        => $p->id,
                    'name'      => $p->name,
                    'price'     => (float) $p->price,
                    'thumbnail' => $p->thumbnail ?? null,
                ])
            ),
        ];
    }
}