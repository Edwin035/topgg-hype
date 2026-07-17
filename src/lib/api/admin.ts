import { authClient } from "./http";

/** Rango temporal de los KPIs del overview. */
export type StatsRange = "today" | "7d" | "30d" | "all";

export interface AdminStatusBucket {
  status: string;
  count: number;
  totalCop: number;
  totalUsdt: number;
}

export interface AdminStats {
  range: StatsRange;
  from: string | null;
  totals: {
    sales: number;
    completed: number;
    revenueCop: number;
    revenueUsdt: number;
    avgTicketCop: number;
    conversionRate: number;
  };
  byStatus: AdminStatusBucket[];
  attention: { count: number; valueCop: number };
  series: Array<{ day: string; count: number; revenueCop: number }>;
}

export interface AdminSaleUser {
  id: number;
  name: string;
  email: string;
}

export interface AdminSalePin {
  id: number;
  pin: string;
  transactionId: string | null;
  redirectLink: string | null;
  createdAt: string;
}

export interface AdminSale {
  id: number;
  status: string;
  method: string;
  createdAt: string;
  paidAt: string | null;

  productId: number;
  productName: string;
  productImage: string | null;
  quantity: number;

  unitPrice: number;
  total: number;
  currencyCode: string | null;
  amountUsdt: number | null;
  usdtCopRate: number | null;

  fulfillmentAttempts: number;
  fulfillmentError: string | null;

  binanceStatus: string | null;
  binanceCheckoutUrl: string | null;
  binanceMerchantTradeNo: string | null;
  binanceTransactionId: string | null;

  resolvedByUserId: number | null;
  resolvedAt: string | null;
  adminNote: string | null;

  user: AdminSaleUser;
  pins: AdminSalePin[];
}

export interface AdminSalesParams {
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminSalesResponse {
  items: AdminSale[];
  page: number;
  pageSize: number;
  total: number;
}

/** KPIs agregados para el overview del gestor. */
export function getAdminStats(range: StatsRange = "7d") {
  return authClient<AdminStats>("/admin/stats", {
    method: "GET",
    query: { range },
  });
}

/** Listado paginado y filtrable de todas las ventas (solo ADMIN). */
export function searchAdminSales(params: AdminSalesParams = {}) {
  return authClient<AdminSalesResponse>("/admin/sales", {
    method: "GET",
    query: {
      status:
        params.status && params.status !== "ALL" ? params.status : undefined,
      from: params.from || undefined,
      to: params.to || undefined,
      q: params.q || undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });
}

// ---- Acciones (fase 2) ----

export type ResolveOutcome = "COMPLETADA" | "CANCELADA";

export interface FulfillResult {
  fulfilled: boolean;
  reason?: string;
}

/** Resuelve manualmente una venta REQUIERE_ATENCION. */
export function resolveSale(
  id: number,
  body: { outcome: ResolveOutcome; note?: string },
) {
  return authClient<AdminSale>(`/admin/sales/${id}/resolve`, {
    method: "POST",
    body,
  });
}

/** Reintenta la entrega de una venta pagada sin pines. */
export function retryFulfillSale(id: number) {
  return authClient<{ result: FulfillResult; sale: AdminSale }>(
    `/admin/sales/${id}/retry-fulfill`,
    { method: "POST" },
  );
}

/** Cancela manualmente una venta (no completada). */
export function cancelSale(id: number, body: { note?: string }) {
  return authClient<AdminSale>(`/admin/sales/${id}/cancel`, {
    method: "POST",
    body,
  });
}
