<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RefundRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reasoh' => $this->reason,
            'images' => $this->images,
            'status_lable' => $this->status_label,
            'admin_note' => $this->admin_note,
            'processed_at' => $this->processed_at?->format('d/m/y H:i'),
            'created_at' => $this->created_at?->format('d/m/y H:i')
        ];
    }
}
