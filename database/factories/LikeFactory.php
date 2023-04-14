<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Like>
 */
class LikeFactory extends Factory
{

    // private $compositeKey = [];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // do {
        //     $user_id = User::inRandomOrder()->first()->id;
        //     $aircraft_id = Aircraft::inRandomOrder()->first()->id;
        // } while(in_array(array($user_id, $aircraft_id), $this->compositeKey));

        // array_push($this->compositeKey, array($user_id, $aircraft_id));

        // user_id and aircraft_id injected by DatabaseSeeder.php
        return [
            // "user_id" => $user_id,
            // "aircraft_id" => $aircraft_id,
        ];
    }
}
