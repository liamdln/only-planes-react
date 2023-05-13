<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

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
     * Create a one-to-one relationship between User and Profile.
     * A user has one profile.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne 1:1 relationship.
     */
    public function profile()
    {
        return $this->belongsTo(User::class);
    }

}
