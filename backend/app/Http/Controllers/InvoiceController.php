<?php

namespace App\Http\Controllers;

use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class InvoiceController extends Controller
{
    #[OA\Get(
        path: "/invoices",
        summary: "Obtener listado de facturas paginado",
        description: "Retorna una lista paginada de las facturas emitidas con la información básica del cliente. Permite buscar por número de factura, nombre o identificación del cliente.",
        operationId: "getInvoicesList",
        tags: ["Facturación"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "search",
                in: "query",
                description: "Término de búsqueda (número de factura, nombre o identificación del cliente)",
                required: false,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "page",
                in: "query",
                description: "Número de página para la paginación del servidor",
                required: false,
                schema: new OA\Schema(type: "integer", default: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Listado de facturas obtenido exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "current_page", type: "integer", example: 1),
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: "id", type: "integer", example: 1),
                                    new OA\Property(property: "client_id", type: "integer", example: 3),
                                    new OA\Property(property: "invoice_number", type: "string", example: "FAC-000001"),
                                    new OA\Property(property: "subtotal", type: "string", example: "150.00"),
                                    new OA\Property(property: "tax_total", type: "string", example: "22.50"),
                                    new OA\Property(property: "total", type: "string", example: "172.50"),
                                    new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z"),
                                    new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z"),
                                    new OA\Property(
                                        property: "client",
                                        properties: [
                                            new OA\Property(property: "id", type: "integer", example: 3),
                                            new OA\Property(property: "name", type: "string", example: "Kevin Cepeda"),
                                            new OA\Property(property: "identification", type: "string", example: "0955555555")
                                        ],
                                        type: "object"
                                    )
                                ],
                                type: "object"
                            )
                        ),
                        new OA\Property(property: "per_page", type: "integer", example: 10),
                        new OA\Property(property: "total", type: "integer", example: 15)
                    ],
                    type: "object"
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autenticado"
            )
        ]
    )]
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

    #[OA\Post(
        path: "/invoices",
        summary: "Crear una nueva factura (Venta transaccional)",
        description: "Procesa la venta de productos bajo una transacción de base de datos. Valida la disponibilidad de stock, calcula subtotales e impuestos en tiempo real y decrementa el inventario de forma automática.",
        operationId: "storeInvoice",
        tags: ["Facturación"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["client_id", "items"],
                properties: [
                    new OA\Property(property: "client_id", type: "integer", example: 1),
                    new OA\Property(
                        property: "items",
                        type: "array",
                        description: "Listado de productos y cantidades a facturar",
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: "product_id", type: "integer", example: 5),
                                new OA\Property(property: "quantity", type: "integer", example: 2)
                            ],
                            type: "object"
                        )
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Factura procesada y stock actualizado con éxito",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Factura procesada y stock actualizado con éxito."),
                        new OA\Property(
                            property: "invoice",
                            properties: [
                                new OA\Property(property: "id", type: "integer", example: 16),
                                new OA\Property(property: "client_id", type: "integer", example: 1),
                                new OA\Property(property: "invoice_number", type: "string", example: "FAC-000016"),
                                new OA\Property(property: "subtotal", type: "number", format: "float", example: 500.00),
                                new OA\Property(property: "tax_total", type: "number", format: "float", example: 75.00),
                                new OA\Property(property: "total", type: "number", format: "float", example: 575.00),
                                new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z"),
                                new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z")
                            ],
                            type: "object"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Error de negocio o validación (Ej: Stock insuficiente para el producto)",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Stock insuficiente para el producto: Producto Ejemplo. Disponibles: 1")
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autenticado"
            )
        ]
    )]
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

    #[OA\Get(
        path: "/invoices/{id}",
        summary: "Obtener el detalle completo de una factura",
        description: "Retorna la cabecera de la factura, la ficha del cliente y todas las líneas de detalle con la información del producto asociado.",
        operationId: "showInvoice",
        tags: ["Facturación"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                description: "ID único de la factura",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detalle de la factura obtenido exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer", example: 1),
                        new OA\Property(property: "invoice_number", type: "string", example: "FAC-000001"),
                        new OA\Property(property: "subtotal", type: "string", example: "100.00"),
                        new OA\Property(property: "tax_total", type: "string", example: "15.00"),
                        new OA\Property(property: "total", type: "string", example: "115.00"),
                        new OA\Property(
                            property: "client",
                            properties: [
                                new OA\Property(property: "id", type: "integer", example: 1),
                                new OA\Property(property: "name", type: "string", example: "Juan Pérez")
                            ],
                            type: "object"
                        ),
                        new OA\Property(
                            property: "items",
                            type: "array",
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: "id", type: "integer", example: 1),
                                    new OA\Property(property: "quantity", type: "integer", example: 2),
                                    new OA\Property(property: "price", type: "string", example: "50.00"),
                                    new OA\Property(property: "tax_amount", type: "string", example: "15.00"),
                                    new OA\Property(property: "total", type: "string", example: "115.00"),
                                    new OA\Property(
                                        property: "product",
                                        properties: [
                                            new OA\Property(property: "id", type: "integer", example: 5),
                                            new OA\Property(property: "name", type: "string", example: "Teclado Mecánico")
                                        ],
                                        type: "object"
                                    )
                                ],
                                type: "object"
                            )
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Factura no encontrada"
            ),
            new OA\Response(
                response: 401,
                description: "No autenticado"
            )
        ]
    )]
    /**
     * Display the specified resource.
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
