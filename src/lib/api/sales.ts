import { authClient } from "./http";

export type SalePaymentMethod = "BINANCE";
export type SaleStatus =
  | "PENDIENTE"
  | "EN_PROCESO"
  | "COMPLETADA"
  | "CANCELADA"
  | "DEVUELTA"
  // Pagada pero no entregada tras agotar reintentos: resolución manual (contacto).
  | "REQUIERE_ATENCION";

export type MyOrderStatusApi =
  | "COMPLETADO"
  | "PENDIENTE"
  | "EN_PROCESO"
  | "DEVUELTO"
  | "CANCELADA"
  | "REQUIERE_ATENCION";

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

  // Pago Binance Pay
  paidAt?: string | null;
  amountUsdt?: string | null;
  usdtCopRate?: string | null;
  binanceCheckoutUrl?: string | null;
  binanceStatus?: string | null;
  binanceExpireAt?: string | null;

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