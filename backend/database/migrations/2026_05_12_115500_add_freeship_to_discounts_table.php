<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\{Schema, DB};

return new class extends Migration {
    public function up(): void
    {
        // Đổi enum trước bằng raw SQL vì Laravel không hỗ trợ change enum trực tiếp
        DB::statement("ALTER TABLE discounts MODIFY COLUMN type ENUM('percent','fixed','freeship') NOT NULL");

        Schema::table('discounts', function (Blueprint $table) {
            $table->unsignedInteger('min_order_amount')->default(0)->after('value');
            $table->unsignedInteger('max_discount_amount')->nullable()->after('min_order_amount');
        });
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE discounts MODIFY COLUMN type ENUM('percent','fixed') NOT NULL");

        Schema::table('discounts', function (Blueprint $table) {
            $table->dropColumn(['min_order_amount','max_discount_amount']);
        });
    }
};