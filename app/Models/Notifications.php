<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notifications extends Model
{
    use HasFactory;

    /**
     * Creates a one-to-one relationship between Aircraft and Notifications.
     * A notification is about one aircraft.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne 1:1 relationship.
     */
    public function aircraft() {
        return $this->hasOne(Aircraft::class);
    }

    /**
     * Creates a one-to-one relationship between Users and Notifications.
     * A notification was sent by a user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:1 relationship.
     */
    public function sender() {
        return $this->hasOne(User::class);
    }

    /**
     * Creates a one-to-one relationship between Users and Notifications.
     * A notification was received by a user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany 1:1 relationship.
     */
    public function recipient()
    {
        return $this->hasOne(User::class);
    }

    /**
     * Gets the parent of the notifiable model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo 1:1 polymorphic relationship.
     */
    public function notifiable() {
        return $this->morphTo();
    }

}
