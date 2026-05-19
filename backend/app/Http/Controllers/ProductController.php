<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Get(
        path: "/products",
        summary: "Obtener listado de productos con imágenes",
        description: "Retorna una lista paginada de los productos con sus respectivas imágenes asociadas. Permite buscar de forma dinámica por nombre o SKU.",
        operationId: "getProductsList",
        tags: ["Productos"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "search",
                in: "query",
                description: "Término de búsqueda para filtrar por nombre o SKU",
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
                description: "Listado de productos obtenido exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "current_page", type: "integer", example: 1),
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: "id", type: "integer", example: 1),
                                    new OA\Property(property: "name", type: "string", example: "Teclado Mecánico RGB"),
                                    new OA\Property(property: "sku", type: "string", example: "TEC-MECH-01"),
                                    new OA\Property(property: "description", type: "string", example: "Teclado con switches mecánicos y retroiluminación."),
                                    new OA\Property(property: "stock", type: "integer", example: 25),
                                    new OA\Property(property: "price", type: "string", example: "45.00"),
                                    new OA\Property(property: "tax_percentage", type: "string", example: "15.00"),
                                    new OA\Property(
                                        property: "images",
                                        type: "array",
                                        items: new OA\Items(
                                            properties: [
                                                new OA\Property(property: "id", type: "integer", example: 1),
                                                new OA\Property(property: "product_id", type: "integer", example: 1),
                                                new OA\Property(property: "file_path", type: "string", example: "/storage/products/abc123image.png")
                                            ],
                                            type: "object"
                                        )
                                    )
                                ],
                                type: "object"
                            )
                        ),
                        new OA\Property(property: "per_page", type: "integer", example: 10),
                        new OA\Property(property: "total", type: "integer", example: 50)
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
     * Display a listing of the resource with pagination, image load and searching.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $products = Product::with('images')
            ->when($search, function ($query, $search) {
                $query->where('name', 'ilike', "%{$search}%")
                      ->orWhere('sku', 'ilike', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(10);

        return response()->json($products, 200);
    }

    #[OA\Post(
        path: "/products",
        summary: "Registrar un nuevo producto con imágenes opcionales",
        description: "Crea un producto en el catálogo. Al manejar subida de archivos físicos, requiere que la petición sea de tipo multipart/form-data.",
        operationId: "storeProduct",
        tags: ["Productos"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["name", "sku", "stock", "price", "tax_percentage"],
                    properties: [
                        new OA\Property(property: "name", type: "string", example: "Mouse Gamer Óptico"),
                        new OA\Property(property: "sku", type: "string", example: "MOU-GAME-02"),
                        new OA\Property(property: "description", type: "string", example: "Mouse ergonómico con sensor de 16000 DPI."),
                        new OA\Property(property: "stock", type: "integer", example: 15),
                        new OA\Property(property: "price", type: "number", format: "float", example: 29.99),
                        new OA\Property(property: "tax_percentage", type: "number", format: "float", example: 15.00),
                        new OA\Property(
                            property: "images[]",
                            type: "array",
                            description: "Arreglo de imágenes físicas a subir (jpeg, png, webp. Máx 2MB por archivo)",
                            items: new OA\Items(type: "string", format: "binary")
                        )
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Producto creado exitosamente con sus imágenes vinculadas",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer", example: 6),
                        new OA\Property(property: "name", type: "string", example: "Mouse Gamer Óptico"),
                        new OA\Property(property: "sku", type: "string", example: "MOU-GAME-02"),
                        new OA\Property(property: "stock", type: "integer", example: 15),
                        new OA\Property(property: "price", type: "number", example: 29.99),
                        new OA\Property(property: "tax_percentage", type: "number", example: 15.00),
                        new OA\Property(property: "images", type: "array", items: new OA\Items(type: "object"))
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Error de validación (Ej: SKU ya registrado o formato de imagen no soportado)"
            ),
            new OA\Response(
                response: 401,
                description: "No autenticado"
            )
        ]
    )]
    /**
     * Store a newly created resource in storage with multiple images.
     *
     * @param StoreProductRequest $request
     * @return JsonResponse
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        // Extraer imágenes antes de la inserción masiva en tabla productos
        $images = $request->file('images');
        unset($validatedData['images']);

        $product = Product::create($validatedData);

        if ($request->hasFile('images')) {
            foreach ($images as $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'file_path' => Storage::url($path)
                ]);
            }
        }

        return response()->json($product->load('images'), 201);
    }

    #[OA\Get(
        path: "/products/{id}",
        summary: "Obtener la ficha detallada de un producto",
        description: "Retorna la información de un producto específico junto con su galería de imágenes a través de su ID.",
        operationId: "showProduct",
        tags: ["Productos"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                description: "ID único del producto",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Detalle del producto cargado correctamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer", example: 1),
                        new OA\Property(property: "name", type: "string", example: "Teclado Mecánico RGB"),
                        new OA\Property(property: "sku", type: "string", example: "TEC-MECH-01"),
                        new OA\Property(property: "stock", type: "integer", example: 25),
                        new OA\Property(property: "price", type: "string", example: "45.00"),
                        new OA\Property(property: "images", type: "array", items: new OA\Items(type: "object"))
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Producto no encontrado"
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
        $product = Product::with('images')->findOrFail($id);
        return response()->json($product, 200);
    }

    #[OA\Post(
        path: "/products/{id}",
        summary: "Actualizar datos y añadir imágenes a un producto",
        description: "Modifica un producto existente. Nota: Debido a limitaciones nativas de PHP para leer peticiones 'multipart/form-data' usando el método PUT, se recomienda consumir este endpoint mediante POST simulando el multipart.",
        operationId: "updateProduct",
        tags: ["Productos"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                description: "ID del producto a modificar",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["name", "sku", "stock", "price", "tax_percentage"],
                    properties: [
                        new OA\Property(property: "name", type: "string", example: "Teclado Mecánico RGB Pro"),
                        new OA\Property(property: "sku", type: "string", example: "TEC-MECH-01"),
                        new OA\Property(property: "description", type: "string", example: "Edición pro con switches customizados."),
                        new OA\Property(property: "stock", type: "integer", example: 20),
                        new OA\Property(property: "price", type: "number", format: "float", example: 49.99),
                        new OA\Property(property: "tax_percentage", type: "number", format: "float", example: 15.00),
                        new OA\Property(
                            property: "images[]",
                            type: "array",
                            description: "Nuevas imágenes físicas para agregar a la galería del producto",
                            items: new OA\Items(type: "string", format: "binary")
                        )
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Producto actualizado correctamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer", example: 1),
                        new OA\Property(property: "name", type: "string", example: "Teclado Mecánico RGB Pro"),
                        new OA\Property(property: "sku", type: "string", example: "TEC-MECH-01"),
                        new OA\Property(property: "images", type: "array", items: new OA\Items(type: "object"))
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Producto no encontrado"
            )
        ]
    )]
    /**
     * Update the specified resource in storage.
     *
     * @param UpdateProductRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $validatedData = $request->validated();

        $images = $request->file('images');
        unset($validatedData['images']);

        $product->update($validatedData);

        if ($request->hasFile('images')) {
            foreach ($images as $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'file_path' => Storage::url($path)
                ]);
            }
        }

        return response()->json($product->load('images'), 200);
    }

    #[OA\Delete(
        path: "/products/{id}",
        summary: "Eliminar un producto (Soft Delete)",
        description: "Aplica un borrado lógico al producto. El producto dejará de aparecer en los catálogos activos pero se conservará en la BD para consistencia del histórico de detalles de facturas.",
        operationId: "destroyProduct",
        tags: ["Productos"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                description: "ID del producto a eliminar lógicamente",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Producto eliminado lógicamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Producto eliminado lógicamente.")
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Producto no encontrado"
            )
        ]
    )]
    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete(); // Soft Delete en cascada controlado por capa lógica
        return response()->json(['message' => 'Producto eliminado lógicamente.'], 200);
    }
}
