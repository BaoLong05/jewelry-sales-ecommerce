<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
$table->string('order_code')->unique();
            $table->decimal('total_price', 14, 2);
            $table->decimal('discount_amount', 14, 2)->default(0); 
            $table->string('payment_method');
            $table->enum('status', [
                'pending',    
                'confirmed',  
                'processing',   
                'shipping',     
                'delivered',    
                'completed',    
                'cancelled',   
                'refunded',     
            ])->default('pending');

            $table->text('address');

            $table->timestamps();

            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
