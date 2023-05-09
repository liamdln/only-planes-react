<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Aircraft;
use App\Models\Comment;
use App\Models\Notifications;
use App\Models\Opinion;

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
            Aircraft::factory(fake()->randomDigitNotZero())->create(["user_id" => $user->id]);

            // should we add an opinion, skip if user owns aircraft?
            $random_aircraft = Aircraft::inRandomOrder()->first();

            // should we create comments on this aircraft (run per user)?
            $create_comments = fake()->randomElement([true, false]);
            if ($create_comments) {
                Comment::factory(fake()->randomDigitNotZero())
                    ->create(["author_id" => $user->id, "aircraft_id" => $random_aircraft->id])
                    ->each(function ($comment) use ($random_aircraft, $user) {

                        // stop a notification if the user interacted with their own post
                        if ($user->id != $random_aircraft->user_id) {
                            // notify the user
                            $read = [true, false];
                            Notifications::factory(1)
                                ->create([
                                    "sender_id" => $user->id,
                                    "recipient_id" => $random_aircraft->user_id,
                                    "post_id" => $random_aircraft->id,
                                    "notifiable_type" => "comment",
                                    "notifiable_id" => $comment->id,
                                    "read" => $read[array_rand($read, 1)]
                                ]);
                        }
                    });
            }

            if ($random_aircraft->user_id != $user->id) {
                // 50/50 if we add opinion or not
                if (rand(0, 1) == 1) {
                    // should we like or dislike this aircraft?
                    $opinions = ["like", "dislike"];
                    Opinion::factory(1)
                        ->create(["user_id" => $user->id, "aircraft_id" => $random_aircraft->id, "opinion" => $opinions[array_rand($opinions, 1)]])
                        ->each(function ($opinion) use ($random_aircraft, $user) {

                            // notify the user
                            $read = [true, false];
                            Notifications::factory(1)
                                ->create([
                                    "sender_id" => $user->id,
                                    "recipient_id" => $random_aircraft->user_id,
                                    "post_id" => $random_aircraft->id,
                                    "notifiable_type" => "opinion",
                                    "notifiable_id" => $opinion->id,
                                    "read" => $read[array_rand($read, 1)]
                                ]);
                        });
                }
            }
        });
    }
}
