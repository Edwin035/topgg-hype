# Productos propios con inventario — Plan de implementación

> **Para quien ejecute esto:** cada fase se hace y se verifica de forma independiente.
> Los pasos usan checkbox (`- [ ]`) para seguimiento. **Todas las pruebas se corren en
> LOCAL** con el backend local (`PORT=3002`) y la BD local `topgg_dev`.

**Objetivo:** permitir registrar productos propios con inventario de códigos únicos, que se
muestren mezclados en la tienda y se entreguen automáticamente tras el pago.

**Arquitectura:** el backend agrega el catálogo de Hype con los productos propios y lo sirve
en una sola forma; el checkout se ramifica por `Sale.origen`; la entrega asigna códigos del
pool local con lock por producto en vez de llamar a Hype.

**Stack:** NestJS 11 · Prisma 7 · PostgreSQL · React 18 + Vite + shadcn/ui · Jest · Vitest

**Spec:** `docs/superpowers/specs/2026-07-24-productos-propios-inventario-design.md`

---

## Mapa de archivos

### Backend (`hype-integration-2026`)

| Archivo | Responsabilidad |
| --- | --- |
| `prisma/schema.prisma` | Modelos `OwnProduct`, `ProductCode`, enum `SaleOrigin`, campo `Sale.origen` |
| `src/products/products.module.ts` | Wiring del módulo admin |
| `src/products/products.controller.ts` | Rutas `/products*` (solo ADMIN) |
| `src/products/products.service.ts` | CRUD + stock |
| `src/products/codes.service.ts` | Inventario: carga en lote, listado, borrado |
| `src/products/dto/*.ts` | Validación de entrada |
| `src/common/cloudflare-images.service.ts` | Subida de imágenes (copiado del mayorista) |
| `src/storefront/storefront.controller.ts` | `GET /catalog` público |
| `src/storefront/storefront.service.ts` | Agregación Hype + propios + normalización |
| `src/checkout/checkout.service.ts` | Ramas por origen en `purchase()` y `fulfill()` |
| `src/checkout/own-fulfillment.service.ts` | Asignación transaccional de códigos |

### Panel (`topgg-admin`)

| Archivo | Responsabilidad |
| --- | --- |
| `src/lib/api/products.ts` | Cliente HTTP de `/products*` |
| `src/pages/admin/AdminProducts.tsx` | Tabla + alta/edición |
| `src/components/admin/ProductInventoryDialog.tsx` | Carga y borrado de códigos |
| `src/App.tsx`, `src/pages/admin/AdminLayout.tsx` | Ruta y navegación |

### Tienda (`topgg-shop`)

| Archivo | Responsabilidad |
| --- | --- |
| `src/lib/providers/endpoints/catalog.ts` | `getCatalogTree()` apunta a `/catalog` |

---

## Fase 1 — Modelo de datos ✅ COMPLETADA (2026-07-24)

**Entrega:** el esquema existe en la BD local y la secuencia de ids arranca en 1.000.000.
Migración: `prisma/migrations/20260724041849_own_products_inventory/`.
Verificación 6/6 en verde; los 15 tests de checkout existentes siguen pasando.

### Tarea 1.1: Modelos Prisma

**Archivos:** Modificar `prisma/schema.prisma`

- [x] **Paso 1: Añadir el enum y los modelos**

```prisma
enum SaleOrigin {
  HYPE
  PROPIO
}

model OwnProduct {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Decimal  @db.Decimal(12, 2) // SIEMPRE USD
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
  cost      Decimal?  @db.Decimal(12, 2)
  expiresAt DateTime?

  productId Int
  product   OwnProduct @relation(fields: [productId], references: [id], onDelete: Cascade)

  saleId     Int?
  sale       Sale?     @relation(fields: [saleId], references: [id])
  assignedAt DateTime?

  createdAt DateTime @default(now())

  @@index([productId, saleId])
  @@index([saleId])
}
```

