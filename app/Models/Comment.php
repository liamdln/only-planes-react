<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
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
        "content",
        "likes",
        "date"
    ];

    /**
     * Creates a one-to-one relationship between Aircraft and Comments.
     * A comment belongs to one aircraft.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo Inverse side of 1:1 relationship.
     */
    public function aircraft()
    {
        return $this->belongsTo(Aircraft::class);
    }

    /**
     * Creates a one-to-one relationship between User and Comments.
     * A comment belongs to one user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo Inverse side of 1:1 relationship.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
