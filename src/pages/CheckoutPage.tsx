import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Lock,
  CreditCard,
  Loader2,
  TriangleAlert,
  Minus,
  Plus,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/Auth/AuthProvider";
import type { Product } from "@/components/ProductCard";
import { getProduct } from "@/lib/providers/endpoints/catalog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { checkout } from "@/lib/api/checkout";

type CheckoutPageState = {
  product?: Product;
  quantity?: number;
};

const MIN_QUANTITY = 1;
const MAX_FRONT_QUANTITY = 5;

function normalizeQuantity(value: number) {
  if (!Number.isFinite(value)) return MIN_QUANTITY;
  return Math.min(MAX_FRONT_QUANTITY, Math.max(MIN_QUANTITY, Math.floor(value)));
}

function buildProductFromApi(
  apiProduct: Awaited<ReturnType<typeof getProduct>>,
): Product {
  const nameLower = apiProduct.name.toLowerCase();

  return {
    id: apiProduct.id,
    providerProductId: apiProduct.id,
    name: apiProduct.name,
    image: apiProduct.coverImage || apiProduct.image || "/placeholder.svg",
    price: Number(apiProduct.salesPrice ?? 0),
    originalPrice:
      typeof apiProduct.originalPrice === "number"
        ? apiProduct.originalPrice
        : null,
    currencySymbol: apiProduct.salesCurrencySymbol || "$",
    description:
      (apiProduct.description ?? "").trim() ||
      "Recarga oficial disponible para este producto.",
    platform: "Mobile",
    isAvailable: apiProduct.isAvailable !== false,
    countryCode: apiProduct.countryCode,
    salesCurrencyCode: apiProduct.salesCurrencyCode,
    bonusLabel:
      nameLower.includes("bonus") ||
      nameLower.includes("bono") ||
      nameLower.includes("bônus")
        ? "+ bonus"
        : undefined,
    termsAndConditions: (apiProduct.termsAndConditions ?? "").trim(),
    howToRedeem: apiProduct.howToRedeem,
    adultsOnly: apiProduct.adultsOnly,
    tags: apiProduct.tags ?? [],
    partnerCostPrice: apiProduct.partnerCostPrice,
    partnerCostPercent: apiProduct.partnerCostPercent,
    discountPercent: apiProduct.discountPercent ?? null,
  };
}

const CheckoutPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const state = location.state as CheckoutPageState | null;
  const stateProduct = state?.product;

  const [selectedMethod, setSelectedMethod] = useState<string>("pin-hype");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [payInfo, setPayInfo] = useState<{
    amountUsdt: number;
    usdtCopRate: number;
    checkoutUrl: string;
  } | null>(null);
  const [product, setProduct] = useState<Product | null>(stateProduct ?? null);
  const [loadingProduct, setLoadingProduct] = useState(!stateProduct);
  const [error, setError] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [quantity, setQuantity] = useState(() =>
    normalizeQuantity(state?.quantity ?? 1),
  );

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (stateProduct) {
      setProduct(stateProduct);
      setLoadingProduct(false);
      setError(null);
      return;
    }

    if (!id) {
      setLoadingProduct(false);
      setError("Producto inválido");
      return;
    }

    const controller = new AbortController();

    async function run() {
      try {
        setLoadingProduct(true);
        setError(null);

        const apiProduct = await getProduct(Number(id), controller.signal);
        setProduct(buildProductFromApi(apiProduct));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el producto",
        );
      } finally {
        if (!controller.signal.aborted) setLoadingProduct(false);
      }
    }

    run();

    return () => controller.abort();
  }, [id, stateProduct]);

  const handleQuantityChange = (nextQuantity: number) => {
    setQuantity(normalizeQuantity(nextQuantity));
  };

  if (!user) {
    return null;
  }

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Cargando checkout...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Producto no encontrado
          </h1>
          <p className="mt-3 text-muted-foreground">
            {error ?? "No existe este producto."}
          </p>
          <Link
            to="/"
            className="text-primary hover:underline mt-4 inline-block">
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = product.price * quantity;
  const commission = 0;
  const total = subtotal + commission;

  const handleConfirmPayment = async () => {
    if (!product.providerProductId) {
      setError("El producto no tiene providerProductId");
      return;
    }

    let timer: number | undefined;

    try {
      setIsProcessing(true);
      setProgress(20);
      setError(null);

      timer = window.setInterval(() => {
        setProgress((prev) => (prev >= 85 ? prev : prev + 10));
      }, 250);

      // Crea la venta PENDIENTE + la orden de Binance Pay. NO canja todavía: el
      // pin se entrega solo tras el pago verificado por webhook.
      const res = await checkout({
        productId: product.providerProductId,
        quantity,
        countryCode: product.countryCode || "CO",
        currencyCode: product.salesCurrencyCode || "COP",
      });

      if (timer) {
        window.clearInterval(timer);
      }

      setProgress(100);

      // Guardar el saleId para que la página de retorno haga polling del estado.
      localStorage.setItem(
        "tg_pending_binance_sale",
        JSON.stringify({ saleId: res.sale.id, productId: product.id }),
      );

      // Mostrar la aclaración de cobro en USDT antes de redirigir a Binance.
      setPayInfo({
        amountUsdt: res.amountUsdt,
        usdtCopRate: res.usdtCopRate,
        checkoutUrl: res.checkoutUrl,
      });
    } catch (err) {
      if (timer) {
        window.clearInterval(timer);
      }

      setError(
        err instanceof Error ? err.message : "No se pudo iniciar el pago",
      );
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Link
          to={`/producto/${product.id}`}
          state={{ product, quantity }}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" />
          <span>Volver al producto</span>
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          Completa tu pago
        </h1>

        <p className="text-muted-foreground mb-8">
          Método: PIN Hype · Cantidad: {quantity} · Pago: Binance · Total:{" "}
          <span className="font-semibold text-foreground">
            {product.currencySymbol || "$"}
            {total.toFixed(2)}
          </span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-xl overflow-hidden border border-border">
              <div className="bg-primary px-6 py-3">
                <h2 className="text-primary-foreground font-bold text-lg">
                  Método de Pago
                </h2>
              </div>

              <div className="p-6 space-y-3">
                <button
                  onClick={() => setSelectedMethod("pin-hype")}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors text-left ${
                    selectedMethod === "pin-hype"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}>
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-primary-foreground" />
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">Binance</p>
                    <p className="text-sm text-muted-foreground">
                      Se ejecutará el pre-redeem del producto seleccionado
                    </p>
                  </div>
                </button>

                {error ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-gaming p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Resumen de Compra
              </h2>

              <div className="space-y-4">
                <div className="pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">Producto</p>
                  <p className="font-semibold text-foreground">
                    {product.name}
                  </p>
                </div>

                <div className="pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">Plataforma</p>
                  <p className="font-semibold text-foreground">
                    {product.platform || "Mobile"}
                  </p>
                </div>

                <div className="pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">
                    Método de pago
                  </p>
                  <p className="font-semibold text-foreground">Binance</p>
                </div>

                <div className="pb-4 border-b border-border">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Cantidad</p>
                      <p className="text-xs text-muted-foreground">
                        Máximo {MAX_FRONT_QUANTITY} pines por compra
                      </p>
                    </div>

                    <div className="flex items-center rounded-lg border border-border overflow-hidden bg-background">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= MIN_QUANTITY || isProcessing}
                        className="h-10 w-10 inline-flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none">
                        <Minus className="h-4 w-4" />
                      </button>

                      <input
                        type="number"
                        min={MIN_QUANTITY}
                        max={MAX_FRONT_QUANTITY}
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(Number(e.target.value))
                        }
                        disabled={isProcessing}
                        className="h-10 w-14 bg-transparent text-center font-bold text-foreground outline-none disabled:opacity-60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= MAX_FRONT_QUANTITY || isProcessing}
                        className="h-10 w-10 inline-flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">Precio unitario</p>
                  <p className="text-lg font-bold text-foreground">
                    {product.currencySymbol || "$"}
                    {product.price.toFixed(2)}
                  </p>
                </div>

                <div className="pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">SubTotal</p>
                  <p className="text-lg font-bold text-foreground">
                    {product.currencySymbol || "$"}
                    {subtotal.toFixed(2)}
                  </p>
                </div>

                <div className="pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-neon-green">
                    {product.currencySymbol || "$"}
                    {total.toFixed(2)}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  Al presionar{" "}
                  <span className="font-semibold text-foreground">
                    Confirmar Pago
                  </span>
                  , se creará tu orden y te llevaremos a Binance Pay. El cobro es
                  en USDT a la tasa vigente; verás el monto exacto antes de pagar.
                </div>

                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  <TriangleAlert className="h-4 w-4 inline-block mr-2 text-red-400" />
                  <span className="font-semibold text-foreground text-red-400">
                    Importante: Después del canje del producto digital no se
                    puede cancelar esta compra
                  </span>
                  , ni solicitar reembolso, a menos que el producto no se pueda
                  entregar por causas atribuibles al proveedor.
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>
                    Proceso seguro. La clave/PIN se mostrará en la factura.
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-muted-foreground">
                    He leído y acepto los{" "}
                    <button
                      type="button"
                      onClick={() => setIsTermsOpen(true)}
                      className="text-primary underline">
                      Términos y Condiciones
                    </button>
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (!acceptedTerms) {
                      setIsTermsOpen(true);
                      return;
                    }
                    handleConfirmPayment();
                  }}
                  disabled={isProcessing}
                  className="w-full btn-gaming text-center py-3 text-lg disabled:opacity-50 disabled:pointer-events-none">
                  {isProcessing
                    ? "Procesando..."
                    : `Confirmar Pago (${quantity})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog
        open={isProcessing}
        onOpenChange={(open) => {
          // Solo se puede cerrar una vez creada la orden (para cancelar el pago).
          if (!open && payInfo) {
            setIsProcessing(false);
            setPayInfo(null);
            setProgress(0);
          }
        }}>
        <DialogContent
          className="sm:max-w-md text-center"
          onPointerDownOutside={(e) => {
            if (!payInfo) e.preventDefault();
          }}>
          <DialogTitle className="sr-only">
            {payInfo ? "Ir a pagar en Binance" : "Creando orden de pago"}
          </DialogTitle>

          {!payInfo ? (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">
                  Creando tu orden de pago
                </h3>
                <p className="text-sm text-muted-foreground">
                  Estamos preparando tu pago de {quantity} producto
                  {quantity > 1 ? "s" : ""} con Binance Pay...
                </p>
              </div>

              <div className="w-full">
                <Progress value={Math.min(progress, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.min(Math.round(progress), 100)}% completado
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  Pago con Binance Pay
                </h3>
                <p className="text-sm text-muted-foreground">
                  Se te cobrará{" "}
                  <span className="font-bold text-foreground">
                    {payInfo.amountUsdt} USDT
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  El cobro es en USDT. Tasa aplicada: 1 USDT ={" "}
                  {payInfo.usdtCopRate.toLocaleString("es-CO")} COP.
                </p>
              </div>

              <a
                href={payInfo.checkoutUrl}
                className="w-full btn-gaming text-center py-3 text-base">
                Ir a pagar en Binance
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsProcessing(false);
                  setPayInfo(null);
                  setProgress(0);
                }}
                className="text-sm text-muted-foreground hover:text-foreground">
                Cancelar
              </button>

              <p className="text-xs text-muted-foreground">
                Serás redirigido a Binance Pay. Tu pin se entrega automáticamente
                al confirmarse el pago.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogTitle className="text-lg font-bold">
            Términos y Condiciones
          </DialogTitle>

          <div className="mt-4 overflow-y-auto text-sm text-muted-foreground space-y-4 pr-2">
            {product.termsAndConditions ? (
              <p>{product.termsAndConditions}</p>
            ) : (
              <p>No hay términos disponibles para este producto.</p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span className="text-sm">Acepto los términos</span>
            </div>

            <button
              onClick={() => setIsTermsOpen(false)}
              disabled={!acceptedTerms}
              className="btn-gaming px-4 py-2 disabled:opacity-50">
              Continuar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CheckoutPage;