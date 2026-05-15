import { useState } from "react";
import { createPreRedeem } from "@/lib/providers";

function createPartnerReference(productId: number) {
  return `FF-CO-${productId}-${Date.now()}`;
}

type BuyPinParams = {
  productId: number;
  countryCode?: string;
  currencyCode?: string;
  quantity?: number;
};

export function useBuyPin() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy({
    productId,
    countryCode = "CO",
    currencyCode = "COP",
    quantity = 1,
  }: BuyPinParams) {
    try {
      setLoadingId(productId);
      setError(null);

      const result = await createPreRedeem({
        productId,
        partnerReference: createPartnerReference(productId),
        countryCode,
        currencyCode,
        quantity,
      });

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo iniciar la compra";
      setError(message);
      throw err;
    } finally {
      setLoadingId(null);
    }
  }

  return {
    buy,
    loadingId,
    error,
  };
}