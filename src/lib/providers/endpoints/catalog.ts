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