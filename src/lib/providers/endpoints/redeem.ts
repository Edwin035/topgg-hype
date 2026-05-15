import { http, PIN_HYPE_DEFAULTS } from "../../api/http";

export interface RedeemCustomer {
  name?: string;
  email?: string;
  document?: string;
  phone?: string;
}

export interface PreRedeemPayload {
  productId: number;
  partnerReference?: string;
  countryCode?: string;
  currencyCode?: string;
  quantity?: number;
  customer?: RedeemCustomer;
}

export interface PreRedeemTransaction {
  transactionId?: string;
  partnerReference?: string;
  key?: string;
  redirectLink?: string;
  [key: string]: unknown;
}

export interface PreRedeemResponse {
  quantity?: number;
  pins?: string[];
  transactions?: PreRedeemTransaction[];
  transaction?: PreRedeemTransaction;
  key?: string;
}

export async function preRedeem(payload: PreRedeemPayload) {
  return http<PreRedeemResponse>("/pin-hype/pre-redeem", {
    method: "POST",
    body: {
      ...payload,
      countryCode: payload.countryCode || PIN_HYPE_DEFAULTS.country,
      currencyCode: payload.currencyCode || PIN_HYPE_DEFAULTS.currency,
      quantity: payload.quantity ?? 1,
    },
  });
}

/**
 * Alias para código viejo que importa:
 * import { createPreRedeem } from "@/lib/providers";
 */
export const createPreRedeem = preRedeem;