- [x] **Paso 2: Añadir a `model Sale`** (junto a `pins SalePin[]`)

```prisma
  origen       SaleOrigin    @default(HYPE)
  productCodes ProductCode[]
```

- [x] **Paso 3: Crear la migración SIN aplicarla**

Correr: `npx prisma migrate dev --create-only --name own_products_inventory`

> **Desviación deliberada:** el borrador decía `migrate reset`, que **borra la BD local**
> (con los usuarios y ventas de prueba). Con `--create-only` se genera el SQL, se edita y
> se aplica encima, sin destruir nada.

- [x] **Paso 4: Desplazar la secuencia de ids**

Añadir al final del `migration.sql` recién creado (así producción también arranca en 1M):

```sql
ALTER SEQUENCE "OwnProduct_id_seq" RESTART WITH 1000000;
```

Aplicar: `npx prisma migrate deploy && npx prisma generate`

- [x] **Paso 5: Verificar contra la BD local**

Script temporal con `pg` que comprueba: id inicial = 1000000, stock por `saleId IS NULL`,
código duplicado rechazado (23505), `Sale.origen` default HYPE, borrado en cascada, y que
el id siguiente sigue por encima del offset. **Resultado: 6/6 PASS.**

- [ ] **Paso 6: Commit**

```bash
git add prisma/ && git commit -m "Agrega modelos de productos propios e inventario de codigos"
```

---

## Fase 2 — API de productos (sin imagen) ✅ COMPLETADA (2026-07-24)

**Entrega:** un admin puede crear, listar, editar y desactivar productos por API; un cliente
recibe 403. La imagen se acepta como URL provisional hasta la Fase 4.

**Verificación:** 8 tests unitarios + smoke de autorización/CRUD contra el backend local
(14/14 PASS: 401 sin token, 403 cliente, 2xx admin, id ≥ 1M, stock 0 inicial, precio USD con
2 decimales, 400 sin imagen, edición, desactivar sin borrar). Suite completa 24/24, lint y
typecheck limpios. Se añadió `OWN_ID_OFFSET`/`esProductoPropio` en
`src/products/own-product.constants.ts` (los usarán las fases 5 y 6). El precio se serializa
siempre con `.toFixed(2)`.

### Tarea 2.1: DTOs

**Archivos:** Crear `src/products/dto/create-product.dto.ts`, `update-product.dto.ts`

- [ ] **Paso 1: `CreateProductDto`**

```ts
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  name!: string;

  @IsOptional() @IsString() @MaxLength(1000)
  description?: string;

  /** String para no perder precisión; máximo 2 decimales. */
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'El precio debe tener máximo 2 decimales' })
  price!: string;

  @IsOptional() @IsString() @MaxLength(500)
  imageUrl?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
```

- [ ] **Paso 2: `UpdateProductDto`** — `export class UpdateProductDto extends PartialType(CreateProductDto) {}` usando `@nestjs/mapped-types`.

### Tarea 2.2: Servicio con stock

**Archivos:** Crear `src/products/products.service.ts`, `src/products/products.service.spec.ts`

- [ ] **Paso 1: Test que falla — el stock cuenta solo códigos libres**

```ts
it('stock cuenta solo los códigos sin vender', async () => {
  prisma.ownProduct.findMany.mockResolvedValue([{ id: 1000000, name: 'X', price: '5', isActive: true }]);
  prisma.productCode.groupBy.mockResolvedValue([{ productId: 1000000, _count: { _all: 3 } }]);

  const res = await service.findAll();

  expect(res[0].stock).toBe(3);
  expect(prisma.productCode.groupBy).toHaveBeenCalledWith(
    expect.objectContaining({ where: { saleId: null } }),
  );
});
```

- [ ] **Paso 2: Correr y ver que falla.** `npx jest src/products -t "stock cuenta"` → FAIL.
- [ ] **Paso 3: Implementar la superficie COMPLETA del servicio.** El stock sale siempre de un
      `groupBy` por `productId` con `where: { saleId: null }` (una sola consulta, nunca N+1).

