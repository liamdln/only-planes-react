<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        "author_id",
        "aircraft_id",
        "photo_url"
    ];

    /**
     * Creates a one-to-one relationship between AdditionalPhotos and Aircraft.
     * An additional photo belongs to an aircraft.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo Inverse side of 1:1 relationship.
     */
    public function aircraft()
    {
        return $this->belongsTo(Aircraft::class);
    }

    /**
     * Creates a one-to-one relationship between AdditionalPhotos and User.
     * An additional photo belongs to a user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo Inverse side of 1:1 relationship.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
