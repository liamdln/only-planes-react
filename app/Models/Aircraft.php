<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aircraft extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        "name",
        "model",
        "make",
        "reg",
        "location_lat",
        "location_lng",
        "featured_photo_url"
    ];

    /**
     * Creates a one-to-one relationship between Aircraft and User.
     * An aircraft belongs to one user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo Inverse side of 1:1 relationship;
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Creates a one-to-many relationship between Aircraft and Comments.
     * An aircraft has many comments.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:Many relationship.
     */
    public function comments()
    {
        return $this->hasMany(Comments::class);
    }

    /**
     * Creates a one-to-many relationship between Aircraft and AdditionalPhotos.
     * An aircraft has many additional photos.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:Many relationship.
     */
    public function additionalPhotos()
    {
        return $this->hasMany(AdditionalPhotos::class);
    }

    /**
     * Creates a one-to-many relationship between Aircraft and Likes.
     * An aircraft has many likes.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:Many relationship.
     */
    public function likes()
    {
        return $this->hasMany(Likes::class);
    }

}
