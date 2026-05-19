<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: "/login",
        summary: "Iniciar sesión de usuario",
        description: "Autentica las credenciales del usuario y genera un token Bearer válido para consumir los endpoints de Todostock.",
        operationId: "authLogin",
        tags: ["Autenticación"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "password"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "admin@todotek.com"),
                    new OA\Property(property: "password", type: "string", format: "password", example: "password123")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Autenticación exitosa",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "access_token", type: "string", example: "1|7zK9gR..."),
                        new OA\Property(property: "token_type", type: "string", example: "Bearer"),
                        new OA\Property(property: "user", properties: [
                            new OA\Property(property: "name", type: "string", example: "Admin Todotek"),
                            new OA\Property(property: "email", type: "string", example: "admin@todotek.com")
                        ], type: "object")
                    ]
                )
            ),
            new OA\Response(
                response: 412,
                description: "Precondición fallida (Credenciales incorrectas)",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Las credenciales proporcionadas son incorrectas.")
                    ]
                )
            )
        ]
    )]
    /**
     * Handle user login and issue Sanctum token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Las credenciales proporcionadas son incorrectas.'
            ], 412);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'name' => $user->name,
                'email' => $user->email
            ]
        ], 200);
    }

    #[OA\Post(
        path: "/logout",
        summary: "Cerrar sesión de usuario",
        description: "Revoca y elimina el token de acceso actual del usuario autenticado para invalidar la sesión.",
        operationId: "authLogout",
        tags: ["Autenticación"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Sesión cerrada correctamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Sesión cerrada correctamente.")
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autenticado (Token inválido o ausente)"
            )
        ]
    )]
    /**
     * Handle user logout and revoke current token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.'
        ], 200);
    }
}
