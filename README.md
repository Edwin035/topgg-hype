# TopGG Shop (tienda)

Tienda web (SPA) de **pines / gift cards de gaming** de TopLevel GG. Muestra el
catálogo de [Pin Hype](https://hype.games/), deja comprar y pagar con **Binance Pay**,
y consulta el historial de compras.

Es solo el **frontend**. Consume la API del backend
[`hype-integration-2026`](https://github.com/Toppages/Hype). El panel de administración
vive en un repo aparte: [`topgg-admin`](https://github.com/Toppages/topgg-admin).

## Stack

React 18 · Vite · TypeScript · TailwindCSS · shadcn/ui (Radix) · React Router ·
`@tanstack/react-query` · `react-hook-form` + `zod`.

## Requisitos

- Node.js **18+**
- npm (gestor de paquetes canónico — no usar pnpm/bun)
- El backend corriendo y accesible (local o desplegado)

## Configuración (variables de entorno)

Copia `.env.example` a `.env` y ajusta los valores. **Ninguna de estas variables es un
secreto** (el frontend es público), pero definen a qué backend apunta:

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | Sí* | URL base del backend, **terminada en `/api`**. *Tiene un fallback en código, pero conviene setearla explícita. |
| `VITE_PIN_HYPE_COUNTRY` | No | País para el catálogo (default `CO`). |
| `VITE_PIN_HYPE_CURRENCY` | No | Moneda para el catálogo (default `COP`). |
| `VITE_PIN_HYPE_LANGUAGE` | No | Idioma para el catálogo (default `es`). |
| `VITE_FREE_FIRE_COLLECTION_ID` | No | Id de la colección destacada (default `2`). |

> Las `VITE_*` son de **tiempo de compilación**: si cambias una, hay que **reconstruir**.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # dev server en http://localhost:5173
npm run build      # build de producción (a dist/). NO hace typecheck.
npm run preview    # previsualizar el build
npm run lint       # ESLint
npm test           # tests (vitest)
```

Para chequear tipos: `npx tsc --noEmit` (el build usa SWC y no valida tipos).

## Flujo de compra (resumen)

El pin **no se canjea hasta que el pago está confirmado por webhook de Binance**. Al
confirmar la compra, el backend valida el precio real contra el catálogo, crea la venta
`PENDIENTE` y una orden de Binance; el usuario paga y, al volver, la página
`/pago/binance/success` hace polling hasta que la venta queda `COMPLETADA` (con el pin).

## Deploy (Cloudflare Pages / Netlify)

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Env:** `VITE_API_URL` = URL del backend + `/api`
- El SPA usa `public/_redirects` (`/* /index.html 200`) para el fallback de rutas.

## Repos relacionados

| Repo | Rol |
| --- | --- |
| `topgg-shop` (este) | Tienda / frontend público |
| [`hype-integration-2026`](https://github.com/Toppages/Hype) | Backend NestJS (API, pagos, Hype) |
| [`topgg-admin`](https://github.com/Toppages/topgg-admin) | Panel de administración (gestor) |
