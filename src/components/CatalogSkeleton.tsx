// Skeletons del catálogo: imitan la forma de ProductCard/ProductSection para que
// la carga no muestre un texto plano "Cargando…", sino la silueta del contenido.
import { Skeleton } from '@/components/ui/skeleton';

/** Silueta de una tarjeta de producto (imagen 4/5 + nombre + precio + botón). */
function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
}

/** Grilla de tarjetas-silueta, con el mismo layout que la grilla real. */
export function ProductGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Varias secciones-silueta (encabezado + grilla) para la carga de la home. */
export function CatalogSkeleton({ sections = 2 }: { sections?: number }) {
  return (
    <>
      {Array.from({ length: sections }).map((_, i) => (
        <section key={i} className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <ProductGridSkeleton />
          </div>
        </section>
      ))}
    </>
  );
}
