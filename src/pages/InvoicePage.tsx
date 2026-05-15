import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Copy, ExternalLink, Check, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Product } from "@/components/ProductCard";
import type { PreRedeemResponse } from "@/lib/providers/endpoints/redeem";
import type { Sale } from "@/lib/api/sales";

type InvoicePageState = {
  product?: Product;
  quantity?: number;
  preRedeem?: PreRedeemResponse;
  sale?: Sale;
};

type PinItem = {
  id: string;
  pin: string;
  redirectLink?: string;
  transactionId?: string;
};

function buildPinItemsFromSale(sale?: Sale): PinItem[] {
  if (!sale?.pins?.length) return [];

  return sale.pins.map((item) => ({
    id: String(item.id),
    pin: item.pin,
    redirectLink: item.redirectLink ?? undefined,
    transactionId: item.transactionId ?? undefined,
  }));
}

function buildPinItems(preRedeem?: PreRedeemResponse): PinItem[] {
  if (!preRedeem) return [];

  const itemsFromTransactions: PinItem[] = [];

  if (preRedeem.transaction) {
    const transaction = preRedeem.transaction;

    if (transaction.key) {
      itemsFromTransactions.push({
        id:
          transaction.transactionId ||
          transaction.key ||
          `transaction-${Date.now()}`,
        pin: transaction.key,
        redirectLink: transaction.redirectLink,
        transactionId: transaction.transactionId,
      });
    }
  }

  if (Array.isArray(preRedeem.transactions)) {
    preRedeem.transactions.forEach((transaction, index) => {
      if (!transaction.key) return;

      itemsFromTransactions.push({
        id:
          transaction.transactionId ||
          transaction.key ||
          `transaction-${index}`,
        pin: transaction.key,
        redirectLink: transaction.redirectLink,
        transactionId: transaction.transactionId,
      });
    });
  }

  if (itemsFromTransactions.length > 0) {
    return itemsFromTransactions;
  }

  if (Array.isArray(preRedeem.pins)) {
    return preRedeem.pins.map((pin, index) => ({
      id: `${pin}-${index}`,
      pin,
    }));
  }

  if (preRedeem.key) {
    return [
      {
        id: preRedeem.key,
        pin: preRedeem.key,
      },
    ];
  }

  return [];
}

const InvoicePage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const state = location.state as InvoicePageState | null;

  const product = state?.product;
  const quantity = state?.quantity ?? state?.sale?.quantity ?? 1;
  const preRedeem = state?.preRedeem;
  const sale = state?.sale;

  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const pinItems = useMemo(() => {
    const salePins = buildPinItemsFromSale(sale);

    if (salePins.length > 0) {
      return salePins;
    }

    return buildPinItems(preRedeem);
  }, [sale, preRedeem]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  const handleCopyPin = async (pin: string) => {
    await copyText(pin);

    setCopiedPin(pin);

    window.setTimeout(() => {
      setCopiedPin((current) => (current === pin ? null : current));
    }, 1500);
  };

  const handleCopyAllPins = async () => {
    if (pinItems.length === 0) return;

    const allPins = pinItems
      .map((item, index) => `PIN #${index + 1}: ${item.pin}`)
      .join("\n");

    await copyText(allPins);

    setCopiedAll(true);

    window.setTimeout(() => {
      setCopiedAll(false);
    }, 1500);
  };

  const total = product
    ? product.price * quantity
    : sale
      ? Number(sale.total)
      : 0;

  const productName = product?.name ?? sale?.productName ?? "Producto digital";
  const productPrice = product?.price ?? (sale ? Number(sale.unitPrice) : 0);
  const currencySymbol =
    product?.currencySymbol ?? sale?.currencySymbol ?? "$";
  const paymentMethod = sale?.method ?? "BINANCE";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="mb-8">
              <p className="text-sm text-primary font-semibold mb-2">
                Compra completada
              </p>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Factura / Entrega digital
              </h1>

              <p className="text-muted-foreground mt-2">
                Tu compra fue procesada correctamente. Guarda tus pines en un
                lugar seguro.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4 mb-6">
              <p className="text-sm text-muted-foreground">Producto</p>
              <p className="font-bold text-foreground mt-1">{productName}</p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Cantidad</p>
                  <p className="font-semibold text-foreground">{quantity}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Precio unitario
                  </p>
                  <p className="font-semibold text-foreground">
                    {currencySymbol}
                    {productPrice.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Método de pago
                  </p>
                  <p className="font-semibold text-foreground">
                    {paymentMethod}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold text-neon-green">
                    {currencySymbol}
                    {total.toFixed(2)}
                  </p>
                </div>
              </div>

              {sale?.id ? (
                <p className="text-xs text-muted-foreground mt-4">
                  Venta #{sale.id}
                </p>
              ) : null}
            </div>

            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Pines entregados
                  </h2>

                  {pinItems.length > 0 ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      Total de pines: {pinItems.length}
                    </p>
                  ) : null}
                </div>

                {pinItems.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleCopyAllPins}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                    {copiedAll ? (
                      <>
                        <Check className="h-4 w-4" />
                        Todos copiados
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar todos
                      </>
                    )}
                  </button>
                ) : null}
              </div>

              {pinItems.length > 0 ? (
                <div className="space-y-3">
                  {pinItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border bg-background p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">
                            PIN #{index + 1}
                          </p>

                          <p className="font-mono text-base md:text-lg font-bold text-foreground break-all">
                            {item.pin}
                          </p>

                          {item.transactionId ? (
                            <p className="text-xs text-muted-foreground mt-2 break-all">
                              Transacción: {item.transactionId}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyPin(item.pin)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                            {copiedPin === item.pin ? (
                              <>
                                <Check className="h-4 w-4" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copiar
                              </>
                            )}
                          </button>

                          {item.redirectLink ? (
                            <a
                              href={item.redirectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                              <ExternalLink className="h-4 w-4" />
                              Abrir enlace
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                  No se encontraron pines en la respuesta del proveedor.
                </div>
              )}
            </div>

            <div className="mt-8 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              Importante: después del canje del producto digital no se puede
              cancelar esta compra ni solicitar reembolso, salvo que el producto
              no pueda entregarse por causas atribuibles al proveedor.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InvoicePage;