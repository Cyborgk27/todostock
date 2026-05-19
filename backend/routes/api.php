<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InvoiceController;
use Illuminate\Support\Facades\Route;

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas por token de Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Módulos CRUD avanzados de Todostock
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('products', ProductController::class);

    // Módulo de Procesamiento de Ventas (Solo Index, Store y Show según requerimientos)
    Route::apiResource('invoices', InvoiceController::class)->only(['index', 'store', 'show']);
});
