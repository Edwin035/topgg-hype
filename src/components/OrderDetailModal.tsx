import { Copy, Gift, Package, Calendar, User, Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { type HistoryItem } from "@/pages/OrderHistoryPage";

interface OrderDetailModalProps {
  order: HistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<HistoryItem["status"], string> = {
  Completado: "bg-neon-green/20 text-neon-green border-neon-green/30",
  Pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "En Proceso": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Devuelto: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Cancelada: "bg-destructive/20 text-destructive border-destructive/30",
};

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
          <div
            key={index}
            className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">
            {chunk}
          </div>
        );
      }

      const [, cuentaLabel, rest] = match;
      const lines = rest
        .split(".")
        .map((line) => line.trim())
        .filter(Boolean);

      return (
        <div
          key={index}
          className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
          <div className="font-semibold text-sm text-foreground">
            {cuentaLabel}
          </div>

          {lines.map((line, i) => (
            <div key={i} className="text-sm text-muted-foreground">
              {line}.
            </div>
          ))}
        </div>
      );
    });
}

function resolvePins(order: HistoryItem): {
  pins: string[];
  display?: string | null;
} {
  const clientPins = Array.isArray(order.clientPins)
    ? order.clientPins.filter(Boolean)
    : [];

  if (clientPins.length) return { pins: clientPins };

  const disp = (order.clientPinsDisplay ?? "").trim();

  if (disp) {
    if (disp.toLowerCase() === "por asignar") {
      return { pins: [], display: disp };
    }

    const maybePins = disp
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    if (maybePins.length) return { pins: maybePins, display: disp };

    return { pins: [], display: disp };
  }

  const legacy = Array.isArray(order.legacyPins) ? order.legacyPins : [];

  return { pins: legacy };
}

const OrderDetailModal = ({
  order,
  open,
  onOpenChange,
}: OrderDetailModalProps) => {
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!order) return null;

  const pinsInfo = resolvePins(order);

  const copyText = async (text: string, title = "Copiado") => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      el.style.top = "-9999px";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }

    toast({
      title,
      description: "Copiado al portapapeles",
    });
  };

  const copyPin = async (pin: string) => {
    await copyText(pin, "PIN copiado");
    setCopiedPin(pin);

    window.setTimeout(() => {
      setCopiedPin((current) => (current === pin ? null : current));
    }, 1500);
  };

  const copyAllPins = async () => {
    if (!pinsInfo.pins.length) return;

    const text = pinsInfo.pins
      .map((pin, index) => `PIN #${index + 1}: ${pin}`)
      .join("\n");

    await copyText(text, "Pines copiados");
    setCopiedAll(true);

    window.setTimeout(() => {
      setCopiedAll(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[calc(100vw-1.5rem)]
          max-w-3xl
          max-h-[90vh]
          overflow-hidden
          p-0
          border-border
          bg-background
        ">
        <DialogHeader className="px-5 sm:px-6 pt-5 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
            <Package className="h-5 w-5 text-primary shrink-0" />
            <span className="truncate">Detalles de la Compra</span>
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(90vh-82px)] overflow-y-auto px-5 sm:px-6 py-5">
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-border">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1">
                  Número de compra
                </p>

                <p className="font-semibold text-foreground break-all">
                  {order.saleNumber ? `N° ${order.saleNumber}` : order.id}
                </p>

                <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{order.date || "Fecha no disponible"}</span>
                </p>
              </div>

              <Badge
                className={`${statusColors[order.status]} w-fit border px-3 py-1`}>
                {order.status}
              </Badge>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    Producto
                  </p>

                  <p className="font-semibold text-sm sm:text-base text-foreground break-words">
                    {order.detail}
                  </p>

                  <p className="text-xs text-muted-foreground mt-2">
                    Cantidad: {order.quantity}
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    Método: {order.paymentMethod}
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg sm:text-xl font-bold text-neon-green whitespace-nowrap">
                    {order.total}
                  </p>
                </div>
              </div>
            </div>

            {order.message ? (
              <div className="pt-1">
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cuentas / IDs del jugador
                </p>

                <div className="space-y-2">
                  {renderAccountsFromBackend(order.message)}
                </div>
              </div>
            ) : null}

            {(pinsInfo.pins.length > 0 || pinsInfo.display) && (
              <div className="pt-1">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Gift className="h-4 w-4 text-yellow-500" />
                    Códigos PIN
                  </p>

                  {pinsInfo.pins.length > 0 ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={copyAllPins}
                      className="w-full sm:w-auto">
                      {copiedAll ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Todos copiados
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar todos
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>

                {pinsInfo.pins.length > 0 ? (
                  <div className="space-y-3">
                    {pinsInfo.pins.map((pin, index) => (
                      <div
                        key={`${pin}-${index}`}
                        className="
                          rounded-xl
                          border
                          border-border
                          bg-card
                          p-3
                          sm:p-4
                        ">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">
                              PIN #{index + 1}
                            </p>

                            <code className="block font-mono text-sm sm:text-base font-semibold text-foreground break-all leading-relaxed">
                              {pin}
                            </code>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyPin(pin)}
                            className="w-full sm:w-auto shrink-0">
                            {copiedPin === pin ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    {pinsInfo.display}
                  </div>
                )}
              </div>
            )}

            <div className="pt-5 border-t border-border flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Total:</span>
              <span className="text-xl sm:text-2xl font-bold text-neon-green whitespace-nowrap">
                {order.total}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;