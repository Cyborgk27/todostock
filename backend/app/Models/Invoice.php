<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Invoice
 *
 * @package App\Models
 * @property int $id
 * @property int $client_id
 * @property string $invoice_number
 * @property float $subtotal
 * @property float $tax_total
 * @property float $total
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * * @property-read \App\Models\Client $client
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\InvoiceItem[] $items
 */
class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_id',
        'invoice_number',
        'subtotal',
        'tax_total',
        'total',
    ];

    /**
     * Get the client that owns the invoice.
     *
     * @return BelongsTo
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the detailed items for the invoice.
     *
     * @return HasMany
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
