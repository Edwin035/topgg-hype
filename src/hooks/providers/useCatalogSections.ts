// src/hooks/providers/useCatalogSections.ts
import { useEffect, useState } from 'react';
import {
  getCatalogTree,
  type ProviderCollection,
  type ProviderProduct,
} from '@/lib/providers/endpoints/catalog';
import { PIN_HYPE_DEFAULTS } from '@/lib/api/http';

const EXPECTED_CURRENCY = PIN_HYPE_DEFAULTS.currency.toUpperCase();

/**
 * Fail-closed de moneda: solo se muestran productos cuyo precio venga
 * etiquetado EXACTAMENTE en la moneda que pedimos. Si Hype devuelve un precio
 * en otra moneda (o sin etiquetar), el producto NO se muestra — mejor no
 * venderlo que venderlo a un precio en la moneda equivocada.
 */
function hasExpectedCurrency(product: ProviderProduct): boolean {
  return (product.salesCurrencyCode || '').toUpperCase() === EXPECTED_CURRENCY;
}

// Orden natural (alfanumérico) por nombre: trata los números como números, así
// "100" < "310" < "520" < "1060" < "2180" (no el orden string "100","1060"...).
const nameCollator = new Intl.Collator('es', {
  numeric: true,
  sensitivity: 'base',
});

function sortProductsNatural(products?: ProviderProduct[]): ProviderProduct[] {
  return [...(products ?? [])].sort((a, b) =>
    nameCollator.compare(a.name ?? '', b.name ?? ''),
  );
}

/**
 * Aplana el ÁRBOL del catálogo a secciones: cada colección con productos
 * propios es una sección, sin importar a qué profundidad esté.
 *
 * OJO: antes esto se armaba con /catalog/collections + /collections/:id, que
 * solo mira el primer nivel. Las colecciones cuyos productos viven en
 * sub-colecciones (p. ej. Console → PlayStation) quedaban con `products: []`
 * y se descartaban, así que sus productos NUNCA se mostraban en la tienda.
 */
function collectSections(
  nodes: ProviderCollection[] | undefined,
  out: ProviderCollection[],
  seen: Set<number>,
): ProviderCollection[] {
  for (const collection of nodes ?? []) {
    if (!collection || seen.has(collection.id)) continue;
    seen.add(collection.id);

    const products = sortProductsNatural(
      (collection.products ?? []).filter(hasExpectedCurrency),
    );

    if (products.length > 0) {
      out.push({ ...collection, products });
    }

    collectSections(collection.collections, out, seen);
  }

  return out;
}

export function useCatalogSections() {
  const [data, setData] = useState<ProviderCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const tree = await getCatalogTree(controller.signal);
        const sections = collectSections(
          Array.isArray(tree) ? tree : [],
          [],
          new Set<number>(),
        );

        if (!controller.signal.aborted) {
          setData(sections);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el catálogo');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    run();

    return () => controller.abort();
  }, []);

  return { data, loading, error };
}
