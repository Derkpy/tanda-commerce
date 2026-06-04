# IA_CONTEXT

Fecha de contexto: 2026-06-04

## Resumen del sistema

System Tandas es un sistema web y backend para gestionar ventas de productos mediante tandas. El objetivo del producto es permitir que una sucursal pueda vender ropa, calzado, bolsos, accesorios u otros productos, registrar una venta, dividir el pago en varias tandas y analizar el comportamiento de compra y pago de los clientes.

El problema que resuelve es operativo: centralizar clientes, ventas, productos, categorias, grupos, sucursales, pagos programados y seguimiento del historial de compra sin depender de calculos manuales o registros separados.

El proyecto esta organizado como monorepo con `pnpm`. No usar `npm`.

## Estructura general

```text
System_Tandas/
  backend/      API REST, Prisma, seguridad, auth, Redis, tests
  web/          App React/Vite, layout interno, vistas UI y login
  android/      Carpeta reservada para fase movil; no esta activa
  .github/      CI con GitHub Actions
```

Workspace pnpm:

```text
packages:
  - backend
  - web
```

## Tecnologias backend

- Node.js con TypeScript.
- Express 5.
- Prisma 7 con PostgreSQL.
- `@prisma/adapter-pg`.
- Zod para validacion de entorno, params y body.
- Redis para cache de endpoints GET.
- Argon2 para hashing de password.
- JWT con access token y refresh token.
- Cookies `httpOnly` para sesion web.
- Helmet, CORS estricto, rate limiting, compression y pino/pino-http.
- Vitest y Supertest para pruebas.
- Dockerfile para build del backend.

## Tecnologias frontend

- React 19.
- Vite.
- TypeScript.
- Tailwind CSS.
- React Router.
- Zustand.
- Axios.
- Recharts.
- React Hook Form.
- Zod.
- Lucide React.
- Componentes UI propios en `web/src/shared/ui`.
- Strings estaticos centralizados en `web/src/locales/es.json`.

## Backend: arquitectura y modulos

El backend sigue una estructura de monolito modular. Cada dominio vive en `backend/src/modules/<dominio>` con rutas, controladores, servicios y schemas cuando aplica.

Modulos actuales:

- `auth`: login, refresh, logout, me, cookies, JWT y rate limit especifico.
- `clients`: listar, crear y obtener cliente con IDs de tandas y ventas.
- `users`: obtener usuario por ID junto con sucursal.
- `tandas`: listar tandas con pagos.
- `groups`: listar y crear grupos de productos.
- `categories`: listar y crear categorias.
- `sales`: listar ventas con detalles, obtener venta por ID, preview y creacion con Builder.

Rutas principales:

```text
GET    /health
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
GET    /api/users/:id
GET    /api/tandas
GET    /api/groups
POST   /api/groups
GET    /api/categories
POST   /api/categories
GET    /api/sales
GET    /api/sales/:id
POST   /api/sales/build/preview
POST   /api/sales/build
```

Todas las rutas bajo `/api` quedan protegidas por `authMiddleware` despues de `/auth`, excepto las rutas publicas de login, refresh y logout segun su controlador.

## Backend: base de datos

La base esta modelada con Prisma en `backend/prisma/schema.prisma`.

Modelos principales:

- `Branch`: sucursal. El campo `localitation` se conserva escrito asi por decision previa.
- `User`: usuarios administradores, ligados a `Branch`, sin relacion directa con compras.
- `RefreshToken`: refresh tokens hasheados, revocables y con expiracion.
- `Client`: compradores, ligados a `Branch`.
- `Sale`: venta general, ligada a cliente y sucursal.
- `SaleDetail`: productos de una venta.
- `ProductGroup`: tabla `group` de la BD.
- `Category`: categorias con `code` unico.
- `Product`: productos con `code` unico y `priceProduct` nullable.
- `Tanda`: tanda ligada a venta y cliente.
- `PaymentTanda`: pagos programados de una tanda.