Estos son todos los métodos que consumirán las fases siguientes — si falta alguno, la Fase 5
o la 6 no compilan:

| Método | Devuelve | Lo usa |
| --- | --- | --- |
| `findAll()` | productos + `stock` (incluye inactivos) | Panel (Fase 7) |
| `findOne(id)` | producto + `stock` | Panel (Fase 7) |
| `create(dto, imageUrl)` | producto creado | Panel (Fase 7) |
| `update(id, dto, imageUrl?)` | producto actualizado | Panel (Fase 7) |
| `deactivate(id)` | producto con `isActive=false` | Panel (Fase 7) |
| `findAllActiveWithStock()` | solo `isActive` **y** `stock > 0` | Catálogo (Fase 5) |
| `findForSale(id)` | producto activo o `null` | Checkout (Fase 6) |
| `countAvailable(id)` | nº de códigos con `saleId: null` | Checkout (Fase 6) |

- [ ] **Paso 3b: Definir la constante compartida** en `src/products/own-product.constants.ts`:

```ts
/** Los ids de productos propios arrancan aquí para no chocar con los de Hype (~2.700). */
export const OWN_ID_OFFSET = 1_000_000;

export const esProductoPropio = (productId: number) => productId >= OWN_ID_OFFSET;
```
- [ ] **Paso 4: Correr y ver que pasa.** → PASS.
- [ ] **Paso 5: Commit.**

### Tarea 2.3: Controlador bajo AdminGuard

**Archivos:** Crear `src/products/products.controller.ts`, `products.module.ts`; modificar `src/app.module.ts`

- [ ] **Paso 1:** Controlador con `@UseGuards(JwtAuthGuard, AdminGuard)` a nivel de clase y
      rutas `POST /products`, `GET /products`, `GET /products/:id`, `PATCH /products/:id`,
      `DELETE /products/:id` (desactiva, no borra).
- [ ] **Paso 2:** Registrar `ProductsModule` en `app.module.ts`.
- [ ] **Paso 3: Verificar autorización en local.** Con el backend arriba: un token de cliente
      contra `GET /products` → **403**; con token admin → **200**.
- [ ] **Paso 4: Commit.**

---

## Fase 3 — Inventario de códigos ✅ COMPLETADA (2026-07-24)

**Entrega:** el admin carga códigos en lote, ve el stock y borra los no vendidos.

**Verificación:** 8 tests unitarios de `CodesService` + smoke 13/13 contra el backend local
(2 insertados / 1 duplicado-en-lote / 1 inválido; duplicado contra BD detectado; stock del
producto refleja la carga y baja al borrar; costo persistido con 2 decimales; cliente → 403).
Suite completa 32/32, lint y typecheck limpios. Rutas nuevas:
`POST/GET/DELETE /products/:id/codes`. El `cost` se serializa con `.toFixed(2)` igual que el
precio.

### Tarea 3.1: Carga en lote

**Archivos:** Crear `src/products/codes.service.ts`, `codes.service.spec.ts`, `dto/add-codes.dto.ts`

- [ ] **Paso 1: Test que falla — un duplicado no aborta el lote**

```ts
it('reporta duplicados sin abortar el lote', async () => {
  prisma.productCode.findMany.mockResolvedValue([{ code: 'AAA' }]); // ya existe
  prisma.productCode.createMany.mockResolvedValue({ count: 2 });

  const res = await service.addCodes(1000000, [
    { code: 'AAA' }, { code: 'BBB' }, { code: 'CCC' },
  ]);

  expect(res.insertados).toBe(2);
  expect(res.duplicados).toEqual(['AAA']);
});
```

