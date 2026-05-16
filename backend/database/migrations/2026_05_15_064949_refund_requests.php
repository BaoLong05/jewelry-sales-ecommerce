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
        Schema::create('refund_requests', function (Blueprint $table) {
            $table->id();
            //user gui yeu cau hoan hang
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            //don hang lien quan
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            // san pham duoc chon
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();

            //nguoi dung nhap ly do
            $table->text('reason');
            //trang thai xu ly hoan hang
            $table->enum('status', [
                'pending', //doi admin xu ly
                'apporoved', //chap nhan yeu cau
                'rejected', //tu choi hoan hang
                'refunded' //da hoan tien
            ])->default('pending');

            //admin ghi chu
            $table->text('admin_note')->nullable();
            //anh chung minh
            $table->json('images')->nullable();

            //thoi diem duyet
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            //mot don hang chi nhan 1 yeu cau hoan hang
            $table->unique('order_item_id');
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