Se usa filtrado por sucursal en servicios de negocio. Por ejemplo, clientes, ventas y productos se resuelven con `idBranch` del usuario autenticado.

## Backend: Builder de venta/tanda

La logica central vive en `backend/src/modules/sales/sale-builder.ts`.

Responsabilidades actuales:

- Validar que exista al menos un producto.
- Validar `paymentCount >= 1`.
- Validar `paymentIntervalDays` entre 3 y 15.
- Validar que `firstPaymentDate` no sea anterior al dia actual.
- Calcular total en centavos.
- Generar fechas de pago.
- Dividir el total entre pagos.
- Ajustar centavos restantes en el ultimo pago.
- Preparar payload persistible para `sales`, `sale_details`, `tanda` y `payment_tanda`.

`POST /api/sales/build/preview` calcula sin guardar.  
`POST /api/sales/build` guarda con `prisma.$transaction`.

## Backend: cache y seguridad

El middleware `cacheMiddleware` cachea respuestas GET con TTL. La key incluye scope:

```text
cache:<url>:branch:<idBranch>:user:<idUser>
```

Esto evita mezclar datos privados entre usuarios o sucursales.

Despues de mutaciones relevantes se invalida cache por prefijos.

Seguridad implementada:

- `helmet`.
- `x-powered-by` desactivado.
- CORS con `FRONTEND_URL` y `CORS_ORIGINS`.
- Cookies `httpOnly`.
- Rate limit general para `/api`.
- Rate limit especifico para login y refresh.
- Body limit configurable.
- Errores centralizados.
- Validacion con Zod.
- Seed bloqueado en produccion.

## Frontend: arquitectura

El frontend esta en `web/src`.

Estructura relevante:

```text
app/
  layout/dashboard-layout.tsx
  providers/app-provider.tsx
  router/app-router.tsx
features/
  auth/
  clients/
  products/
  tandas/
shared/
  api/http-client.ts
  lib/cn.ts
  lib/i18n.ts
  ui/
locales/
  es.json
```

La app usa rutas protegidas. El login rehidrata sesion con `/api/auth/me`; Axios usa `withCredentials: true` para cookies `httpOnly`.

`httpClient` esta centralizado en `web/src/shared/api/http-client.ts`.

## Layout reutilizable

`DashboardLayout` contiene:

- Sidebar izquierdo reutilizable.
- Topbar reutilizable.
- Contenedor principal dinamico con `<Outlet />`.

El sidebar:

- Puede estar expandido, colapsado u oculto.
- Es fijo respecto al viewport.
- Tiene navegacion a Panel, Clientes, Tanda y Productos.
- Mantiene usuario autenticado en la parte inferior.

El topbar:

- Es sticky.
- Se oculta al hacer scroll hacia abajo.
- Reaparece al subir suficiente distancia.
- Contiene Perfil, Ajustes y Logout.

## Vistas actuales

### `/login`

Pantalla de inicio de sesion real contra backend.

- Campos: correo o usuario, contrasena.
- React Hook Form + Zod.
- Axios con cookies.
- Zustand guarda `user` y `authStatus`, no tokens.
- Los errores de credenciales, rate limit y error generico estan centralizados en strings.

### `/app`

Panel principal.

Incluye:

- Resumen visual de sucursal.
- Grafica de ventas por categoria.
- Grafica de ventas por mes.
- Tabla de clientes que mas compran con paginacion.

Estado actual: UI con datos mock. Preparada para conectar despues a endpoints reales.

### `/app/clients`

Vista Clientes.

Incluye:

- Titulo dinamico: `Conoce mejor a tu cliente` o `Conoce mejor a [nombre]`.
- Tabla pequeña de clientes con seleccion visual y paginacion.
- Card de status con color segun Bueno, Regular o Malo.
- Grafica `Cumplimiento de pagos` con selector de tanda/compra.
- Grafica `Volumen de compra` con paginacion `1 - 5 de 20`.
- Leyenda de periodo bajo `Volumen de compra`.
- Grafica de dona `Preferencia por categoria`.

