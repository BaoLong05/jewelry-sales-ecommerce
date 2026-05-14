<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->enum('status', ['pending','paid','failed'])->default('pending')->after('method');
            $table->string('idempotency_key')->unique()->nullable()->after('status');
            $table->string('payment_token', 64)->nullable()->after('idempotency_key');
            $table->string('transaction_ref')->nullable()->after('payment_token');
            $table->json('gateway_response')->nullable()->after('transaction_ref');
            $table->timestamp('paid_at')->nullable()->after('gateway_response');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'status','idempotency_key','payment_token',
                'transaction_ref','gateway_response','paid_at',
            ]);
        });
    }
};