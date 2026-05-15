import { useEffect, useState } from 'react';
import { getCollection, type ProviderCollection } from '@/lib/providers';

export function useCollection(collectionId: number) {
  const [data, setData] = useState<ProviderCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const result = await getCollection(collectionId, controller.signal);
        setData(result);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar la colección');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    run();

    return () => controller.abort();
  }, [collectionId]);

  return { data, loading, error };
}