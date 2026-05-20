<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Models\Client;
use App\Services\ClientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ClientController extends Controller
{
    public function __construct(
        protected ClientService $clientService
    ) {}

    #[OA\Get(
        path: "/clients",
        summary: "Obtener listado de clientes paginado",
        description: "Retorna una lista pagipada de los clientes registrados. Permite buscar de forma dinámica por nombre, identificación o email utilizando el parámetro 'search'.",
        operationId: "getClientsList",
        tags: ["Clientes"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "search",
                in: "query",
                description: "Término de búsqueda para filtrar clientes (nombre, identificación, email)",
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
                description: "Listado de clientes obtenido exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "current_page", type: "integer", example: 1),
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: "id", type: "integer", example: 1),
                                    new OA\Property(property: "identification", type: "string", example: "0987654321"),
                                    new OA\Property(property: "name", type: "string", example: "Juan Pérez"),
                                    new OA\Property(property: "email", type: "string", example: "juan.perez@example.com"),
                                    new OA\Property(property: "phone", type: "string", example: "0999999999"),
                                    new OA\Property(property: "address", type: "string", example: "Av. Principal y Calle 2"),
                                    new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z"),
                                    new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z")
                                ],
                                type: "object"
                            )
                        ),
                        new OA\Property(property: "first_page_url", type: "string", example: "http://localhost/api/clients?page=1"),
                        new OA\Property(property: "from", type: "integer", example: 1),
                        new OA\Property(property: "last_page", type: "integer", example: 3),
                        new OA\Property(property: "last_page_url", type: "string", example: "http://localhost/api/clients?page=3"),
                        new OA\Property(property: "next_page_url", type: "string", example: "http://localhost/api/clients?page=2"),
                        new OA\Property(property: "path", type: "string", example: "http://localhost/api/clients"),
                        new OA\Property(property: "per_page", type: "integer", example: 10),
                        new OA\Property(property: "prev_page_url", type: "string", example: null),
                        new OA\Property(property: "to", type: "integer", example: 10),
                        new OA\Property(property: "total", type: "integer", example: 30)
                    ],
                    type: "object"
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autenticado (Token inválido o ausente)"
            )
        ]
    )]
    /**
     * Display a listing of the resource with pagination and searching.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $clients = $this->clientService->listClients($request->query('search'));
        return response()->json($clients, 200);
    }

    #[OA\Post(
        path: "/clients",
        summary: "Registrar un nuevo cliente",
        description: "Crea un registro de cliente en el sistema. Valida campos únicos como identificación y correo electrónico.",
        operationId: "storeClient",
        tags: ["Clientes"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["identification", "name", "email"],
                properties: [
                    new OA\Property(property: "identification", type: "string", example: "0955555555"),
                    new OA\Property(property: "name", type: "string", example: "Carlos Mendoza"),
                    new OA\Property(property: "email", type: "string", format: "email", example: "carlos.mendoza@example.com"),
                    new OA\Property(property: "phone", type: "string", example: "0988888888"),
                    new OA\Property(property: "address", type: "string", example: "Cdla. El Recreo, Durán")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Cliente creado exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer", example: 31),
                        new OA\Property(property: "identification", type: "string", example: "0955555555"),
                        new OA\Property(property: "name", type: "string", example: "Carlos Mendoza"),
                        new OA\Property(property: "email", type: "string", example: "carlos.mendoza@example.com"),
                        new OA\Property(property: "phone", type: "string", example: "0988888888"),
                        new OA\Property(property: "address", type: "string", example: "Cdla. El Recreo, Durán"),
                        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z"),
                        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Error de validación (Campos inválidos o duplicados)"
            ),
            new OA\Response(
                response: 401,
                description: "No autenticado"
            )
        ]
    )]
    /**
     * Store a newly created resource in storage.
     *
     * @param StoreClientRequest $request
     * @return JsonResponse
     */
    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = $this->clientService->createClient($request->validated());
        return response()->json($client, 201);
    }

    #[OA\Get(
        path: "/clients/{id}",
        summary: "Obtener el detalle de un cliente específico",
        description: "Busca y retorna la información completa de un cliente por su ID.",
        operationId: "showClient",
        tags: ["Clientes"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                description: "ID único del cliente",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Ficha del cliente obtenida correctamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer", example: 1),
                        new OA\Property(property: "identification", type: "string", example: "0987654321"),
                        new OA\Property(property: "name", type: "string", example: "Juan Pérez"),
                        new OA\Property(property: "email", type: "string", example: "juan.perez@example.com"),
                        new OA\Property(property: "phone", type: "string", example: "0999999999"),
                        new OA\Property(property: "address", type: "string", example: "Av. Principal y Calle 2"),
                        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z"),
                        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z")
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Cliente no encontrado"
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
        $client = $this->clientService->getClientById($id);
        return response()->json($client, 200);
    }

    #[OA\Put(
        path: "/clients/{id}",
        summary: "Actualizar datos de un cliente",
        description: "Modifica la información de un cliente existente de acuerdo a su ID. Valida excepciones unique si el correo o cédula pertenecen al mismo registro.",
        operationId: "updateClient",
        tags: ["Clientes"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                description: "ID del cliente a modificar",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["identification", "name", "email"],
                properties: [
                    new OA\Property(property: "identification", type: "string", example: "0987654321"),
                    new OA\Property(property: "name", type: "string", example: "Juan Carlos Pérez"),
                    new OA\Property(property: "email", type: "string", format: "email", example: "juan.carlos@example.com"),
                    new OA\Property(property: "phone", type: "string", example: "0911111111"),
                    new OA\Property(property: "address", type: "string", example: "Urdesa Central, Guayaquil")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Cliente actualizado exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer", example: 1),
                        new OA\Property(property: "identification", type: "string", example: "0987654321"),
                        new OA\Property(property: "name", type: "string", example: "Juan Carlos Pérez"),
                        new OA\Property(property: "email", type: "string", example: "juan.carlos@example.com"),
                        new OA\Property(property: "phone", type: "string", example: "0911111111"),
                        new OA\Property(property: "address", type: "string", example: "Urdesa Central, Guayaquil"),
                        new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z"),
                        new OA\Property(property: "updated_at", type: "string", format: "date-time", example: "2026-05-19T00:00:00.000000Z")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Error de validación de datos"
            ),
            new OA\Response(
                response: 404,
                description: "Cliente no encontrado"
            )
        ]
    )]
    /**
     * Update the specified resource in storage.
     *
     * @param UpdateClientRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateClientRequest $request, int $id): JsonResponse
    {
        $client = $this->clientService->updateClient($id, $request->validated());
        return response()->json($client, 200);
    }

    #[OA\Delete(
        path: "/clients/{id}",
        summary: "Eliminar un cliente (Soft Delete)",
        description: "Realiza el borrado lógico de un cliente en la base de datos para no afectar la integridad histórica de facturas pasadas.",
        operationId: "destroyClient",
        tags: ["Clientes"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                description: "ID del cliente a eliminar lógicamente",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Cliente eliminado lógicamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Cliente eliminado lógicamente.")
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Cliente no encontrado"
            ),
            new OA\Response(
                response: 401,
                description: "No autenticado"
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
        $this->clientService->deleteClient($id);
        return response()->json(['message' => 'Cliente eliminado lógicamente.'], 200);
    }
}
