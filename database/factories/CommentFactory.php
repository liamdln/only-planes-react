<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // author_id and aircraft_id injected by DatabaseSeeder.php
        return [
            // "author_id" => User::inRandomOrder()->first(),
            // "aircraft_id" => Aircraft::inRandomOrder()->first(),
            "content" => fake()->sentence(),
            "likes" => fake()->randomNumber(3, false),
            "date" => now()
        ];
    }
}
