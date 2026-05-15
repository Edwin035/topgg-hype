import { authClient } from "./http";
import type { PreRedeemResponse } from "@/lib/providers/endpoints/redeem";

export type SalePaymentMethod = "BINANCE";
export type SaleStatus = "COMPLETADA" | "CANCELADA" | "DEVUELTA";

export type MyOrderStatusApi =
  | "COMPLETADO"
  | "PENDIENTE"
  | "EN_PROCESO"
  | "DEVUELTO"
  | "CANCELADA";

export interface CreateSalePinPayload {
  pin: string;
  transactionId?: string;
  redirectLink?: string;
  raw?: Record<string, unknown>;
}

export interface CreateSalePayload {
  productId: number;
  providerProductId?: number;
  productName: string;
  productImage?: string;
  platform?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  total: number;
  currencyCode?: string;
  currencySymbol?: string;
  redeemResponse?: PreRedeemResponse;
  metadata?: Record<string, unknown>;
  pins: CreateSalePinPayload[];
}

export interface SalePin {
  id: number;
  saleId: number;
  pin: string;
  transactionId?: string | null;
  redirectLink?: string | null;
  raw?: unknown;
  createdAt: string;
}

export interface Sale {
  id: number;
  userId: number;
  method: SalePaymentMethod;
  status: SaleStatus;

  productId: number;
  providerProductId?: number | null;
  productName: string;
  productImage?: string | null;
  platform?: string | null;

  quantity: number;

  unitPrice: string;
  subtotal: string;
  total: string;

  currencyCode?: string | null;
  currencySymbol?: string | null;

  redeemResponse?: unknown;
  metadata?: unknown;

  pins: SalePin[];

  createdAt: string;
  updatedAt: string;
}

export interface MyOrdersSearchBody {
  status?: "ALL" | MyOrderStatusApi;
  page?: number;
  pageSize?: number;
}

export interface MyOrdersSearchItem {
  id: string;
  saleNumber?: number | null;
  referenceNumber?: string | null;
  createdAt: string;
  status: MyOrderStatusApi | string;

  message?: string | null;

  currencyCode?: string | null;
  totalInCurrency?: number | null;
  paymentPortal?: string | null;

  quantity?: number | null;

  binanceCheckoutUrl?: string | null;

  finalUsdCents?: number;
  finalInCurrency?: number;

  product?: {
    id: string;
    title?: string | null;
  };

  subproduct?: {
    id: string;
    name?: string | null;
  };

  items?: Array<{
    productTitle?: string;
    subproductName?: string;
  }>;

  clientPinsDisplay?: string | null;
  clientPins?: string[] | null;

  pin?: {
    codigo?: string | null;
  } | null;

  pins?: Array<{
    pin?: {
      codigo?: string | null;
    } | null;
    transactionId?: string | null;
    redirectLink?: string | null;
  }>;
}

export interface MyOrdersSearchResponse {
  items: MyOrdersSearchItem[];
  page: number;
  pageSize: number;
  total: number;
}

export function createSale(payload: CreateSalePayload) {
  return authClient<Sale>("/sales", {
    method: "POST",
    body: payload,
  });
}

export function getMySales() {
  return authClient<Sale[]>("/sales/me", {
    method: "GET",
  });
}

export function getMySale(id: number) {
  return authClient<Sale>(`/sales/me/${id}`, {
    method: "GET",
  });
}

export function searchMyOrders(params: MyOrdersSearchBody = {}) {
  return authClient<MyOrdersSearchResponse>("/sales/my/search", {
    method: "GET",
    query: {
      status:
        params.status && params.status !== "ALL" ? params.status : undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });
}