<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    /**
     * Create a many-to-many relationship between Tags and Aircraft.
     * A tag belongs to many aircraft.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany Many:Many relationship.
     */
    public function aircraft()
    {
        return $this->belongsToMany(Aircraft::class, "aircraft_tags", "tag_id", "aircraft_id");
    }
}
