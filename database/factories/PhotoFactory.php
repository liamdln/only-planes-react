<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Photo>
 */
class PhotoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // author_id and aircraft_id injected in DatabaseSeeder.php
        return [
            // "author_id" => User::inRandomOrder()->first(),
            // "aircraft_id" => Aircraft::inRandomOrder()->first(),
            "photo_url" => fake()->imageUrl($width = 1920, $height = 1080, $category = "aircraft", $randomize = true)
        ];
    }
}
