import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

import {
  cancelSale,
  resolveSale,
  retryFulfillSale,
  type AdminSale,
  type ResolveOutcome,
} from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type DialogKind = null | "retry" | "resolve" | "cancel";

/**
 * Acciones del gestor sobre una venta (fase 2). Se muestra solo lo aplicable
 * según el estado. Reutilizable en la cola de atención y en el detalle de ventas.
 */
export function SaleActions({
  sale,
  onDone,
}: {
  sale: AdminSale;
  onDone?: () => void;
}) {
  const qc = useQueryClient();
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState<ResolveOutcome>("COMPLETADA");

  const paidNoPins = !!sale.paidAt && sale.pins.length === 0;
  const canRetry =
    paidNoPins &&
    (sale.status === "REQUIERE_ATENCION" || sale.status === "EN_PROCESO");
  const canResolve = sale.status === "REQUIERE_ATENCION";
  const canCancel =
    sale.status !== "COMPLETADA" && sale.status !== "CANCELADA";

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-sales"] });
    void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    void qc.invalidateQueries({ queryKey: ["admin-attention"] });
  };

  const close = () => {
    setDialog(null);
    setNote("");
  };

  const retryMut = useMutation({
    mutationFn: () => retryFulfillSale(sale.id),
    onSuccess: (data) => {
      invalidate();
      close();
      if (data.result.fulfilled) {
        toast.success("Entrega completada");
      } else {
        toast.warning(
          `No se pudo entregar: ${data.result.reason ?? "reintenta más tarde"}`,
        );
      }
      onDone?.();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Error al reintentar"),
  });

  const resolveMut = useMutation({
    mutationFn: () =>
      resolveSale(sale.id, { outcome, note: note.trim() || undefined }),
    onSuccess: () => {
      invalidate();
      close();
      toast.success("Venta resuelta");
      onDone?.();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Error al resolver"),
  });

  const cancelMut = useMutation({
    mutationFn: () => cancelSale(sale.id, { note: note.trim() || undefined }),
    onSuccess: () => {
      invalidate();
      close();
      toast.success("Venta cancelada");
      onDone?.();
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Error al cancelar"),
  });

  const busy =
    retryMut.isPending || resolveMut.isPending || cancelMut.isPending;

  if (!canRetry && !canResolve && !canCancel) {
    return (
      <p className="text-xs text-muted-foreground">
        Sin acciones disponibles para esta venta.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canRetry ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialog("retry")}
            disabled={busy}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar entrega
          </Button>
        ) : null}
        {canResolve ? (
          <Button
            size="sm"
            onClick={() => {
              setOutcome("COMPLETADA");
              setDialog("resolve");
            }}
            disabled={busy}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Marcar resuelto
          </Button>
        ) : null}
        {canCancel ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDialog("cancel")}
            disabled={busy}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancelar venta
          </Button>
        ) : null}
      </div>

      {/* Reintentar */}
      <Dialog open={dialog === "retry"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reintentar entrega</DialogTitle>
            <DialogDescription>
              Se volverá a intentar canjear el pin en Hype para la venta #
              {sale.id}. Hazlo solo si el pago está confirmado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={close}
              disabled={retryMut.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={() => retryMut.mutate()}
              disabled={retryMut.isPending}>
              {retryMut.isPending ? "Reintentando…" : "Reintentar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolver */}
      <Dialog open={dialog === "resolve"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver venta #{sale.id}</DialogTitle>
            <DialogDescription>
              Marca el desenlace tras gestionar el caso con el cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOutcome("COMPLETADA")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors",
                  outcome === "COMPLETADA"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}>
                Completada (entregada)
              </button>
              <button
                type="button"
                onClick={() => setOutcome("CANCELADA")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors",
                  outcome === "CANCELADA"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}>
                Cancelada (reembolso)
              </button>
            </div>
            <Textarea
              placeholder="Nota (opcional): cómo se resolvió el caso…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={close}
              disabled={resolveMut.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={() => resolveMut.mutate()}
              disabled={resolveMut.isPending}>
              {resolveMut.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancelar */}
      <Dialog open={dialog === "cancel"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar venta #{sale.id}</DialogTitle>
            <DialogDescription>
              La venta pasará a CANCELADA. La acción queda registrada con tu
              usuario.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo (opcional)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={close}
              disabled={cancelMut.isPending}>
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMut.mutate()}
              disabled={cancelMut.isPending}>
              {cancelMut.isPending ? "Cancelando…" : "Confirmar cancelación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
