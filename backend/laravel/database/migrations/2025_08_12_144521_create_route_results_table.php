<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('route_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('request_id');
            $table->json('optimized_order');
            $table->decimal('total_distance', 10, 2)->nullable();
            $table->decimal('total_duration', 10, 2)->nullable();
            $table->json('legs');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('request_id')->references('id')->on('route_requests')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_results');
    }
};
