# Productos propios con inventario — Diseño

**Fecha:** 2026-07-24
**Estado:** aprobado (pendiente de plan de implementación)
**Repos afectados:** `hype-integration-2026` (backend), `topgg-admin` (panel), `topgg-shop` (tienda)

---

## 1. Problema

Hoy la tienda TopGG vende **solo** productos del proveedor Pin Hype: el catálogo es un
passthrough de solo lectura y la entrega es un `pre-redeem` contra Hype tras el pago.
No existe forma de vender producto propio.

Se necesita **registrar productos propios** (nombre, precio, imagen), mantener un
**inventario** de unidades vendibles, y que aparezcan **en la misma tienda**, con entrega
automática tras el pago — igual de fiable que el flujo de Hype.

El patrón de referencia es `proyecto_mayorista/backend-mayorista`, que ya resuelve esto:
`Product` + `Pin` (código único) + asignación transaccional con advisory lock.

## 2. Decisiones tomadas

| Decisión | Elección |
| --- | --- |
| Tipo de inventario | **Pool de códigos únicos** (como los `Pin` del mayorista) |
| Imágenes | **Cloudflare Images** (subida desde el panel) |
| Presentación en tienda | **Mezclados** en el mismo catálogo, como una sección más |
| Alcance v1 | **Mínimo útil** (sin grupos, sin límites de compra, sin bitácora) |
| Dónde se agregan los catálogos | **En el backend** (la tienda sigue siendo tonta) |
| Identidad de producto | `Int` con secuencia desde **1.000.000** + `Sale.origen` |
| Pago | Sin cambios: **Binance, pagar primero, entregar después** |

## 3. Alcance

**Dentro:**
- CRUD de productos propios (nombre, descripción, precio USD, imagen, activo).
- Carga y borrado de códigos de inventario en lote.
- Catálogo público agregado (Hype + propios) con la misma forma actual.
- Compra y entrega automática de productos propios por el flujo Binance existente.
- Pantalla de administración en el panel.

**Fuera (futuro):** grupos/categorías, flag `hot`, límite y mínimo de compra, alerta de
inventario mínimo, bitácora de auditoría (`ProductEventLog`), estadísticas de inventario.

## 4. Modelo de datos

Dos modelos nuevos y un discriminador en `Sale`.

```prisma
enum SaleOrigin {
  HYPE
  PROPIO
}

model OwnProduct {
  id          Int      @id @default(autoincrement()) // secuencia desde 1_000_000
  name        String
  description String?
  price       Decimal  @db.Decimal(12, 2)  // SIEMPRE en USD
  imageUrl    String
  isActive    Boolean  @default(true)

  codes     ProductCode[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive])
}

model ProductCode {
  id        String    @id @default(uuid())
  code      String    @unique
  cost      Decimal?  @db.Decimal(12, 2)  // costo de adquisición (margen)
  expiresAt DateTime?

  productId Int
  product   OwnProduct @relation(fields: [productId], references: [id], onDelete: Cascade)

  // saleId null = disponible. Es la definición de stock.
  saleId     Int?
  sale       Sale?     @relation(fields: [saleId], references: [id])
  assignedAt DateTime?

  createdAt DateTime @default(now())

  @@index([productId, saleId]) // clave: contar stock libre
  @@index([saleId])
}
```

En `Sale` se añade:

```prisma
  origen SaleOrigin @default(HYPE)
  productCodes ProductCode[]
```

**Nota sobre `Sale.productId`:** sigue siendo `Int` y **no cambia**. Para un producto propio
guarda el `OwnProduct.id`. El campo `origen` dice cómo interpretarlo.

**Migración:** además de crear tablas/enum/columna, debe ejecutar
`ALTER SEQUENCE "OwnProduct_id_seq" RESTART WITH 1000000;`

**Entrega:** los códigos vendidos se copian a `SalePin.pin` (el modelo que ya existe), así
la factura, el historial y el panel funcionan sin cambios.

> El código queda en **dos sitios a propósito**: `ProductCode` es el registro de
> **inventario** (qué compré, a qué costo, si ya se vendió) y `SalePin` el de **entrega**
> (qué recibió el cliente en esta venta). Separarlos evita que el historial de una venta
> dependa de que el inventario nunca se toque.

## 5. Separación del espacio de ids (y su riesgo)

