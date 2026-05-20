# 🚀 Proyecto ERP - Guía de Desarrollo e Inicio Rápido

Este repositorio contiene un backend en **Laravel** y un frontend en **Angular**.

- El backend se ejecuta con **Docker Compose** y usa **PostgreSQL**.
- El frontend se ejecuta localmente con **Angular CLI**.

---

## 📁 Estructura del Proyecto

- `backend/` — Aplicación Laravel
- `frontend/` — Aplicación Angular

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado:

- [Docker](https://www.docker.com/)
- Docker Compose
- [Node.js](https://nodejs.org/) (recomendado LTS)
- [Angular CLI](https://angular.dev/cli) globalmente:
  ```bash
  npm install -g @angular/cli
  ```

---

## 🚀 Backend - Laravel + Docker

### 1. Preparar el entorno

1. Ve a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Copia el archivo de entorno:
   ```bash
   cp .env.example .env
   ```
3. Abre `.env` y ajusta las credenciales de PostgreSQL para que apunten al contenedor de Docker.

### 2. Levantar los contenedores

Inicia los servicios en segundo plano:

```bash
docker compose up -d
```

### 3. Instalar dependencias

Instala los paquetes de Composer dentro del contenedor de la aplicación:

```bash
docker compose exec app composer install
```

### 4. Generar la clave de aplicación

```bash
docker compose exec app php artisan key:generate
```

### 5. Generar documentación OpenAPI / Swagger

Esta aplicación usa Swagger para documentar la API. Genera la especificación con:

```bash
docker compose exec app php artisan l5-swagger:generate
```

Una vez generado, la documentación se suele exponer en:

- `http://localhost:8000/api/documentation`

### 6. Migraciones y datos iniciales

Aplica la estructura de base de datos y los seeders:

```bash
docker compose exec app php artisan migrate --seed
```

#### Comandos útiles de Artisan

- Reiniciar la base de datos desde cero:
  ```bash
  docker compose exec app php artisan migrate:fresh --seed
  ```
- Crear una nueva migración:
  ```bash
  docker compose exec app php artisan make:migration nombre_de_la_migracion
  ```

---

## 🎨 Frontend - Angular

### 1. Instalar dependencias

Cambia al directorio del frontend e instala los paquetes:

```bash
cd frontend
npm install
```

### 2. Iniciar el servidor de desarrollo

Ejecuta el frontend con Angular CLI:

```bash
ng serve
```

Alternativamente, para abrir en el navegador automáticamente:

```bash
ng serve -o
```

La aplicación se cargará en:

- `http://localhost:4200`

---

## ⏱️ Flujo rápido de inicio

Si ya tienes el proyecto configurado, estos son los pasos básicos:

```bash
# 1. Levantar Docker (backend + base de datos)
docker compose up -d

# 2. Generar o actualizar la documentación OpenAPI
docker compose exec app php artisan l5-swagger:generate

# 3. Aplicar migraciones
docker compose exec app php artisan migrate

# 4. Iniciar el frontend (en otra terminal)
cd frontend
ng serve
```

---

## 💡 Consejos útiles

- Añade alias para comandos frecuentes en tu shell:
  ```bash
  alias dcartisan="docker compose exec app php artisan"
  ```
- Esto permite usar comandos cortos como:
  ```bash
  dcartisan migrate --seed
  dcartisan l5-swagger:generate
  ```

- Si en el futuro quieres generar clientes desde OpenAPI, puedes usar herramientas como `openapi-generator-cli`.

---

## 📌 Notas adicionales

- Comprueba que `backend/.env` esté bien configurado con la base de datos del contenedor.
- Para ver logs del contenedor Laravel:
  ```bash
  docker compose logs -f app
  ```
- Para detener los contenedores:
  ```bash
  docker compose down
  ```
