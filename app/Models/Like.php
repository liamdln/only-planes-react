<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        "user_id",
        "aircraft_id",
    ];

    /**
     * Creates a one-to-one relationship between User and Likes.
     * A like belongs to a user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo Inverse side of 1:1 relationship.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Creates a one-to-one relationship between Aircraft and Likes.
     * A like belongs to an aircraft.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo Inverse side of 1:1 relationship.
     */
    public function aircraft()
    {
        return $this->belongsTo(Aircraft::class);
    }

}