Estado actual: UI con datos mock. La seleccion de cliente cambia la UI localmente, no consulta backend todavia.

### `/app/products`

Vista Productos / Inventario.

Incluye:

- Tabla de Grupos.
- Tabla de Categorias.
- Tabla de Productos.
- Botones compactos `Editar`, `Eliminar`, `Añadir`.
- Paginacion de 5 en 5 en Grupos y Categorias.
- Paginacion visual en Productos.

Estado actual: UI con datos mock. Los botones no abren modales ni llaman backend todavia.

### `/app/tanda`

Vista para crear una nueva tanda.

Incluye pasos:

1. Seleccionar cliente.
2. Ingresar producto.
3. Seleccionar cantidad de tandas.
4. Seleccionar frecuencia de pago.
5. Seleccionar primera fecha de pago.
6. Resumen de la tanda.

Los pasos tienen linea visual con el titulo centrado. El resumen tiene botones `Confirmar tanda` y `Cancelar`.

Estado actual: UI e interacciones locales. No esta unida a `POST /api/sales/build` todavia.

## Componentes y utilidades reutilizables

Frontend:

- `DashboardLayout`: shell interno del sistema.
- `Button`, `Input`, `Label`, `Alert`: componentes base en `shared/ui`.
- `httpClient`: Axios singleton.
- `t()`: helper simple de strings desde `es.json`.
- `cn()`: merge de clases.
- `zod-form-resolver`: resolver local para formularios.

Backend:

- `prisma`: cliente Prisma singleton.
- `redisCache`: cliente Redis con fallback.
- `cacheMiddleware`.
- `authMiddleware`.
- `validateBody`, `validateParams`.
- `asyncHandler`.
- `errorHandler`.
- `ApiError`.

## Decisiones tomadas

- El proyecto se separo en `backend`, `web` y `android`.
- Android queda reservado; no se debe tocar hasta la fase movil.
- Se usa monorepo con `pnpm`.
- El backend se organiza como monolito modular por dominio.
- La seguridad de login usa JWT en cookies `httpOnly`, no localStorage.
- `users` representa administradores y no compradores.
- Los compradores viven en `client`.
- `branch` permite filtrar datos por sucursal.
- `Product.priceProduct` es nullable para permitir precio manual en productos sin precio fijo.
- Las vistas internas comparten layout reutilizable.
- Los textos estaticos del frontend se centralizaron en `web/src/locales/es.json`.
- La UI sigue estilo SaaS dark premium inspirado en Railway/Linear/Vercel.
- CI valida tests, builds y Docker build, pero no despliega.

## Reglas de diseño a respetar

- Mantener el estilo dark premium actual.
- No cambiar colores, sombras, bordes, tipografia ni layout base sin solicitud explicita.
- Usar tarjetas glassmorphism con bordes `white/10`, fondos oscuros y acentos violetas/indigo.
- Usar `emerald` para estados positivos, `amber` para regular/advertencia y `rose` para eliminacion/error.
- Las tablas deben tener scroll horizontal controlado si no caben.
- Las graficas deben vivir en contenedores con altura estable y no recortarse.
- El sidebar y topbar deben mantenerse reutilizables.
- Todo texto fijo de vistas debe ir en `web/src/locales/es.json`.
- No poner tokens en localStorage.
- No crear landing pages internas; las rutas deben mostrar la experiencia operativa.
- No tocar `android` salvo instruccion directa.

## Que partes ya son funcionales

- Backend REST con Prisma, seguridad, cache y Builder.
- Auth backend con login, refresh, logout y me.
- Login frontend conectado al backend.
- Rutas frontend protegidas.
- Store de auth en Zustand.
- CI con Postgres, Redis, tests, typecheck, build y Docker build.
- Seed local para usuario admin, bloqueado en produccion.

## Que partes son solo UI por ahora

- Dashboard de metricas y graficas.
- Vista Clientes.
- Vista Productos / Inventario.
- Vista Tanda.
- Botones de Perfil y Ajustes en topbar.
- Botones Editar/Eliminar/Añadir en inventario.
- Confirmar/Cancelar tanda.
- Paginaciones de vistas mock.
- Datos de tablas y graficas en frontend.

