// src/hooks/providers/useCatalogSections.ts
import { useEffect, useState } from 'react';
import {
  getCollection,
  getCollections,
  type ProviderCollection,
} from '@/lib/providers/endpoints/catalog';

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
              return await getCollection(collection.id, controller.signal);
            } catch {
              return {
                ...collection,
                products: collection.products ?? [],
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