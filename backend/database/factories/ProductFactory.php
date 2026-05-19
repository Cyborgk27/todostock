<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'sku' => strtoupper($this->faker->unique()->bothify('PROD-####-????')),
            'description' => $this->faker->sentence(),
            'stock' => $this->faker->numberBetween(10, 100), // Control de existencias básico
            'price' => $this->faker->randomFloat(2, 5, 500), // Precios entre 5 y 500
            'tax_percentage' => 15.00, // IVA base sugerido en los supuestos técnicos [cite: 49]
        ];
    }
}
