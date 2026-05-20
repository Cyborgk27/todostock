<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository
{
    public function getPaginated(string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return Product::with('images')
            ->when($search, function ($query, $search) {
                $query->where('name', 'ilike', "%{$search}%")
                      ->orWhere('sku', 'ilike', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    public function findOrFail(int $id): Product
    {
        return Product::with('images')->findOrFail($id);
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        return $product;
    }

    public function delete(Product $product): bool
    {
        return $product->delete();
    }

    public function createImage(int $productId, string $publicUrl): ProductImage
    {
        return ProductImage::create([
            'product_id' => $productId,
            'file_path'  => $publicUrl
        ]);
    }
}
