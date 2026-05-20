<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    public function __construct(
        protected ProductRepository $productRepository
    ) {}

    public function listProducts(string $search = null): LengthAwarePaginator
    {
        return $this->productRepository->getPaginated($search, 10);
    }

    public function getProductById(int $id): Product
    {
        return $this->productRepository->findOrFail($id);
    }

    public function createProduct(array $data, ?array $images): Product
    {
        $product = $this->productRepository->create($data);

        if ($images) {
            $this->uploadAndRegisterImages($product, $images);
        }

        return $product->load('images');
    }

    public function updateProduct(int $id, array $data, ?array $images): Product
    {
        $product = $this->productRepository->findOrFail($id);

        $product = $this->productRepository->update($product, $data);

        if ($images) {
            $this->uploadAndRegisterImages($product, $images);
        }

        return $product->load('images');
    }

    public function deleteProduct(int $id): void
    {
        $product = $this->productRepository->findOrFail($id);
        $this->productRepository->delete($product);
    }

    protected function uploadAndRegisterImages(Product $product, array $images): void
    {
        foreach ($images as $image) {
            $path = $image->store('products', 'public');
            $publicUrl = Storage::url($path);
            $this->productRepository->createImage($product->id, $publicUrl);
        }
    }
}
