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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId("sender_id")->references("id")->on("users")->onDelete("cascade")->onUpdate("cascade");
            $table->foreignId("recipient_id")->references("id")->on("users")->onDelete("cascade")->onUpdate("cascade");
            $table->foreignId("post_id")->references("id")->on("aircraft")->onDelete("cascade")->onUpdate("cascade");
            $table->integer("notifiable_id");
            $table->string("notifiable_type");
            $table->boolean("read");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