- [ ] **Paso 2: Correr y ver que falla.**
- [ ] **Paso 3: Implementar** `addCodes`: normaliza (trim), descarta vacíos, detecta
      duplicados **dentro del lote** y **contra la BD**, e inserta con
      `createMany({ skipDuplicates: true })`. Devuelve
      `{ insertados, duplicados, invalidos }`.
- [ ] **Paso 4: Correr y ver que pasa.**
- [ ] **Paso 5: Commit.**

### Tarea 3.2: Listado y borrado seguro

- [ ] **Paso 1: Test que falla — no se puede borrar un código ya vendido**

```ts
it('no borra códigos ya asignados a una venta', async () => {
  prisma.productCode.deleteMany.mockResolvedValue({ count: 1 });

  await service.deleteCodes(1000000, ['a', 'b']);

  expect(prisma.productCode.deleteMany).toHaveBeenCalledWith({
    where: { id: { in: ['a', 'b'] }, productId: 1000000, saleId: null },
  });
});
```

- [ ] **Paso 2-4:** Implementar `listCodes(productId, status)` y `deleteCodes` (siempre con
      `saleId: null` en el `where`), correr tests hasta verde.
- [ ] **Paso 5:** Añadir rutas `POST/GET/DELETE /products/:id/codes` al controlador.
- [ ] **Paso 6: Commit.**

---

## Fase 4 — Imágenes (Cloudflare Images) ✅ COMPLETADA (2026-07-24)

**Entrega:** el alta/edición de producto acepta un archivo y guarda la URL de Cloudflare.
Se usó el patrón **Images v1** (nombres de env que dio el usuario):
`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_IMAGES_TOKEN`, `CLOUDFLARE_IMAGES_ACCOUNT_HASH`,
`CLOUDFLARE_IMAGES_DEFAULT_VARIANT`. URL de entrega:
`https://imagedelivery.net/<HASH>/<ID>/<VARIANT>`.

**Verificación:** 4 tests unitarios (rechazo por MIME/tamaño/credenciales, `isConfigured`) +
smoke 6/6 del wiring multipart contra el backend local (no-imagen → 400, sin imagen → 400,
JSON con `imageUrl` sigue funcionando). Suite 36/36. **La subida real a Cloudflare la probará
el usuario** (no se ejecutó contra su cuenta). Sin dependencias nuevas: se usó `fetch`/
`FormData`/`Blob` globales de Node.

**Adelantado de la Fase 7 (por pedido explícito — UI de imagen con preview):** panel
`/productos` con tabla (miniatura, precio, stock, estado), diálogo de alta/edición con
`ImagePicker` (arrastrar-soltar + click + preview + validación cliente), y
`ProductInventoryDialog` para cargar/borrar códigos. Verificado renderizado en local
(diálogo abre, selector muestra "Arrastra una imagen…", sin errores de consola).

### Tarea 4.1: Servicio de subida

**Archivos:** Crear `src/common/cloudflare-images.service.ts` y su spec

- [ ] **Paso 1: Test que falla — rechaza un MIME no permitido**

```ts
it('rechaza archivos que no son imagen', async () => {
  await expect(
    service.uploadImage({ mimetype: 'application/pdf', size: 100, buffer: Buffer.from('x') } as any),
  ).rejects.toThrow(/imagen/i);
});
```

- [ ] **Paso 2:** Correr y ver que falla.
- [ ] **Paso 3: Implementar** con la referencia
      `proyecto_mayorista/backend-mayorista/src/common/utils/cloudflare.service.ts`.
      Validar MIME (`image/png|jpeg|webp`) y tamaño (máx. 5 MB) **antes** de subir.
- [ ] **Paso 4:** Correr y ver que pasa.
- [ ] **Paso 5: Commit.**

### Tarea 4.2: Multipart en el controlador

- [ ] **Paso 1:** Añadir `@UseInterceptors(FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }]))`
      a `POST /products` y `PATCH /products/:id`.
