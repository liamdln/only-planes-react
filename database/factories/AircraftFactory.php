<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Aircraft>
 */
class AircraftFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // fake aircraft makes - add as required
        $fakeAircraftMakes = ["Booing", "AirShuttle", "Embracer", "Bomberdeer", "Tuple", "Antonev", "Sessna", "Pipea", "Yuk"];

        // user_id injected by DatabaseSeeder.php
        return [
            "make" => fake()->randomElement($fakeAircraftMakes),
            "model" => fake()->randomNumber(4, false),
            "reg" => fake()->unique()->lexify("g-????"),
            "location_lat" => fake()->latitude($min = -90, $max = 90),
            "location_lng" => fake()->longitude($min = -180, $max = 180),
            "featured_photo_url" => fake()->imageUrl($width = 1920, $height = 1080, $category = "aircraft", $randomize = true),
            // "user_id" => User::inRandomOrder()->first()
        ];
    }
}