## Que esta preparado para conectar despues

- `httpClient` ya apunta a `VITE_API_URL` o `/api`.
- Auth ya usa cookies y rehidratacion por `/api/auth/me`.
- Backend ya expone endpoints de clientes, grupos, categorias, ventas, tandas y usuarios.
- Builder backend ya puede previsualizar y guardar una tanda real.
- Vista Tanda ya tiene flujo visual equivalente al proceso de Builder.
- Vista Productos puede conectarse a endpoints de grupos/categorias y futuros endpoints de productos.
- Vista Clientes puede conectarse a endpoints de clientes, ventas, tandas y futuros reportes.
- Dashboard puede conectarse a endpoints analiticos futuros.

## Flujo de trabajo recomendado

Instalar dependencias:

```bash
corepack pnpm install
```

Backend:

```bash
corepack pnpm --filter system-tandas-backend dev
corepack pnpm --filter system-tandas-backend typecheck
corepack pnpm --filter system-tandas-backend test
corepack pnpm --filter system-tandas-backend build
```

Web:

```bash
corepack pnpm --filter system-tandas-web dev
corepack pnpm --filter system-tandas-web typecheck
corepack pnpm --filter system-tandas-web test:run
corepack pnpm --filter system-tandas-web build
```

Prisma:

```bash
corepack pnpm --filter system-tandas-backend prisma validate
corepack pnpm --filter system-tandas-backend prisma migrate dev
corepack pnpm --filter system-tandas-backend prisma generate
corepack pnpm --filter system-tandas-backend seed
```

No ejecutar migraciones o seeds contra produccion sin permiso explicito.

## Variables importantes

Backend:

- `DATABASE_URL`
- `REDIS_URL`
- `CACHE_TTL_SECONDS`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `REQUEST_BODY_LIMIT`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_LOGIN_RATE_LIMIT_MAX`
- `AUTH_REFRESH_RATE_LIMIT_MAX`
- `COOKIE_SAME_SITE`
- `COOKIE_DOMAIN`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_TTL_SECONDS`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_TTL_SECONDS`

Web:

- `VITE_API_URL`

## CI/CD actual

Archivo: `.github/workflows/ci.yml`

El pipeline corre en push a `main` y pull requests.

Hace:

- Instala con pnpm.
- Levanta Postgres y Redis como services.
- Prisma generate.
- Prisma migrate deploy.
- Typecheck backend.
- Tests backend.
- Build backend.
- Typecheck web.
- Tests web.
- Build web.
- Docker build backend.
- Docker build web.

No despliega y no publica imagenes.

## Proximos pasos sugeridos

1. Conectar `/app/tanda` con `POST /api/sales/build/preview` y `POST /api/sales/build`.
2. Crear endpoints faltantes para productos si se requiere CRUD real.
3. Conectar Inventario con grupos, categorias y productos reales.
4. Conectar Clientes con datos reales y endpoints analiticos.
5. Crear reportes backend para metricas del Dashboard.
6. Agregar modales o drawers para crear/editar/eliminar inventario.
7. Agregar pruebas de UI para vistas nuevas.
8. Revisar roles y permisos de usuarios administradores.
9. Mantener Android sin cambios hasta que inicie la fase movil.

## Notas para otros agentes

- No usar `npm`; usar siempre `pnpm` mediante `corepack pnpm`.
- No desplegar a produccion sin autorizacion.
- No tocar Android salvo instruccion directa.
- No revertir cambios existentes sin permiso.
- Antes de modificar UI, revisar `web/src/locales/es.json` y mantener strings centralizados.
- Antes de modificar backend, revisar schemas Zod, servicio del modulo y tests correspondientes.
- Mantener filtrado por sucursal en cualquier endpoint de negocio.
- Mantener cache privado por usuario/sucursal o desactivar cache si el endpoint puede mezclar informacion privada.
