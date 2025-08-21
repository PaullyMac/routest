<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('route_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('origin_id');
            $table->json('stops');
            $table->timestamp('request_time')->useCurrent();
            $table->string('status')->default('pending');

            $table->foreign('origin_id')->references('id')->on('locations')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_requests');
    }
};