- [ ] **Paso 2:** En `create`, si no llega ni `cover` ni `imageUrl` → `BadRequestException`
      ("El producto necesita una imagen"). En `update`, si no llega `cover`, conservar la
      imagen actual.
- [ ] **Paso 3: Verificar en local** subiendo un PNG real con curl y comprobando que la URL
      devuelta responde 200.
- [ ] **Paso 4: Commit.**

---

## Fase 5 — Catálogo agregado y visible en la tienda ✅ COMPLETADA (2026-07-25)

**Entrega:** los productos propios se ven en la tienda local, mezclados con Free Fire.

**Verificación:** 7 tests de `StorefrontService` (mezcla, normalización a USD, NO expone
códigos, resiliencia si cae Hype o la BD, descarte de ids colisionantes, exclusión en COP) +
smoke 8/8 contra el backend local + **render real en la tienda** (`GET /catalog` → 9 productos:
6 Free Fire + 3 propios en la sección "Gift Cards", sin errores de consola, sin fuga de
códigos). `GET /catalog` es `@Public()`; el front cambió UNA línea (`getCatalogTree` →
`/catalog`). Suite backend 43/43, tienda typecheck + tests limpios. Los propios se agregan al
**final** del árbol (Hype queda arriba) y solo cuando la moneda pedida es USD.

### Tarea 5.1: Servicio de agregación

**Archivos:** Crear `src/storefront/storefront.service.ts`, `storefront.controller.ts`, `storefront.module.ts` + spec

- [ ] **Paso 1: Test que falla — el catálogo público NO expone códigos**

```ts
it('nunca incluye códigos de inventario', async () => {
  const tree = await service.getCatalog();
  expect(JSON.stringify(tree)).not.toMatch(/"code"/);
});
```

- [ ] **Paso 2: Test que falla — si Hype cae, siguen saliendo los propios**

```ts
it('devuelve los productos propios aunque Hype falle', async () => {
  catalog.getCatalog.mockRejectedValue(new Error('hype 500'));
  products.findAllActiveWithStock.mockResolvedValue([
    { id: 1000000, name: 'Gift', price: '10.00', imageUrl: 'u', stock: 2 },
  ]);

  const tree = await service.getCatalog();

  expect(tree).toHaveLength(1);
  expect(tree[0].products[0].id).toBe(1000000);
});
```

- [ ] **Paso 3:** Correr y ver que fallan.
- [ ] **Paso 4: Implementar.** Normaliza cada producto propio a la forma del proveedor:

```ts
{
  id: p.id,
  name: p.name,
  description: p.description ?? null,
  salesPrice: Number(p.price),
  salesCurrencyCode: 'USD',      // imprescindible: el front filtra por esto
  salesCurrencySymbol: '$',
  coverImage: p.imageUrl,
  image: p.imageUrl,
  isAvailable: true,
}
```

Reglas: excluir `isActive=false` y `stock === 0`; descartar (con `logger.error`) cualquier
producto de Hype con `id >= 1_000_000`; envolver cada fuente en su propio `try/catch`.

- [ ] **Paso 5:** Correr y ver que pasan.
- [ ] **Paso 6:** Exponer `GET /catalog` con `@Public()`. Registrar el módulo.
- [ ] **Paso 7: Commit.**

### Tarea 5.2: Apuntar la tienda al catálogo agregado

**Archivos:** Modificar `topgg-shop/src/lib/providers/endpoints/catalog.ts`

- [ ] **Paso 1:** En `getCatalogTree`, cambiar `"/pin-hype/catalog"` por `"/catalog"`.
- [ ] **Paso 2: Verificar en el navegador, en local.** Backend en 3002 y tienda apuntando ahí;
      crear un producto de prueba con stock y comprobar que aparece junto a Free Fire y que
      `GET /catalog` no contiene ningún código.
- [ ] **Paso 3: Commit** (en `topgg-shop`).

---

## Fase 6 — Compra y entrega automática ✅ COMPLETADA (2026-07-25)

