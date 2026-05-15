import { useEffect, useState } from 'react';
import { getProductStock } from '@/lib/providers';

export function useStock(productId?: number) {
  const [data, setData] = useState<{ hasStock: boolean; amount: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const result = await getProductStock(productId, controller.signal);
        setData(result);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'No se pudo consultar stock');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    run();

    return () => controller.abort();
  }, [productId]);

  return { data, loading, error };
}