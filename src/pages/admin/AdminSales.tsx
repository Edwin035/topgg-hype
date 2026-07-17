import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import {
  searchAdminSales,
  type AdminSale,
  type AdminSalesParams,
} from "@/lib/api/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SaleActions } from "@/components/admin/SaleActions";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROCESO", label: "En proceso" },
  { value: "COMPLETADA", label: "Completada" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "DEVUELTA", label: "Devuelta" },
  { value: "REQUIERE_ATENCION", label: "Requiere atención" },
];

const STATUS_BADGE: Record<string, string> = {
  PENDIENTE: "bg-amber-400/95 text-black",
  EN_PROCESO: "bg-blue-500/95 text-white",
  COMPLETADA: "bg-green-500/95 text-white",
  CANCELADA: "bg-red-500/95 text-white",
  DEVUELTA: "bg-orange-500/95 text-white",
  REQUIERE_ATENCION: "bg-purple-500/95 text-white",
};

const PAGE_SIZE = 20;

function statusLabel(status: string) {
  return (
    STATUS_OPTIONS.find((o) => o.value === status)?.label ??
    status.replace(/_/g, " ")
  );
}

function formatCop(n: number, currency?: string | null) {
  return `${currency === "USD" ? "US$" : "$"}${Math.round(n).toLocaleString("es-CO")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={cn(
        "text-[10px] sm:text-xs",
        STATUS_BADGE[status] ?? "bg-gray-500 text-white",
      )}>
      {statusLabel(status)}
    </Badge>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function SaleDetail({ sale }: { sale: AdminSale }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-3">
        <DetailRow label="ID venta" value={`#${sale.id}`} />
        <DetailRow label="Estado" value={<StatusBadge status={sale.status} />} />
        <DetailRow label="Creada" value={formatDate(sale.createdAt)} />
        <DetailRow
          label="Pagada"
          value={sale.paidAt ? formatDate(sale.paidAt) : "—"}
        />
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Cliente
        </p>
        <DetailRow label="Nombre" value={sale.user?.name || "—"} />
        <DetailRow label="Email" value={sale.user?.email || "—"} />
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Producto y montos
        </p>
        <DetailRow
          label="Producto"
          value={`${sale.productName} x${sale.quantity}`}
        />
        <DetailRow
          label="Total"
          value={formatCop(sale.total, sale.currencyCode)}
        />
        <DetailRow
          label="Cobrado (USDT)"
          value={sale.amountUsdt != null ? `${sale.amountUsdt} USDT` : "—"}
        />
        <DetailRow
          label="Tasa"
          value={
            sale.usdtCopRate != null
              ? `1 USDT = ${sale.usdtCopRate.toLocaleString("es-CO")} COP`
              : "—"
          }
        />
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Binance
        </p>
        <DetailRow label="Estado Binance" value={sale.binanceStatus || "—"} />
        <DetailRow
          label="Merchant Trade No"
          value={sale.binanceMerchantTradeNo || "—"}
        />
        <DetailRow
          label="Transaction ID"
          value={sale.binanceTransactionId || "—"}
        />
        {sale.fulfillmentAttempts > 0 || sale.fulfillmentError ? (
          <DetailRow
            label="Intentos de entrega"
            value={sale.fulfillmentAttempts}
          />
        ) : null}
        {sale.fulfillmentError ? (
          <div className="mt-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {sale.fulfillmentError}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Pines ({sale.pins.length})
        </p>
        {sale.pins.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin pines entregados.</p>
        ) : (
          <div className="space-y-2">
            {sale.pins.map((p) => (
              <div
                key={p.id}
                className="rounded-md bg-muted/50 p-2 font-mono text-sm text-foreground break-all">
                {p.pin}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const AdminSales = () => {
  const [filters, setFilters] = useState<AdminSalesParams>({
    status: "ALL",
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [qInput, setQInput] = useState("");
  const [selected, setSelected] = useState<AdminSale | null>(null);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["admin-sales", filters],
    queryFn: () => searchAdminSales(filters),
    placeholderData: keepPreviousData,
  });

  const patch = (next: Partial<AdminSalesParams>) =>
    setFilters((f) => ({ ...f, ...next, page: next.page ?? 1 }));

  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const pageSize = data?.pageSize ?? PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ventas</h1>
        <p className="text-sm text-muted-foreground">
          {total} venta{total === 1 ? "" : "s"} en total.
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            patch({ q: qInput.trim() || undefined });
          }}
          className="sm:col-span-2 lg:col-span-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Buscar por producto, email, nombre o #venta"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        <select
          value={filters.status}
          onChange={(e) => patch({ status: e.target.value })}
          className="rounded-lg border border-border bg-background p-2.5 text-sm">
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={filters.from ?? ""}
            onChange={(e) => patch({ from: e.target.value || undefined })}
            className="w-full rounded-lg border border-border bg-background p-2.5 text-sm"
          />
          <input
            type="date"
            value={filters.to ?? ""}
            onChange={(e) => patch({ to: e.target.value || undefined })}
            className="w-full rounded-lg border border-border bg-background p-2.5 text-sm"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-destructive">
                    No se pudieron cargar las ventas
                    {error instanceof Error ? `: ${error.message}` : "."}
                  </TableCell>
                </TableRow>
              ) : data && data.items.length > 0 ? (
                data.items.map((sale) => (
                  <TableRow
                    key={sale.id}
                    onClick={() => setSelected(sale)}
                    className="cursor-pointer">
                    <TableCell className="font-medium">#{sale.id}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(sale.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[180px] truncate">
                        {sale.user?.name || "—"}
                      </div>
                      <div className="max-w-[180px] truncate text-xs text-muted-foreground">
                        {sale.user?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {sale.productName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        x{sale.quantity}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">
                      {formatCop(sale.total, sale.currencyCode)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sale.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground">
                    No hay ventas con estos filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Página {page} de {totalPages}
            {isFetching ? " · actualizando…" : ""}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => patch({ page: Math.max(1, page - 1) })}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none">
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              onClick={() => patch({ page: Math.min(totalPages, page + 1) })}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none">
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detalle */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Venta #{selected?.id} —{" "}
              {selected ? statusLabel(selected.status) : ""}
            </DialogTitle>
          </DialogHeader>
          {selected ? <SaleDetail sale={selected} /> : null}

          {selected ? (
            <div className="mt-2 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Acciones
              </p>
              <SaleActions
                sale={selected}
                onDone={() => setSelected(null)}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSales;