**Entrega:** se puede comprar un producto propio y, tras el pago, recibe sus códigos.

**Verificación:** `purchase()` y `fulfill()` ramifican por `Sale.origen` (nuevo helper
`resolvePurchase` + `OwnFulfillmentService`). Tests unitarios: 4 de `OwnFulfillmentService`
(asignación, filtro `saleId null`, sin stock, carrera perdida) + 3 nuevos de checkout (purchase
propio en USD sin tocar Hype, rechazo sin stock, **fulfill propio NO llama pre-redeem**). Suite
backend **50/50**, lint y typecheck limpios. **Prueba de concurrencia REAL contra la BD local
(7/7):** dos `fulfill()` en paralelo sobre el mismo producto con 1 código → el código se entrega
**exactamente una vez**, una sola venta COMPLETADA, la perdedora sin pin. **No se generó nada de
Hype** (pedido explícito del usuario). La rama de Hype quedó intacta.

### Tarea 6.1: Ramas en `purchase()`

**Archivos:** Modificar `src/checkout/checkout.service.ts`, `checkout.service.spec.ts`

- [ ] **Paso 1: Test que falla — precio y moneda salen de la BD**

```ts
it('cotiza un producto propio en USD desde la BD', async () => {
  ownProducts.findForSale.mockResolvedValue({ id: 1000000, name: 'Gift', price: '10.00', isActive: true });
  ownProducts.countAvailable.mockResolvedValue(5);

  const res = await service.purchase(7, { productId: 1000000, quantity: 2 });

  expect(res.amountUsdt).toBe(20);       // 10 USD x2, USDT 1:1
  expect(catalog.findProductInCatalog).not.toHaveBeenCalled(); // no toca Hype
});
```

- [ ] **Paso 2: Test que falla — sin stock no se cobra**

```ts
it('rechaza la compra si no hay códigos suficientes', async () => {
  ownProducts.findForSale.mockResolvedValue({ id: 1000000, name: 'Gift', price: '10.00', isActive: true });
  ownProducts.countAvailable.mockResolvedValue(1);

  await expect(service.purchase(7, { productId: 1000000, quantity: 3 })).rejects.toBeTruthy();
  expect(prisma.sale.create).not.toHaveBeenCalled();
  expect(binance.createHostedCheckout).not.toHaveBeenCalled();
});
```

- [ ] **Paso 3:** Correr y ver que fallan.
- [ ] **Paso 4: Implementar.** Al principio de `purchase()`:
      `const esPropio = dto.productId >= OWN_ID_OFFSET;` y ramificar precio, stock y
      `origen`. El resto del método (Binance, PENDIENTE, USDT) no se toca.
- [ ] **Paso 5:** Correr y ver que pasan.
- [ ] **Paso 6: Commit.**

### Tarea 6.2: Asignación de códigos

**Archivos:** Crear `src/checkout/own-fulfillment.service.ts` + spec

- [ ] **Paso 1: Test que falla — si otro proceso ganó la carrera, revienta y no entrega**

```ts
it('falla si no logra asignar exactamente la cantidad pedida', async () => {
  tx.productCode.findMany.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);
  tx.productCode.updateMany.mockResolvedValue({ count: 1 }); // otro se llevó uno

  await expect(service.assign(tx, { saleId: 1, productId: 1000000, quantity: 2 }))
    .rejects.toThrow(/stock/i);
});
```

- [ ] **Paso 2:** Correr y ver que falla.
- [ ] **Paso 3: Implementar** dentro de la transacción, en este orden exacto:

```ts
await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`own:assign:${productId}`})::bigint);`;

const candidatos = await tx.productCode.findMany({
  where: { productId, saleId: null },
  orderBy: [{ expiresAt: 'asc' }, { createdAt: 'asc' }], // primero lo que caduca antes
  take: quantity,
  select: { id: true, code: true },
});
if (candidatos.length < quantity) throw new Error('Stock insuficiente al entregar');

