import { http, PIN_HYPE_DEFAULTS } from "../../api/http";

export interface ProviderProduct {
  id: number;
  name: string;
  description?: string | null;
  salesPrice?: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  partnerCostPrice?: number;
  partnerCostPercent?: number;
  image?: string | null;
  coverImage?: string | null;
  termsAndConditions?: string | null;
  howToRedeem?: string | null;
  adultsOnly?: boolean;
  isAvailable?: boolean;
  countryCode?: string;
  salesCurrencyCode?: string;
  salesCurrencySymbol?: string;
  createadAt?: string | null;
  tags?: string[];
}

export interface ProviderCollection {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  coverImage?: string | null;
  termsAndConditions?: string | null;
  howToRedeem?: string | null;
  collections: ProviderCollection[];
  products: ProviderProduct[];
  tags: string[];
}

const hypeQuery = {
  country: PIN_HYPE_DEFAULTS.country,
  currency: PIN_HYPE_DEFAULTS.currency,
  language: PIN_HYPE_DEFAULTS.language,
};

export async function getCollections(signal?: AbortSignal) {
  return http<ProviderCollection[]>("/pin-hype/catalog/collections", {
    method: "GET",
    signal,
    query: hypeQuery,
  });
}

export async function getCollection(collectionId: number, signal?: AbortSignal) {
  return http<ProviderCollection>(
    `/pin-hype/catalog/collections/${collectionId}`,
    {
      method: "GET",
      signal,
      query: hypeQuery,
    },
  );
}

export async function getProduct(productId: number, signal?: AbortSignal) {
  return http<ProviderProduct>(`/pin-hype/catalog/products/${productId}`, {
    method: "GET",
    signal,
    query: hypeQuery,
  });
}

export async function getProductStock(productId: number, signal?: AbortSignal) {
  return http<{ hasStock: boolean; amount: number }>(
    `/pin-hype/catalog/products/${productId}/stock`,
    {
      method: "GET",
      signal,
      query: hypeQuery,
    },
  );
}

/** Árbol completo del catálogo (colecciones anidadas con sus productos). */
export async function getCatalogTree(signal?: AbortSignal) {
  return http<ProviderCollection[]>("/pin-hype/catalog", {
    method: "GET",
    signal,
    query: hypeQuery,
  });
}

/**
 * Resuelve un producto por id buscándolo en el ÁRBOL del catálogo.
 *
 * OJO (quirk de Hype): /catalog/products/:id IGNORA la moneda pedida y devuelve
 * el precio en USD sin etiquetarlo. El catálogo/colecciones sí respetan COP e
 * incluyen `salesCurrencyCode`. Para PRECIOS siempre usar este método.
 */
export async function findProductInCatalog(
  productId: number,
  signal?: AbortSignal,
): Promise<ProviderProduct | null> {
  const tree = await getCatalogTree(signal);
  const stack: ProviderCollection[] = Array.isArray(tree) ? [...tree] : [];

  while (stack.length > 0) {
    const collection = stack.pop();
    if (!collection) continue;

    const hit = (collection.products ?? []).find((p) => p.id === productId);
    if (hit) return hit;

    stack.push(...(collection.collections ?? []));
  }

  return null;
}

/**
 * Producto para mostrar en UI: precio/moneda confiables desde el catálogo +
 * `description` (que el catálogo no trae) desde products/:id. Si el producto no
 * está en el catálogo, devuelve null (tampoco sería comprable).
 */
export async function getProductForDisplay(
  productId: number,
  signal?: AbortSignal,
): Promise<ProviderProduct | null> {
  const [inCatalog, byId] = await Promise.all([
    findProductInCatalog(productId, signal),
    getProduct(productId, signal).catch(() => null),
  ]);

  if (!inCatalog) return null;

  return {
    ...inCatalog,
    description: inCatalog.description ?? byId?.description ?? null,
  };
}