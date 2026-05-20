<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Product;
use App\Repositories\InvoiceRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function __construct(
        protected InvoiceRepository $invoiceRepository
    ) {}

    public function listInvoices(?string $search): LengthAwarePaginator
    {
        return $this->invoiceRepository->getPaginated($search, 10);
    }

    public function getInvoiceById(int $id): Invoice
    {
        return $this->invoiceRepository->findOrFail($id);
    }

    public function createInvoice(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            $invoiceNumber = $this->invoiceRepository->getNextInvoiceNumber();

            // 1. Crear cabecera temporal con valores iniciales en cero
            $invoice = $this->invoiceRepository->createHeader([
                'client_id'      => $data['client_id'],
                'invoice_number' => $invoiceNumber,
                'subtotal'       => 0,
                'tax_total'      => 0,
                'total'          => 0,
            ]);

            $subtotalGlobal = 0;
            $taxGlobal = 0;

            // 2. Procesar líneas de detalle, control de stock y acumulación de totales
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = $item['quantity'];

                // Regla de negocio: Verificar stock disponible
                if ($product->stock < $quantity) {
                    throw new \Exception("Stock insuficiente para el producto: {$product->name}. Disponibles: {$product->stock}", 422);
                }

                // Cálculos financieros exactos
                $itemSubtotal = $product->price * $quantity;
                $itemTax      = $itemSubtotal * ($product->tax_percentage / 100);
                $itemTotal    = $itemSubtotal + $itemTax;

                // Registrar línea estática e histórica
                $this->invoiceRepository->createItem([
                    'invoice_id' => $invoice->id,
                    'product_id' => $product->id,
                    'quantity'   => $quantity,
                    'price'      => $product->price,
                    'tax_amount' => $itemTax,
                    'total'      => $itemTotal,
                ]);

                // Decrementar inventario físico con protección nativa contra condiciones de carrera
                $product->decrement('stock', $quantity);

                // Acumuladores
                $subtotalGlobal += $itemSubtotal;
                $taxGlobal      += $itemTax;
            }

            // 3. Modificar la cabecera con los totales definitivos calculados
            $this->invoiceRepository->updateHeaderTotals($invoice, [
                'subtotal'  => $subtotalGlobal,
                'tax_total' => $taxGlobal,
                'total'     => $subtotalGlobal + $taxGlobal,
            ]);

            // Devolver la entidad completamente hidratada
            return $invoice->load('items.product', 'client');
        });
    }
}
