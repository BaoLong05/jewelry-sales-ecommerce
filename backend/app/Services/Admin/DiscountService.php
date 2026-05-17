<?php

namespace App\Services\Admin;

use App\Exceptions\Discount\DiscountNotFoundException;
use App\Models\Discount;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DiscountService
{
    public function list(array $filters): LengthAwarePaginator
    {
        return Discount::query()
            ->with('products')
            ->when(!empty($filters['search']), fn($q) =>
                $q->where('name', 'like', '%' . $filters['search'] . '%')
            )
            ->when(isset($filters['is_active']), function ($q) use ($filters) {
                if ($filters['is_active']) {
                    $q->where('start_date', '<=', now())->where('end_date', '>=', now());
                } else {
                    $q->where('end_date', '<', now());
                }
            })
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * @throws DiscountNotFoundException
     */
    public function findById(int $id): Discount
    {
        $discount = Discount::with('products')->find($id);
        if (!$discount) throw new DiscountNotFoundException();
        return $discount;
    }

    public function create(array $data): Discount
    {
        return DB::transaction(function () use ($data) {
            $discount = Discount::create([
                'name'                => $data['name'],
                'type'                => $data['type'],
                'value'               => $data['value'] ?? 0,
                'start_date'          => $data['start_date'],
                'end_date'            => $data['end_date'],
                'min_order_amount'    => $data['min_order_amount'] ?? null,
                'max_discount_amount' => $data['max_discount_amount'] ?? null,
            ]);

            // Gán sản phẩm
            if (!empty($data['product_ids'])) {
                $discount->products()->sync($data['product_ids']);
            }

            return $discount->load('products');
        });
    }

    /**
     * @throws DiscountNotFoundException
     */
    public function update(int $id, array $data): Discount
    {
        $discount = $this->findById($id);

        return DB::transaction(function () use ($discount, $data) {
            $discount->update(array_filter([
                'name'                => $data['name'] ?? null,
                'type'                => $data['type'] ?? null,
                'value'               => $data['value'] ?? null,
                'start_date'          => $data['start_date'] ?? null,
                'end_date'            => $data['end_date'] ?? null,
                'min_order_amount'    => $data['min_order_amount'] ?? null,
                'max_discount_amount' => $data['max_discount_amount'] ?? null,
            ], fn($v) => $v !== null));
            if (array_key_exists('product_ids', $data)) {
                $discount->products()->sync($data['product_ids'] ?? []);
            }

            return $discount->load('products');
        });
    }

    /**
     * @throws DiscountNotFoundException
     */
    public function delete(int $id): void
    {
        $discount = $this->findById($id);
        $discount->products()->detach();
        $discount->delete();
    }
}