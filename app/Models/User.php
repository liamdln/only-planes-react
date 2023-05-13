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
     * Creates a one-to-many relationship between Opinions and User.
     * A user has an opinion on many aircraft.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:Many relationship.
     */
    public function opinions()
    {
        return $this->hasMany(Opinion::class);
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

    /**
     * Create a one-to-many relationship between Notifications and a user.
     * A user has many notifications.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:Many relationship.
     */
    public function notifications() {
        return $this->hasMany(Notifications::class, "notifiable");
    }

    /**
     * Create a one-to-one relationship between User and Profile.
     * A user has one profile.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne 1:1 relationship.
     */
    public function profile() {
        return $this->hasOne(Profile::class);
    }

}
