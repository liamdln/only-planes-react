<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Opinion extends Model
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
     * Creates a one-to-one relationship between User and Opinions.
     * An opinion belongs to a user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo Inverse side of 1:1 relationship.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Creates a one-to-one relationship between Aircraft and Opinions.
     * An opinion belongs to an aircraft.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo Inverse side of 1:1 relationship.
     */
    public function aircraft()
    {
        return $this->belongsTo(Aircraft::class);
    }

}
