import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/CatalogSkeleton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCatalogSections } from "@/hooks/providers/useCatalogSections";
import { Product } from "@/hooks/providers/useProduct";
import type {
  ProviderCollection,
  ProviderProduct,
} from "@/lib/providers/endpoints/catalog";

// Las secciones de productos propios tienen id = BASE + categoryId (ver backend,
// StorefrontModule). Se usa para derivar el id real de categoría desde la sección.
const OWN_SECTION_ID_BASE = 900_000_000;

const pillClass = (active: boolean) =>
  `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
  }`;

function normalizeText(value?: string | null) {
  return (value ?? "").trim();
}

function buildProduct(product: ProviderProduct, collection: ProviderCollection) {
  const nameLower = product.name.toLowerCase();

  return {
    id: product.id,
    providerProductId: product.id,
    name: product.name,
    image:
      product.coverImage ||
      product.image ||
      collection.coverImage ||
      collection.image ||
      "/placeholder.svg",
    price: Number(product.salesPrice ?? 0),
    originalPrice:
      typeof product.originalPrice === "number" ? product.originalPrice : null,
    currencySymbol: product.salesCurrencySymbol || "$",
    description:
      normalizeText(product.description) ||
      normalizeText(collection.description) ||
      `Recarga oficial de ${collection.name}.`,
    platform: "Mobile",
    isAvailable: product.isAvailable !== false,
    countryCode: product.countryCode,
    salesCurrencyCode: product.salesCurrencyCode,
    stock: product.stock, // propios: 0 = bajo pedido
    categoryId: product.categoryId, // propios: para filtrar por categoría
    bonusLabel:
      nameLower.includes("bonus") ||
      nameLower.includes("bono") ||
      nameLower.includes("bônus")
        ? "+ bonus"
        : undefined,
    termsAndConditions: normalizeText(product.termsAndConditions),
    howToRedeem: product.howToRedeem,
    adultsOnly: product.adultsOnly,
    tags: product.tags ?? [],
    partnerCostPrice: product.partnerCostPrice,
    partnerCostPercent: product.partnerCostPercent,
    discountPercent: product.discountPercent ?? null,
  };
}

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Hook para traer el catálogo completo
  const { data: catalogData, loading, error } = useCatalogSections();
  const navigate = useNavigate();

  const allProducts = useMemo(
    () =>
      catalogData.flatMap((collection) =>
        collection.products.map((product) => buildProduct(product, collection)),
      ),
    [catalogData],
  );

  // Categorías (productos propios) para el filtro. Cada sección propia es una
  // categoría; su id real = section.id - BASE. Se preserva el orden del catálogo.
  const categories = useMemo(
    () =>
      catalogData
        .filter(
          (c) => c.id >= OWN_SECTION_ID_BASE && (c.products?.length ?? 0) > 0,
        )
        .map((c) => ({ id: c.id - OWN_SECTION_ID_BASE, name: c.name })),
    [catalogData],
  );

  // Categoría seleccionada. También la fijan los banners: /catalogo?categoria=:id.
  const categoriaId = searchParams.get("categoria")
    ? Number(searchParams.get("categoria"))
    : null;

  const setCategoria = (catId: number | null) => {
    const next = new URLSearchParams(searchParams);
    if (catId == null) next.delete("categoria");
    else next.set("categoria", String(catId));
    setSearchParams(next);
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (categoriaId == null || product.categoryId === categoriaId),
    );
  }, [allProducts, searchQuery, categoriaId]);

  function handleBuy(product: Product) {
    navigate(`/producto/${product.id}`, {
      state: { product },
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Catá<span className="gradient-text">logo</span>
          </h1>
          <p className="text-muted-foreground">
            {loading
              ? "Cargando productos..."
              : `Explora nuestra colección de ${allProducts.length} productos digitales`}
          </p>
          {error && (
            <p className="text-red-500 mt-2">
              Error al cargar el catálogo.{" "}
              <Button variant="link" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Buscador */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Filtro por categoría */}
        {!loading && categories.length > 0 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setCategoria(null)}
              className={pillClass(categoriaId == null)}>
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoria(c.id)}
                className={pillClass(categoriaId === c.id)}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        <main>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <p className="text-sm text-muted-foreground">
              Mostrando{" "}
              <span className="text-foreground font-medium">
                {filteredProducts.length}
              </span>{" "}
              productos
            </p>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <div className="text-center py-16 text-red-500">{error}</div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onBuy={handleBuy}
                  buying={null}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No se encontraron productos
              </h3>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CatalogPage;
