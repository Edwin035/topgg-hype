// src/hooks/providers/useCatalogSections.ts
import { useEffect, useState } from 'react';
import {
  getCollection,
  getCollections,
  type ProviderCollection,
  type ProviderProduct,
} from '@/lib/providers/endpoints/catalog';

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

        const baseCollections = await getCollections(controller.signal);

        const detailedCollections = await Promise.all(
          (baseCollections ?? []).map(async (collection) => {
            try {
              const detailed = await getCollection(
                collection.id,
                controller.signal,
              );
              return {
                ...detailed,
                products: sortProductsNatural(detailed.products),
              };
            } catch {
              return {
                ...collection,
                products: sortProductsNatural(collection.products),
              };
            }
          }),
        );

        if (!controller.signal.aborted) {
          setData(
            detailedCollections.filter(
              (collection) =>
                Array.isArray(collection.products) && collection.products.length > 0,
            ),
          );
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