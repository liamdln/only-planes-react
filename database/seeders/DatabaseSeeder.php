<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Aircraft;
use App\Models\Photo;
use App\Models\Comment;
use App\Models\Like;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $numUsers = 10;

        User::factory($numUsers)->create()->each(function ($user) {
            // create random number of aircraft per user.
            Aircraft::factory(fake()->randomDigitNotZero())->create(["user_id" => $user->id])->each(function ($aircraft) use ($user) {

                // should we create additional photos of this aircraft (run per user)?
                $createAddPhotos = fake()->randomElement([true, false]);
                if ($createAddPhotos) {
                    Photo::factory(fake()->randomDigitNotZero())->create(["author_id" => $user->id, "aircraft_id" => $aircraft->id]);
                }

                // should we create comments on this aircraft (run per user)?
                $createAddPhotos = fake()->randomElement([true, false]);
                if ($createAddPhotos) {
                    Comment::factory(fake()->randomDigitNotZero())->create(["author_id" => $user->id, "aircraft_id" => $aircraft->id]);
                }

                // should we like this aircraft (this includes some bias)?
                // random numbers 0 - 99
                $likeProbabilityRange = fake()->randomNumber(2, false);
                // about 70% probability of liking an aircraft
                if ($likeProbabilityRange > 60) {
                    Like::factory(1)->create(["user_id" => $user->id, "aircraft_id" => $aircraft->id]);
                }
            });
        });
    }
}
