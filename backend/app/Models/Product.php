<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Product
 *
 * @package App\Models
 * @property int $id
 * @property string $name
 * @property string $sku
 * @property string|null $description
 * @property int $stock
 * @property float $price
 * @property float $tax_percentage
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\ProductImage[] $images
 */
class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'sku',
        'description',
        'stock',
        'price',
        'tax_percentage',
    ];

    /**
     * Get the images for the product.
     *
     * @return HasMany
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }
}
