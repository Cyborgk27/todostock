<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Client
 *
 * @package App\Models
 * @property int $id
 * @property string $identification
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $address
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Invoice[] $invoices
 */
class Client extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'identification',
        'name',
        'email',
        'phone',
        'address',
    ];

    /**
     * Get the invoices for the client.
     *
     * @return HasMany
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
