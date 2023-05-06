<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        "role",
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Creates a one-to-many relationship between Aircraft and User.
     * A user has many aircraft.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:Many relationship.
     */
    public function aircraft()
    {
        return $this->hasMany(Aircraft::class);
    }

    /**
     * Creates a one-to-many relationship between Likes and User.
     * A user likes many aircraft.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:Many relationship.
     */
    public function likes()
    {
        return $this->hasMany(Likes::class);
    }

    /**
     * Creates a one-to-many relationship between AdditionalPhotos and User.
     * A user has many additional photos.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:Many relationship.
     */
    public function additionalPhotos()
    {
        return $this->hasMany(AdditionalPhotos::class);
    }

    /**
     * Creates a one-to-many relationship between Comments and User.
     * A user comments on many aircraft.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:Many relationship.
     */
    public function comments()
    {
        return $this->hasMany(Comments::class);
    }

}