Los ids de Hype rondan ~2.700. Los productos propios arrancan en **1.000.000**, así que
`Sale.productId`, la ruta `/producto/:id`, el checkout y la factura siguen funcionando con
`Int` sin tocar nada.

**Trade-off asumido:** es una separación **por convención, no por tipo**. Si Hype algún día
emitiera ids ≥ 1.000.000 habría colisión. Mitigación: al agregar el catálogo, si aparece un
producto de Hype con id ≥ `OWN_ID_OFFSET`, se registra un `logger.error` y **se descarta ese
producto** (fail-closed: mejor no venderlo que venderlo confundido).

## 6. Backend

### 6.1 Módulo `products` (solo ADMIN)

Todo bajo `@UseGuards(JwtAuthGuard, AdminGuard)`.

| Método | Ruta | Qué hace |
| --- | --- | --- |
| POST | `/products` | Crea producto. Multipart: campos + archivo `cover`. |
| GET | `/products` | Lista con `stock` (conteo de códigos libres). |
| GET | `/products/:id` | Detalle + stock. |
| PATCH | `/products/:id` | Edita. `cover` opcional (si no viene, conserva imagen). |
| DELETE | `/products/:id` | **Desactiva** (`isActive=false`). Nunca borra: hay ventas asociadas. |
| POST | `/products/:id/codes` | Carga en lote `{ codes: [{ code, cost?, expiresAt? }] }`. |
| GET | `/products/:id/codes?status=free\|sold` | Lista códigos (solo admin). |
| DELETE | `/products/:id/codes` | Borra por ids, **solo los que tengan `saleId = null`**. |

Carga en lote: es **parcial y reportada** — inserta los válidos y devuelve
`{ insertados, duplicados: [...], invalidos: [...] }`. Un código repetido no aborta el lote
(lo garantiza el `@unique` + `skipDuplicates`).

### 6.2 Módulo `storefront-catalog` (público)

`GET /catalog` → devuelve `ProviderCollection[]`, **la misma forma que hoy**:
árbol de Hype + una colección sintética con los productos propios activos.

Cada producto propio se normaliza al shape del proveedor:
`{ id, name, description, salesPrice, salesCurrencyCode: 'USD', salesCurrencySymbol: '$',
coverImage: imageUrl, isAvailable: stock > 0 }`.

- Nombre de la sección: configurable por env **`STOREFRONT_OWN_SECTION_NAME`**,
  default **`Gift Cards`**.
- Productos con `isActive=false` **o stock 0** no se incluyen.
- Si la llamada a Hype falla, se devuelven **al menos** los productos propios (y viceversa):
  un proveedor caído no debe vaciar la tienda entera.

### 6.3 Cambios en `checkout`

`purchase()` — se ramifica por origen (`productId >= OWN_ID_OFFSET` → `PROPIO`):

| Paso | HYPE (hoy) | PROPIO (nuevo) |
| --- | --- | --- |
| Precio | árbol del catálogo de Hype | `OwnProduct.price` de la BD |
| Moneda | validada contra la pedida | siempre `USD` (respeta el fail-closed vigente) |
| Stock | `getProductStock` de Hype | `count(ProductCode where saleId null)` |
| Venta | `origen: HYPE` | `origen: PROPIO` |

El resto (orden de Binance, `PENDIENTE`, USDT 1:1) es **idéntico**.

`fulfill()` — se ramifica igual:
- **HYPE:** sin cambios (`pre-redeem` por unidad, all-or-nothing con reversa).
- **PROPIO:** asigna N códigos del pool (ver §7) y los copia a `SalePin`. **No** llama a Hype
  y **no** necesita reversa: si algo falla, la transacción revierte y no se asigna nada.

Si no alcanzan los códigos, se usa el camino de fallo que **ya existe**: suma
`fulfillmentAttempts`, reintenta, y al máximo → `REQUIERE_ATENCION` para gestión manual.

## 7. Concurrencia (evitar vender el mismo código dos veces)

Se copia el patrón probado del mayorista. Dentro de una `$transaction`:

1. `SELECT pg_advisory_xact_lock(hashtext('own:assign:<productId>')::bigint)` — el lock es
   **por producto**, que es donde está la contención (el pool), no por venta.
2. Seleccionar N códigos con `saleId: null`, ordenados por `expiresAt` ascendente (primero lo
   que caduca antes) y luego por `createdAt`.
