<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_code')->unique()->after('id');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('total_price');
            $table->string('payment_method')->default('cod')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['order_code', 'discount_amount', 'payment_method']);
        });
    }
};