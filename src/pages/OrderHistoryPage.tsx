// ==============================
// ProfileOrders – Historial de compras del usuario
// Maneja listado, filtros, paginación y acciones de pago
// ==============================
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { searchMyOrders, type MyOrdersSearchBody } from "@/lib/api/sales";
import { toast } from "sonner";
import { Package, Calendar, ChevronDown, ChevronUp, Eye } from "lucide-react";
// import ProfileOrdersSkeletonDesktop from "./ProfileOrderSkeletonDesktop";
// import ProfileOrdersSkeletonMobile from "./ProfileOrderSkeletonMobile";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import OrderDetailModal from "@/components/OrderDetailModal";
// Estados posibles devueltos por la API de ventas
type StatusApi =
  | "COMPLETADO"
  | "PENDIENTE"
  | "EN_PROCESO"
  | "DEVUELTO"
  | "CANCELADA";
// Estructura cruda de una venta tal como viene desde el backend
export interface ApiSaleItem {
  id: string;
  saleNumber?: number | null;
  referenceNumber?: string | null;
  createdAt: string;
  status: StatusApi | string;

  message?: string | null;

  currencyCode?: string | null;
  totalInCurrency?: number | null;
  paymentPortal?: string | null;

  quantity?: number | null;

  binanceCheckoutUrl?: string | null;

  finalUsdCents?: number;
  finalInCurrency?: number;

  product?: { id: string; title?: string | null };
  subproduct?: { id: string; name?: string | null };

  items?: Array<{ productTitle?: string; subproductName?: string }>;

  clientPinsDisplay?: string | null;
  clientPins?: string[] | null;

  pin?: { codigo?: string | null } | null;
  pins?: Array<{ pin?: { codigo?: string | null } | null }>;
}
// Modelo normalizado para renderizar el historial en la UI
export interface HistoryItem {
  id: string;
  saleNumber?: number | null;
  referenceNumber?: string | null;

  detail: string;
  paymentMethod: string;
  total: string;
  date: string;

  quantity: number;

  status: "Completado" | "Pendiente" | "En Proceso" | "Devuelto" | "Cancelada";

  statusRaw: StatusApi | string;
  paymentPortalRaw?: string | null;

  message?: string | null;

  binanceCheckoutUrl?: string | null;

  clientPinsDisplay?: string | null;
  clientPins?: string[] | null;

  legacyPins?: string[];
}
// Configuración de paginación del historial
const itemsPerPage = 8;

// Límite de seguridad para carga completa al filtrar en cliente
const CLIENT_FILTER_PAGE_CAP = 1000;

