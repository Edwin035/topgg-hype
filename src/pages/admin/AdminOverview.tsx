import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Coins,
  Percent,
  Receipt,
  TrendingUp,
} from "lucide-react";

import {
  getAdminStats,
  type AdminStats,
  type StatsRange,
} from "@/lib/api/admin";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const RANGES: Array<{ value: StatsRange; label: string }> = [
  { value: "today", label: "Hoy" },
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "all", label: "Todo" },
];

const STATUS_META: Record<string, { label: string; dot: string }> = {
  PENDIENTE: { label: "Pendiente", dot: "bg-amber-400" },
  EN_PROCESO: { label: "En proceso", dot: "bg-blue-500" },
  COMPLETADA: { label: "Completada", dot: "bg-green-500" },
  CANCELADA: { label: "Cancelada", dot: "bg-red-500" },
  DEVUELTA: { label: "Devuelta", dot: "bg-orange-500" },
  REQUIERE_ATENCION: { label: "Requiere atención", dot: "bg-purple-500" },
};

function formatCop(n: number) {
  return `$${Math.round(n).toLocaleString("es-CO")}`;
}

function formatUsdt(n: number) {
  return `${n.toLocaleString("es-CO", { maximumFractionDigits: 2 })} USDT`;
}

function formatPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {sub ? (
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            accent ?? "bg-primary/10 text-primary",
          )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

function StatusBreakdown({ stats }: { stats: AdminStats }) {
  const rows = stats.byStatus.filter((b) => b.count > 0);
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin ventas en este periodo.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((b) => {
        const meta = STATUS_META[b.status] ?? {
          label: b.status,
          dot: "bg-gray-400",
        };
        return (
          <div key={b.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
              <span className="text-sm text-foreground">{meta.label}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-foreground">
                {b.count}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {formatCop(b.totalCop)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const AdminOverview = () => {
  const [range, setRange] = useState<StatsRange>("7d");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-stats", range],
    queryFn: () => getAdminStats(range),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Resumen de ventas y pagos.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                range === r.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <OverviewSkeleton /> : null}

      {isError ? (
        <Card className="p-6 text-sm text-destructive">
          No se pudieron cargar las estadísticas
          {error instanceof Error ? `: ${error.message}` : "."}
        </Card>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <KpiCard
              icon={BarChart3}
              label="Ventas (periodo)"
              value={String(data.totals.sales)}
              sub={`${data.totals.completed} completadas`}
            />
            <KpiCard
              icon={Coins}
              label="Ingresos COP"
              value={formatCop(data.totals.revenueCop)}
              sub="Solo ventas completadas"
            />
            <KpiCard
              icon={TrendingUp}
              label="Ingresos USDT"
              value={formatUsdt(data.totals.revenueUsdt)}
              sub="Cobrado vía Binance"
            />
            <KpiCard
              icon={Receipt}
              label="Ticket promedio"
              value={formatCop(data.totals.avgTicketCop)}
            />
            <KpiCard
              icon={Percent}
              label="Conversión"
              value={formatPct(data.totals.conversionRate)}
              sub="Completadas / total"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Requiere atención"
              value={String(data.attention.count)}
              sub={`${formatCop(data.attention.valueCop)} por resolver`}
              accent={
                data.attention.count > 0
                  ? "bg-purple-500/15 text-purple-400"
                  : undefined
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                Ventas por día
              </h2>
              {data.series.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  Sin datos en este periodo.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.series}
                      margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient
                          id="fillVentas"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        tickFormatter={(d: string) => d.slice(5)}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number, name) =>
                          name === "revenueCop"
                            ? [formatCop(value), "Ingresos"]
                            : [value, "Ventas"]
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#fillVentas)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                Por estado
              </h2>
              <StatusBreakdown stats={data} />
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminOverview;
