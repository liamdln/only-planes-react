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
        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId("author_id")->references("id")->on("users")->onDelete("cascade")->onUpdate("cascade");
            $table->foreignId("aircraft_id")->references("id")->on("aircraft")->onDelete("cascade")->onUpdate("cascade");
            $table->string("photo_url");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};