3. `updateMany({ where: { id: { in: ids }, saleId: null }, data: { saleId, assignedAt } })`
   — el `saleId: null` en el `where` es la red de seguridad: si otro proceso ganó, actualiza
   menos filas de las pedidas.
4. Verificar que el número de filas actualizadas **es exactamente** `quantity`. Si no, lanzar
   → la transacción revierte y la venta va al camino de reintento.

## 8. Panel de administración (`topgg-admin`)

Nueva ruta **`/productos`** (y su ítem de navegación):
- **Tabla:** miniatura, nombre, precio, **stock**, estado (activo/inactivo).
- **Alta/edición:** diálogo con nombre, descripción, precio, activo y selector de imagen
  (previsualización antes de subir).
- **Inventario:** diálogo por producto — pegar códigos (uno por línea, coste opcional),
  ver stock actual, y borrar códigos **no vendidos**. Muestra el resultado del lote
  (insertados / duplicados / inválidos).

## 9. Tienda (`topgg-shop`)

Cambio mínimo: `getCatalogTree()` apunta a **`GET /catalog`** en vez de
`/pin-hype/catalog`. Todo lo demás se mantiene porque la forma no cambia:
el fail-closed de moneda, el orden natural alfanumérico y el aplanado de secciones.

## 10. Seguridad

- **Los códigos nunca salen en respuestas públicas.** El catálogo agregado expone
  disponibilidad, jamás `code`. Habrá un test que lo verifique.
- Todo `/products*` exige rol **ADMIN** (`AdminGuard`), igual que el resto del panel.
- El cliente ve su código **solo** a través de su propia venta ya pagada
  (`GET /sales/me/:id` / factura), exactamente como hoy con los pines de Hype.
- La subida de imagen valida **tipo MIME y tamaño** antes de mandarla a Cloudflare.
- Credenciales de Cloudflare por `.env`, nunca en el repo.

## 11. Manejo de errores

| Situación | Comportamiento |
| --- | --- |
| Hype caído al pedir el catálogo | Se devuelven los productos propios; la tienda no queda vacía |
| Producto propio sin stock | No aparece en el catálogo; si se intenta comprar, se rechaza **antes** de cobrar |
| Stock agotado entre el pago y la entrega | Reintentos → `REQUIERE_ATENCION` (gestión manual, sin refund automático) |
| Código duplicado al cargar | Se ignora y se reporta; el resto del lote entra |
| Fallo de Cloudflare al subir imagen | El alta falla con mensaje claro; no se crea producto sin imagen |

## 12. Pruebas (todas en local, con backend local)

1. **Concurrencia:** dos entregas simultáneas del mismo producto **no** entregan el mismo
   código, y una de ellas falla limpiamente si el stock no alcanza.
2. **Stock:** compra rechazada antes de cobrar si no hay códigos suficientes.
3. **Precio y moneda:** producto propio se cotiza en USD y pasa el guard de moneda.
4. **Fuga de códigos:** la respuesta de `GET /catalog` **no** contiene ningún `code`.
5. **Carga en lote:** duplicados reportados sin abortar el lote.
6. **Autorización:** un cliente (`USER`) recibe 403 en todo `/products*`.
7. **Extremo a extremo local:** registrar producto → cargar códigos → verlo en la tienda →
   comprarlo (hasta el 451 de Binance, que es el límite conocido en local).

## 13. Despliegue

1. Migración Prisma (tablas, enum, columna, `RESTART WITH 1000000`).
2. Nuevas variables: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`,
   `CLOUDFLARE_IMAGE_UPLOAD_URL`, y opcional `STOREFRONT_OWN_SECTION_NAME`.
3. **Orden: backend primero**, luego panel y tienda (la tienda nueva pide `/catalog`, que
   solo existe tras desplegar el backend).

## 14. Riesgos asumidos

- **Sin bitácora en v1:** el inventario es dinero y no quedará registro de quién cargó o
  borró códigos. Aceptable con un solo administrador; **conviene añadirla antes de que haya
  un segundo**.
- **Convención de ids** (§5), mitigada con descarte defensivo.
- **Costo de Cloudflare Images** según volumen.
- Un `OwnProduct` desactivado con ventas históricas debe seguir resolviéndose para las
  facturas antiguas (por eso se desactiva en vez de borrar).
