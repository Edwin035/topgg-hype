import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/Auth/AuthProvider";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Product } from "@/components/ProductCard";
import {
  getProductForDisplay,
  type ProviderProduct,
} from "@/lib/providers/endpoints/catalog";
import { useAuthDialog } from "@/contexts/AuthContext";

type ProductPageState = {
  product?: Product;
  quantity?: number;
};

const MIN_QUANTITY = 1;
const MAX_FRONT_QUANTITY = 5;

function normalizeQuantity(value: number) {
  if (!Number.isFinite(value)) return MIN_QUANTITY;
  return Math.min(MAX_FRONT_QUANTITY, Math.max(MIN_QUANTITY, Math.floor(value)));
}

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline">
          {part}
        </a>
      );
    }

    return part;
  });
}

function buildProductFromApi(apiProduct: ProviderProduct): Product {
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

function formatPrice(price: number, symbol = "$") {
  return `${symbol}${price.toFixed(2)}`;
}

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { openLogin } = useAuthDialog();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as ProductPageState | null;
  const stateProduct = state?.product;

  const [product, setProduct] = useState<Product | null>(stateProduct ?? null);
  const [loading, setLoading] = useState(!stateProduct);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(() =>
    normalizeQuantity(state?.quantity ?? 1),
  );

  useEffect(() => {
    if (stateProduct) {
      setProduct(stateProduct);
      setLoading(false);
      setError(null);
      return;
    }

    if (!id) {
      setProduct(null);
      setLoading(false);
      setError("Producto inválido");
      return;
    }

    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const apiProduct = await getProductForDisplay(
          Number(id),
          controller.signal,
        );

        if (!apiProduct) {
          setError("Producto no encontrado en el catálogo");
          return;
        }

        setProduct(buildProductFromApi(apiProduct));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el producto",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    run();

    return () => controller.abort();
  }, [id, stateProduct]);

  const handleQuantityChange = (nextQuantity: number) => {
    setQuantity(normalizeQuantity(nextQuantity));
  };

  const handleBuy = () => {
    if (!product) return;

    if (!user) {
      openLogin("login");
      return;
    }

    navigate(`/checkout/${product.id}`, {
      state: {
        product,
        quantity,
      },
    });
  };

  const showDiscount =
    typeof product?.originalPrice === "number" &&
    product.originalPrice > product.price;

  const totalPreview = product ? product.price * quantity : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Cargando producto...
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" />
          <span>Volver a productos</span>
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {product.name}
        </h1>

        <div className="flex items-center gap-3 mb-8">
          {typeof product.discountPercent === "number" &&
          product.discountPercent > 0 ? (
            <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded">
              -{product.discountPercent}%
            </span>
          ) : null}

          <div className="flex flex-col">
            {showDiscount ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(
                  product.originalPrice!,
                  product.currencySymbol || "$",
                )}
              </span>
            ) : null}

            <span className="text-2xl md:text-3xl font-bold text-neon-green">
              {formatPrice(product.price, product.currencySymbol || "$")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="aspect-video rounded-xl overflow-hidden border border-border bg-muted">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {product.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Información del producto
                </h2>

                <div className="text-muted-foreground space-y-4">
                  {product.description?.trim() && (
                    <p>{product.description.trim()}</p>
                  )}

                  <div className="mt-4 text-foreground mb-2">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.howToRedeem,
                      }}
                    />
                  </div>

                  {product.termsAndConditions?.trim() && (
                    <div className="mt-4">
                      <h3 className="font-bold text-foreground mb-2">
                        Términos y Condiciones
                      </h3>
                      <p>{product.termsAndConditions.trim()}</p>
                    </div>
                  )}

                  {!product.description &&
                    !product.howToRedeem &&
                    !product.termsAndConditions && (
                      <p>Recarga oficial disponible para este producto.</p>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-gaming p-6 sticky top-24">
              <div className="aspect-video rounded-lg overflow-hidden border border-border mb-6 bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-3 mb-4">
                {typeof product.discountPercent === "number" &&
                product.discountPercent > 0 ? (
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded">
                    -{product.discountPercent}%
                  </span>
                ) : null}

                <div className="flex flex-col">
                  {showDiscount ? (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(
                        product.originalPrice!,
                        product.currencySymbol || "$",
                      )}
                    </span>
                  ) : null}

                  <span className="text-2xl font-bold text-neon-green">
                    {formatPrice(product.price, product.currencySymbol || "$")}
                  </span>
                </div>
              </div>

              <div className="mb-5 rounded-xl border border-border bg-muted/40 p-4">
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
                      disabled={quantity <= MIN_QUANTITY}
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
                      className="h-10 w-14 bg-transparent text-center font-bold text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= MAX_FRONT_QUANTITY}
                      className="h-10 w-10 inline-flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total estimado</span>
                  <span className="font-bold text-neon-green">
                    {formatPrice(totalPreview, product.currencySymbol || "$")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBuy}
                disabled={!product.isAvailable}
                className="w-full btn-gaming text-center py-3 text-lg mb-6 disabled:opacity-50 disabled:pointer-events-none">
                {product.isAvailable ? "COMPRAR" : "NO DISPONIBLE"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;