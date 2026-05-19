<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

class InvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $clients = Client::all();
        $products = Product::all();

        if ($clients->isEmpty() || $products->isEmpty()) {
            return;
        }

        // Crear 15 facturas de prueba
        for ($i = 1; $i <= 15; $i++) {
            $client = $clients->random();

            $invoice = Invoice::create([
                'client_id' => $client->id,
                'invoice_number' => 'FAC-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'subtotal' => 0,
                'tax_total' => 0,
                'total' => 0,
            ]);

            $subtotalAcumulado = 0;
            $taxAcumulado = 0;

            // Cada factura tendrá entre 1 y 4 productos distintos
            $selectedProducts = $products->random(rand(1, 4));

            foreach ($selectedProducts as $product) {
                $quantity = rand(1, 3);
                $price = $product->price;

                // Cálculos basados en el porcentaje de impuesto del producto [cite: 22]
                $itemSubtotal = $price * $quantity;
                $itemTax = $itemSubtotal * ($product->tax_percentage / 100);
                $itemTotal = $itemSubtotal + $itemTax;

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $price,
                    'tax_amount' => $itemTax,
                    'total' => $itemTotal,
                ]);

                $subtotalAcumulado += $itemSubtotal;
                $taxAcumulado += $itemTax;

                // Descontar del stock físico para probar la lógica de existencias [cite: 21]
                $product->decrement('stock', $quantity);
            }

            // Actualizar cabecera con los cálculos finales
            $invoice->update([
                'subtotal' => $subtotalAcumulado,
                'tax_total' => $taxAcumulado,
                'total' => $subtotalAcumulado + $taxAcumulado,
            ]);
        }
    }
}
