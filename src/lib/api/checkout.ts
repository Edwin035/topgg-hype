import { apiRequest } from "./http";
import type { Sale } from "./sales";

export interface CheckoutPayload {
  productId: number;
  quantity?: number;
  countryCode?: string;
  currencyCode?: string;
}

export interface CheckoutResponse {
  /** Venta creada en estado PENDIENTE (aún sin pines; se entregan tras el pago). */
  sale: Sale;
  /** URL de Binance Pay a la que se redirige al usuario para pagar. */
  checkoutUrl: string;
  qrcodeLink: string | null;
  /** Monto a cobrar en USDT y tasa usada (COP por 1 USDT). */
  amountUsdt: number;
  usdtCopRate: number;
  currencyCode: string | null;
  /** Total en la moneda local (COP). */
  totalInCurrency: number;
}

/**
 * Inicia la compra: el backend valida el precio real contra el catálogo de Hype,
 * crea la venta PENDIENTE y una orden de Binance Pay. NO canja el pin todavía —
 * eso ocurre solo tras el pago verificado por webhook. Devuelve la URL de checkout
 * a la que hay que redirigir al usuario.
 */
export function checkout(payload: CheckoutPayload) {
  return apiRequest<CheckoutResponse>("/checkout", {
    method: "POST",
    body: payload,
  });
}
