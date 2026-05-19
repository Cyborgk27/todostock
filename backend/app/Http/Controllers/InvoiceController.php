<?php

namespace App\Http\Controllers;

use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices with client information and pagination.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $invoices = Invoice::with('client')
            ->when($search, function ($query, $search) {
                $query->where('invoice_number', 'ilike', "%{$search}%")
                      ->orWhereHas('client', function ($q) use ($search) {
                          $q->where('name', 'ilike', "%{$search}%")
                            ->orWhere('identification', 'like', "%{$search}%");
                      });
            })
            ->orderBy('id', 'desc')
            ->paginate(10);

        return response()->json($invoices, 200);
    }

    /**
     * Store a newly created invoice and update inventory using DB Transactions.
     *
     * @param StoreInvoiceRequest $request
     * @return JsonResponse
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $itemsData = $request->input('items');

            // Generar secuencial de factura único automáticamente (Ej: FAC-000001)
            $lastInvoice = Invoice::orderBy('id', 'desc')->first();
            $nextId = $lastInvoice ? $lastInvoice->id + 1 : 1;
            $invoiceNumber = 'FAC-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);

            // Crear la cabecera de la factura de forma temporal con totales en cero
            $invoice = Invoice::create([
                'client_id' => $request->input('client_id'),
                'invoice_number' => $invoiceNumber,
                'subtotal' => 0,
                'tax_total' => 0,
                'total' => 0,
            ]);

            $subtotalGlobal = 0;
            $taxGlobal = 0;

            foreach ($itemsData as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = $item['quantity'];

                // ⚠️ Regla de negocio crítica: Verificar control de existencias stock
                if ($product->stock < $quantity) {
                    throw new \Exception("Stock insuficiente para el producto: {$product->name}. Disponibles: {$product->stock}", 422);
                }

                // Cálculos financieros precisos
                $itemSubtotal = $product->price * $quantity;
                $itemTax = $itemSubtotal * ($product->tax_percentage / 100);
                $itemTotal = $itemSubtotal + $itemTax;

                // Registrar la línea de detalle estática e histórica
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $product->price,
                    'tax_amount' => $itemTax,
                    'total' => $itemTotal,
                ]);

                // Descontar inventario físico de forma segura
                $product->decrement('stock', $quantity);

                // Acumular los totales
                $subtotalGlobal += $itemSubtotal;
                $taxGlobal += $itemTax;
            }

            // Actualizar la cabecera de la factura con los cálculos finales exactos
            $invoice->update([
                'subtotal' => $subtotalGlobal,
                'tax_total' => $taxGlobal,
                'total' => $subtotalGlobal + $taxGlobal,
            ]);

            return response()->json([
                'message' => 'Factura procesada y stock actualizado con éxito.',
                'invoice' => $invoice->load('items.product', 'client')
            ], 201);

        });
    }

    /**
     * Display the specified invoice with full detail relations.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $invoice = Invoice::with(['client', 'items.product'])->findOrFail($id);
        return response()->json($invoice, 200);
    }
}
