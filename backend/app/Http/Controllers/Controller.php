<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Todostock API",
    description: "Documentación oficial de los endpoints de la API de Todostock para Todotek S.A. Incluye autenticación por Sanctum, gestión de inventarios y facturación transaccional.",
)]
#[OA\Server(
    url: "http://localhost/api",
    description: "Servidor Local de Desarrollo (Docker Sail)"
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    name: "Authorization",
    in: "header",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Introduce el token 'access_token' recibido en el login con el formato: Bearer {token}"
)]
abstract class Controller
{
    //
}
