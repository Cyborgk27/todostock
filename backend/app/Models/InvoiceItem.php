<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class InvoiceItem
 *
 * @package App\Models
 * @property int $id
 * @property int $invoice_id
 * @property int $product_id
 * @property int $quantity
 * @property float $price
 * @property float $tax_amount
 * @property float $total
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * * @property-read \App\Models\Invoice $invoice
 * @property-read \App\Models\Product $product
 */
class InvoiceItem extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'invoice_id',
        'product_id',
        'quantity',
        'price',
        'tax_amount',
        'total',
    ];

    /**
     * Get the invoice that owns the item.
     *
     * @return BelongsTo
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the product associated with the item.
     *
     * @return BelongsTo
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
