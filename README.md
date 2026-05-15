# TopGG Shop

Aplicación web de e-commerce hecha con React + Vite + TypeScript + TailwindCSS, inspirada en un panel de tienda para gestión de productos, carrito y checkout.

---

## 🚀 Características principales

- Interfaz SPA responsive con rutas de usuario:
  - `/` inicio
  - `/catalogo` catálogo de productos
  - `/producto/:id` detalle del producto
  - `/checkout/:id` pago
  - `/factura/:id` visualización de factura
  - `/perfil` datos de usuario
  - `/historial` órdenes pasadas
  - `/aliados` página de aliados
- Autenticación con contexto (`AuthContext`) y dialog modal (`AuthDialog`)
- API data fetching con `@tanstack/react-query`
- Formularios validados con `react-hook-form`, `zod`
- Toaster + Sonner para alertas de usuario
- UI modular con componentes `shadcn/ui` personalizados
- Internacionalización parcial del UX en español (rutas y textos)

## 🧱 Estructura del proyecto

- `src/App.tsx`: ruta base, providers globales, enrutamiento
- `src/pages/`: vistas principales del flujo de tienda
- `src/components/`: componentes UI reutilizables
- `src/contexts/AuthContext.tsx`: estado auth global
- `src/lib/providers/`: configuraciones HTTP y endpoints API
- `src/hooks/`: hooks personalizados (`use-mobile`, `use-toast`, negocio)

## 🛠️ Requisitos

- Node.js 18+ (recomendado)
- Bun no es obligatorio, pero la configuración se basa en Vite

## 📦 Instalación

1. Clonar repositorio:

```bash
git clone https://github.com/micuenta/topgg-shop.git
cd topgg-shop
```

2. Instalar dependencias:

```bash
npm install
```

(ó `pnpm install`, `yarn install`)

## 🔧 Scripts disponibles

- `npm run dev` - Levanta entorno de desarrollo (`http://localhost:5173`)
- `npm run build` - Genera build de producción
- `npm run build:dev` - Build en modo desarrollo
- `npm run preview` - Previsualiza build local
- `npm run lint` - Ejecución de ESLint
- `npm test` - Ejecuta tests con Vitest
- `npm run test:watch` - tests watch mode

## 🧪 Pruebas

- Ubicación de tests: `src/test/` (ej. `example.test.ts`)
- Entorno de configuración: `src/test/setup.ts`

## 🛡️ Estilo de código

- ESLint, TypeScript strict, reglas de React Hooks
- Tailwind + `tailwind-merge` para clases condicionales

## 📌 Ajustes / desarrollo

- Rutas de API y proveedores: `src/lib/providers/endpoints/*`
- Catálogo y compra: `src/hooks/providers/*`
- Ajustes de UI: componentes en `src/components/ui/` y `src/components/*`

## 🔎 Recomendaciones

- Añadir `.env` variables para endpoints si la API es externa.
- Revisar `vite.config.ts` si se necesita proxy a microservicios.

## 🙌 Contribuir

1. Crear branch descriptivo: `feature/mi-mejora`
2. Hacer PR con cambios claros.
3. Incluir tests de nuevas funcionalidades.

---

## 📬 Contacto

Desarrollador: TopGG Shop

*Documentado el 27 de marzo de 2026.*
