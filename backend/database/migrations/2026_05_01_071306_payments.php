<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->dateTime('payment_date');
            $table->decimal('amount', 14, 2);
            $table->string('method'); 
            $table->string('status')->default('pending'); 
            $table->string('idempotency_key')->unique()->nullable();
            $table->string('payment_token', 64)->nullable();
            $table->string('transaction_ref')->nullable();
            $table->json('gateway_response')->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};