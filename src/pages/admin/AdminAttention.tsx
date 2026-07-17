import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Mail, User } from "lucide-react";

import { searchAdminSales, type AdminSale } from "@/lib/api/admin";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SaleActions } from "@/components/admin/SaleActions";

function formatCop(n: number) {
  return `$${Math.round(n).toLocaleString("es-CO")}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AttentionCard({
  sale,
  onDone,
}: {
  sale: AdminSale;
  onDone: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-400">
              Venta #{sale.id}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {sale.productName} x{sale.quantity}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              {sale.user?.name || "—"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a
                href={`mailto:${sale.user?.email}`}
                className="text-primary hover:underline">
                {sale.user?.email}
              </a>
            </div>
            <div className="text-muted-foreground">
              Total:{" "}
              <span className="font-medium text-foreground">
                {formatCop(sale.total)}
                {sale.amountUsdt != null ? ` · ${sale.amountUsdt} USDT` : ""}
              </span>
            </div>
            <div className="text-muted-foreground">
              Pagada:{" "}
              <span className="font-medium text-foreground">
                {formatDate(sale.paidAt)}
              </span>
            </div>
          </div>

          {sale.fulfillmentError ? (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {sale.fulfillmentError}
                {sale.fulfillmentAttempts > 0
                  ? ` · ${sale.fulfillmentAttempts} intentos`
                  : ""}
              </span>
            </div>
          ) : null}
        </div>

        <div className="lg:pt-1">
          <SaleActions sale={sale} onDone={onDone} />
        </div>
      </div>
    </Card>
  );
}

const AdminAttention = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-attention"],
    queryFn: () =>
      searchAdminSales({
        status: "REQUIERE_ATENCION",
        page: 1,
        pageSize: 100,
      }),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Requiere atención
        </h1>
        <p className="text-sm text-muted-foreground">
          Ventas pagadas que no se pudieron entregar. Contacta al cliente y
          resuelve el caso (no hay reembolso automático).
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <Card className="p-6 text-sm text-destructive">
          No se pudieron cargar las ventas
          {error instanceof Error ? `: ${error.message}` : "."}
        </Card>
      ) : null}

      {data && items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-7 w-7 text-green-500" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            Todo al día
          </p>
          <p className="text-sm text-muted-foreground">
            No hay ventas pendientes de resolución manual.
          </p>
        </Card>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((sale) => (
            <AttentionCard
              key={sale.id}
              sale={sale}
              onDone={() => void refetch()}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AdminAttention;