const { count } = await tx.productCode.updateMany({
  where: { id: { in: candidatos.map((c) => c.id) }, saleId: null }, // red de seguridad
  data: { saleId, assignedAt: new Date() },
});
if (count !== quantity) throw new Error('Stock insuficiente al entregar');

await tx.salePin.createMany({
  data: candidatos.map((c) => ({ saleId, pin: c.code })),
});
```

- [ ] **Paso 4:** Correr y ver que pasa.
- [ ] **Paso 5: Commit.**

### Tarea 6.3: Enganchar en `fulfill()`

- [ ] **Paso 1:** En `fulfill()`, si `sale.origen === 'PROPIO'` llamar a `OwnFulfillmentService`
      dentro de `prisma.$transaction` y **no** llamar a `preRedeem`. El manejo de fallo
      (`fulfillmentAttempts` → `REQUIERE_ATENCION`) se reutiliza tal cual.
- [ ] **Paso 2: Prueba de concurrencia real contra la BD local**

Crear un producto con **1** solo código y lanzar dos `fulfill()` en paralelo sobre dos ventas
distintas. Esperado: una completa, la otra falla; y `SELECT count(*) FROM "SalePin"` para ese
código devuelve **1**.

- [ ] **Paso 3: Commit.**

---

## Fase 7 — Panel de administración

**Entrega:** todo lo anterior se opera desde el panel, sin curl.

### Tarea 7.1: Cliente API

**Archivos:** Crear `topgg-admin/src/lib/api/products.ts`

- [ ] **Paso 1:** Funciones `getProducts`, `getProduct`, `createProduct(FormData)`,
      `updateProduct(id, FormData)`, `deactivateProduct(id)`, `getCodes(id, status)`,
      `addCodes(id, codes)`, `deleteCodes(id, ids)`. Reusar `apiRequest` (ya soporta
      `FormData`: no le pone `Content-Type` si el body no es objeto plano).
- [ ] **Paso 2: Commit.**

### Tarea 7.2: Pantalla de productos

**Archivos:** Crear `src/pages/admin/AdminProducts.tsx`; modificar `src/App.tsx`, `src/pages/admin/AdminLayout.tsx`

- [ ] **Paso 1:** Tabla con miniatura, nombre, precio, **stock** y estado. Reusar los patrones
      de `AdminUsers.tsx` (react-query + `Table` + `Dialog` + `sonner`).
- [ ] **Paso 2:** Diálogo de alta/edición con nombre, descripción, precio, activo y selector de
      imagen con previsualización.
- [ ] **Paso 3:** Ruta `/productos` + ítem de navegación (icono `Package`).
- [ ] **Paso 4: Verificar en navegador** (typecheck + build + carga real).
- [ ] **Paso 5: Commit.**

### Tarea 7.3: Diálogo de inventario

**Archivos:** Crear `src/components/admin/ProductInventoryDialog.tsx`

- [ ] **Paso 1:** Textarea de códigos (uno por línea) + costo opcional, botón de carga, y
      resultado del lote (insertados / duplicados / inválidos).
- [ ] **Paso 2:** Listado de códigos con filtro libres/vendidos y borrado **solo de los libres**
      (los vendidos salen deshabilitados).
- [ ] **Paso 3: Verificar en navegador.**
- [ ] **Paso 4: Commit.**

---

## Cierre

- [ ] Actualizar `CLAUDE.md` de los tres repos (modelo de datos, `/catalog`, panel).
- [ ] Actualizar `README.md` y `.env.example` del backend con las variables de Cloudflare.
- [ ] Verificación final extremo a extremo en local: registrar producto → cargar códigos →
      verlo en la tienda → comprarlo (hasta el 451 de Binance) → confirmar que el código
      quedó asignado y no se puede revender.
- [ ] Desplegar **backend primero**, luego panel y tienda.
