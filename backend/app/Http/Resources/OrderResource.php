<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'order_code'      => $this->order_code,
            'status'          => $this->status,
            'status_label'    => $this->status_label,
            'total_price'     => (float) $this->total_price,
            'discount_amount' => (float) $this->discount_amount,
            'final_price'     => (float) ($this->total_price - $this->discount_amount),
            'payment_method'  => $this->payment_method,
            'address'         => $this->address,
            'created_at'      => $this->created_at->format('d/m/Y H:i'),

            // stepper cho FE
            'progress_step'  => $this->currentProgressStep(),
            'progress_steps' => Order::PROGRESS_STEPS,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),

            'payment' => $this->whenLoaded('payment', fn() => $this->payment ? [
                'status'          => $this->payment->status,
                'method'          => $this->payment->method,
                'amount'          => (float) $this->payment->amount,
                'paid_at'         => $this->payment->paid_at?->format('d/m/Y H:i'),
                'transaction_ref' => $this->payment->transaction_ref,
            ] : null),

            // flags 
            'actions' => [
                'can_review'        => $this->canReview(),
                'can_request_refund' => $this->canRequestRefund(),
            ],
        ];
    }
}
