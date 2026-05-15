// src/hooks/providers/useCatalog.ts
import { useEffect, useState } from 'react';
import { http } from '@/lib/providers/http';
import { PIN_HYPE_DEFAULTS } from '@/lib/providers/config';
import type { ProviderCollection } from '@/lib/providers/endpoints/catalog';

export function useCatalog() {
  const [data, setData] = useState<ProviderCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const result = await http<ProviderCollection[]>(
          '/pin-hype/catalog/collections',
          { method: 'GET', signal: controller.signal },
          {
            country: PIN_HYPE_DEFAULTS.country,
            currency: PIN_HYPE_DEFAULTS.currency,
            language: PIN_HYPE_DEFAULTS.language,
          },
        );

        setData(Array.isArray(result) ? result : []);
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