// Capitaliza la primera letra o devuelve placeholder
function capFirst(s?: string | null) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Traduce el estado crudo de la API a etiqueta legible en UI
function mapStatusToLabel(s: StatusApi | string): HistoryItem["status"] {
  switch (s) {
    case "COMPLETADO":
      return "Completado";
    case "PENDIENTE":
      return "Pendiente";
    case "EN_PROCESO":
      return "En Proceso";
    case "DEVUELTO":
      return "Devuelto";
    case "CANCELADA":
      return "Cancelada";
    default:
      return "Pendiente";
  }
}
// Asigna clases visuales según el estado de la compra
function badgeClass(status: HistoryItem["status"]) {
  switch (status) {
    case "Completado":
      return "bg-green-500/95 text-white";
    case "Pendiente":
      return "bg-amber-400/95 text-black";
    case "En Proceso":
      return "bg-blue-500/95 text-white";
    case "Devuelto":
      return "bg-orange-500/95 text-white";
    case "Cancelada":
      return "bg-red-500/95 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}
// Formatea fechas ISO a DD-MM-YYYY
function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
// Calcula y formatea el monto final usando la mejor fuente disponible
function formatAmountSmart(row: ApiSaleItem) {
  const amount =
    typeof row.totalInCurrency === "number" &&
    !Number.isNaN(row.totalInCurrency)
      ? row.totalInCurrency
      : typeof row.finalInCurrency === "number"
        ? row.finalInCurrency
        : typeof row.finalUsdCents === "number"
          ? row.finalUsdCents / 100
          : 0;

  if (row.currencyCode) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: row.currencyCode.toUpperCase(),
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${row.currencyCode.toUpperCase()}`;
    }
  }

  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Renderiza mensajes estructurados de cuentas enviados por backend
function renderAccountsFromBackend(message?: string | null) {
  if (!message) return null;

  return message
    .split("|")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => {
      const match = chunk.match(/^(Cuenta\s+\d+:)(.*)$/i);
      if (!match) {
        return (
          <div key={index} className="text-sm text-foreground">
            {chunk}
          </div>
        );
      }

      const [, cuentaLabel, rest] = match;
      const lines = rest
        .split(".")
        .map((l) => l.trim())
        .filter(Boolean);

      return (
        <div
          key={index}
          className="rounded-lg border border-white/10 bg-black/5 p-3 space-y-1">
          <div className="font-semibold text-sm">{cuentaLabel}</div>
          {lines.map((line, i) => (
            <div key={i} className="text-sm text-foreground">
              {line}.
            </div>
          ))}
        </div>
      );
    });
}

// Determina si debe mostrarse el botón de pago Binance
function shouldShowBinancePayButton(item: HistoryItem) {
  const portal = (item.paymentPortalRaw ?? "").toUpperCase();
  const status = String(item.statusRaw ?? "").toUpperCase();
  return portal === "BINANCE" && status === "PENDIENTE";
}
// Redirección externa segura
function redirectTo(url: string) {
  window.location.assign(url);
}
// Copia texto al portapapeles con fallback para navegadores antiguos
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copiado ✅");
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success("Copiado ✅");
    } catch {
      toast.error("No se pudo copiar");
    }
  }
}
// Extrae y normaliza PINs antiguos desde estructuras legacy
function extractLegacyPins(s: ApiSaleItem): string[] {
  const out: string[] = [];

  const legacy = s.pin?.codigo;
  if (typeof legacy === "string" && legacy.trim()) out.push(legacy.trim());

  if (Array.isArray(s.pins) && s.pins.length) {
    for (const it of s.pins) {
      const c = it?.pin?.codigo;
      if (typeof c === "string" && c.trim()) out.push(c.trim());
    }
  }

  return Array.from(new Set(out));
}
// Normaliza cantidades inválidas o ausentes
function normalizeQty(q: any): number {
  const n = Number(q);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}
// ==============================
// Componente principal: ProfileOrders
// ==============================
const OrderHistoryPage = () => {
  const { user } = useAuth();
  // Estados de carga, errores y datos del historial
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rawSales, setRawSales] = useState<ApiSaleItem[]>([]);
  const [serverTotal, setServerTotal] = useState(0);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<HistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const openOrderDetail = (order: HistoryItem) => {
    setSelectedOrder((prev) => (prev === order ? null : order));
    setIsModalOpen(true);
  };

  // Filtros aplicables al historial (cliente + servidor)
  const [filters, setFilters] = useState<{
    q: string;
    status: "ALL" | StatusApi;
    payment: "ALL" | string;
    from: string;
    to: string;
  }>({ q: "", status: "ALL", payment: "ALL", from: "", to: "" });
  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [payingSaleId, setPayingSaleId] = useState<string | null>(null); // Controla estado de pago en curso (previene doble click)

  // Obtiene una página del historial desde la API
  async function fetchPage(
    params: MyOrdersSearchBody & { page: number; pageSize: number },
  ) {
    const res = await searchMyOrders(params);
    return res as unknown as {
      items: ApiSaleItem[];
      page: number;
      pageSize: number;
      total: number;
    };
  }

  // Carga completa del historial para filtros locales avanzados
  async function fetchAllForClientFiltering(base: MyOrdersSearchBody) {
    setLoadingAll(true);
    try {
      const first = await fetchPage({ ...base, page: 1, pageSize: 100 });
      const totalPages = Math.max(1, Math.ceil(first.total / first.pageSize));
      let all = [...(first.items || [])];

      for (
        let p = 2;
        p <= totalPages && all.length < CLIENT_FILTER_PAGE_CAP;
        p++
      ) {
        const pageRes = await fetchPage({ ...base, page: p, pageSize: 100 });
        all = all.concat(pageRes.items || []);
      }

      setRawSales(all);
      setServerTotal(Number.isFinite(first.total) ? first.total : all.length);
    } catch (e) {
      console.error("fetchAllForClientFiltering error", e);
    } finally {
      setLoadingAll(false);
    }
  }

  // Recarga inicial o manual del historial
  const reloadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const status = filters.status === "ALL" ? undefined : filters.status;
      const res = await fetchPage({ status, page: 1, pageSize: 100 });

      setRawSales(res.items || []);
      setServerTotal(
        Number.isFinite(res.total) ? res.total : (res.items?.length ?? 0),
      );
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          "No se pudo obtener el historial de compras",
      );
    } finally {
      setLoading(false);
    }
  };
  // Carga inicial y recarga al cambiar estado seleccionado
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mounted) return;
      await reloadOrders();
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status]);

  // Detecta filtros de cliente y dispara carga completa si es necesario
  useEffect(() => {
    const usesClientFilters =
      filters.q.trim().length > 0 ||
      filters.payment !== "ALL" ||
      !!filters.from ||
      !!filters.to;

    if (!usesClientFilters) return;

    const haveAll =
      (Array.isArray(rawSales) ? rawSales.length : 0) >= serverTotal &&
      serverTotal > 0;

    if (!haveAll) {
      const status = filters.status === "ALL" ? undefined : filters.status;
      fetchAllForClientFiltering({ status });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.payment, filters.from, filters.to, serverTotal]);

  // Aplica filtros de texto, fechas y método de pago en cliente
  const filteredSales: ApiSaleItem[] = useMemo(() => {
    const list = Array.isArray(rawSales) ? rawSales : [];
    const q = filters.q.trim().toLowerCase();
    const fromDate = filters.from
      ? new Date(filters.from + "T00:00:00Z")
      : null;
    const toDate = filters.to ? new Date(filters.to + "T23:59:59Z") : null;

    return list
      .filter((s) =>
        filters.status === "ALL" ? true : s.status === filters.status,
      )
      .filter((s) => {
        const topItem =
          Array.isArray(s.items) && s.items.length > 0 ? s.items[0] : undefined;
        const productTitle = (
          topItem?.productTitle ??
          s.product?.title ??
          ""
        ).toLowerCase();
        const subName = (
          topItem?.subproductName ??
          s.subproduct?.name ??
          ""
        ).toLowerCase();
        const portal = (s.paymentPortal ?? "—").toLowerCase();
        const ref = (s.referenceNumber ?? "").toLowerCase();

        const matchesText =
          !q ||
          productTitle.includes(q) ||
          subName.includes(q) ||
          portal.includes(q) ||
          ref.includes(q) ||
          String(s.saleNumber ?? "").includes(q);

        const selectedPay = (filters.payment ?? "ALL").toLowerCase();
        const matchesPayment =
          selectedPay === "all" ||
          portal === selectedPay ||
          (selectedPay === "banco_colombia" && portal === "bancolombia");

        const created = new Date(s.createdAt);
        const matchesFrom = !fromDate || created >= fromDate;
        const matchesTo = !toDate || created <= toDate;

        return matchesText && matchesPayment && matchesFrom && matchesTo;
      });
  }, [rawSales, filters]);

  // Transforma ventas crudas en datos listos para UI
  const historyData: HistoryItem[] = useMemo(() => {
    const list = Array.isArray(filteredSales) ? filteredSales : [];
    return list.map((s) => {
      const topItem =
        Array.isArray(s.items) && s.items.length > 0 ? s.items[0] : undefined;
      const product = topItem?.productTitle ?? s.product?.title ?? "—";
      const pack = topItem?.subproductName ?? s.subproduct?.name ?? "—";
      const total = formatAmountSmart(s);
      const payment = capFirst(s.paymentPortal);

      return {
        id: s.id,
        saleNumber: s.saleNumber ?? null,
        referenceNumber: s.referenceNumber ?? null,
        detail: `${product} — ${pack}`,
        paymentMethod: payment,
        total,
        date: formatDate(s.createdAt),
        status: mapStatusToLabel(s.status),
        statusRaw: s.status,
        paymentPortalRaw: s.paymentPortal ?? null,
        message: s.message ?? null,
        binanceCheckoutUrl: s.binanceCheckoutUrl ?? null,
        quantity: normalizeQty(s.quantity),
        clientPinsDisplay: s.clientPinsDisplay ?? null,
        clientPins: Array.isArray(s.clientPins) ? s.clientPins : null,
        legacyPins: extractLegacyPins(s),
      };
    });
  }, [filteredSales]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, historyData.length]);

  // Cálculo de páginas y slicing del historial
  const totalPages = Math.max(1, Math.ceil(historyData.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historyData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const fmtN = (n?: number | null) => (typeof n === "number" ? `N° ${n}` : "—");

  // Resuelve prioridad de PINs: cliente → display → legacy
  function resolvePins(item: HistoryItem): {
    pins: string[];
    display?: string | null;
  } {
    const clientPins = Array.isArray(item.clientPins)
      ? item.clientPins.filter(Boolean)
      : [];
    if (clientPins.length) return { pins: clientPins };

    const disp = (item.clientPinsDisplay ?? "").trim();
    if (disp) {
      if (disp.toLowerCase() === "por asignar")
        return { pins: [], display: disp };
      const maybePins = disp
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      if (maybePins.length) return { pins: maybePins, display: disp };
      return { pins: [], display: disp };
    }

    const legacy = Array.isArray(item.legacyPins) ? item.legacyPins : [];
    return { pins: legacy };
  }

  // Maneja flujo de pago Binance con refresh de seguridad
  async function handlePay(item: HistoryItem) {
    if (payingSaleId) return;

    try {
      setPayingSaleId(item.id);

      if (item.binanceCheckoutUrl && item.binanceCheckoutUrl.trim()) {
        toast.success("Abriendo Binance Pay…");
        redirectTo(item.binanceCheckoutUrl.trim());
        return;
      }

      const refreshed = await fetchPage({
        status: undefined,
        page: 1,
        pageSize: 100,
      });

      const found = (refreshed.items || []).find((x) => x.id === item.id);
      const url = found?.binanceCheckoutUrl?.trim() || "";

      if (!url) {
        toast.error(
          "Esta compra no trae enlace de pago en el historial. El backend debe incluir binanceCheckoutUrl en /sales/my/search.",
        );
        return;
      }

      toast.success("Abriendo Binance Pay…");
      redirectTo(url);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        "No se pudo abrir el pago. Intenta nuevamente.";
      toast.error(msg);
    } finally {
      setPayingSaleId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-6">
          Mi <span className="gradient-text">Cuenta</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <ProfileSidebar activePage="orders" />

          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Historial de <span className="gradient-text">Compras</span>
              </h2>
              <div className="w-full mb-5 bg-muted/30 backdrop-blur-sm border border-border rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {/* Buscar */}
                  <div className="lg:col-span-2">
                    <input
                      type="text"
                      value={filters.q}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, q: e.target.value }))
                      }
                      placeholder="Buscar producto, número, método..."
                      className="w-full bg-background border border-border p-2.5 rounded-lg outline-none focus:ring-2 ring-primary"
                    />
                  </div>

                  {/* Estado */}
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        status: e.target.value as any,
                      }))
                    }
                    className="w-full bg-background border border-border p-2.5 rounded-lg">
                    <option value="ALL">Todos</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="COMPLETADO">Completado</option>
                    <option value="DEVUELTO">Devuelto</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>

                  {/* Desde */}
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, from: e.target.value }))
                    }
                    className="w-full bg-background border border-border p-2.5 rounded-lg"
                  />

                  {/* Hasta */}
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, to: e.target.value }))
                    }
                    className="w-full bg-background border border-border p-2.5 rounded-lg"
                  />

                  {/* Método */}
                  {/* <select
                    value={filters.payment}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, payment: e.target.value }))
                    }
                    className="w-full bg-background border border-border p-2.5 rounded-lg">
                    <option value="ALL">Todos</option>
                    <option value="binance">Binance</option>
                    <option value="bancolombia">Bancolombia</option>
                  </select> */}
                </div>
              </div>

              {(loading || loadingAll) && (
                <div className="text-center py-8 text-muted-foreground">
                  {loading ? "Cargando compras..." : "Aplicando filtros..."}
                </div>
              )}

              {!loading && !loadingAll && error && (
                <div className="text-center py-4">
                  <p className="text-red-500">{error}</p>
                  <Button onClick={reloadOrders} className="mt-2">
                    Reintentar
                  </Button>
                </div>
              )}
              {!loading && !loadingAll && historyData.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tienes compras aún</p>
                </div>
              ) : (
                !loading &&
                !loadingAll &&
                historyData.length > 0 && (
                  <div className="space-y-4">
                    {currentItems.map((order) => {
                      const paying = payingSaleId === order.id;
                      const isOpen = expandedOrder === order.id;
                      const pinsInfo = resolvePins(order);

                      return (
                        <div
                          key={order.id}
                          className="border border-border rounded-lg overflow-hidden">
                          {/* Order Header */}
                          <button
                            onClick={() => toggleOrder(order.id)}
                            className="w-full p-3 sm:p-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="text-left min-w-0">
                                <p className="font-medium text-sm sm:text-base truncate">
                                  {order.detail}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{order.date}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                              <Badge
                                className={`${badgeClass(order.status)} text-[10px] sm:text-xs`}>
                                {order.status}
                              </Badge>
                              <span className="font-bold text-sm sm:text-base text-neon-green hidden sm:block">
                                ${order.total}
                              </span>
                              {expandedOrder === order.id ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>

                          {/* Order Details */}
                          {expandedOrder === order.id && (
                            <div className="p-3 sm:p-4 border-t border-border bg-background/50">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {order.detail}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Cantidad: {order.quantity}
                                    </p>
                                  </div>
                                  <span className="text-sm font-medium text-neon-green flex-shrink-0">
                                    ${order.total}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="sm:hidden">
                                  <span className="text-sm text-muted-foreground">
                                    Total:{" "}
                                  </span>
                                  <span className="font-bold text-neon-green">
                                    ${order.total}
                                  </span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() => openOrderDetail(order)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalles
                                </Button>
                                <span className="font-bold text-lg text-neon-green hidden sm:block">
                                  Total: ${order.total}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center gap-2">
                        {/* Prev */}
                        <button
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-40">
                          ‹
                        </button>

                        {/* Pages */}
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`px-4 py-2 rounded-lg ${
                              currentPage === page
                                ? "bg-primary text-white"
                                : "bg-muted hover:bg-muted/70"
                            }`}>
                            {page}
                          </button>
                        ))}

                        {/* Next */}
                        <button
                          onClick={() =>
                            paginate(Math.min(totalPages, currentPage + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-40">
                          ›
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <OrderDetailModal
        order={selectedOrder}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default OrderHistoryPage;
{
  /* ---------------------------------------------------------------------------------------------------------------------------------------------------*/
}
