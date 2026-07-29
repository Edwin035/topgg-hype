import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/CatalogSkeleton";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCatalogSections } from "@/hooks/providers/useCatalogSections";
import { Product } from "@/hooks/providers/useProduct";

const platforms = ["Todos", "PlayStation", "Xbox", "Steam", "Mobile"];

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPlatform = searchParams.get("platform") || "Todos";

  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Hook para traer el catálogo completo
  const { data: catalogData, loading, error } = useCatalogSections();
  const navigate = useNavigate();
  function normalizeText(value?: string | null) {
    return (value ?? "").trim();
  }

  function buildProduct(product: any, collection: any) {
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
        typeof product.originalPrice === "number"
          ? product.originalPrice
          : null,
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

  const allProducts = useMemo(() => {
    if (!catalogData) return [];

    return catalogData.flatMap((collection: any) =>
      collection.products.map((product: any) =>
        buildProduct(product, collection),
      ),
    );
  }, [catalogData]);

  // Filtro por categoría propia (viene del banner: /catalogo?categoria=:id).
  const categoriaId = searchParams.get("categoria")
    ? Number(searchParams.get("categoria"))
    : null;
  // El nombre de la categoría = nombre de su sección en el árbol (id = base + catId).
  const OWN_SECTION_ID_BASE = 900_000_000;
  const categoriaName =
    categoriaId != null
      ? catalogData?.find((c) => c.id === OWN_SECTION_ID_BASE + categoriaId)
          ?.name
      : undefined;

  const clearCategoria = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("categoria");
    setSearchParams(next);
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (categoriaId == null || product.categoryId === categoriaId),
    );
  }, [allProducts, searchQuery, categoriaId]);

  const clearFilters = () => {
    setSelectedPlatform("Todos");
    setSearchQuery("");
    setSearchParams({});
  };
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
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          <Button
            variant="outline"
            className="md:hidden"
            onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        <main>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <p className="text-sm text-muted-foreground">
              Mostrando{" "}
              <span className="text-foreground font-medium">
                {filteredProducts.length}
              </span>{" "}
              productos
            </p>
            {categoriaId != null ? (
              <button
                type="button"
                onClick={clearCategoria}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                {categoriaName ? `Categoría: ${categoriaName}` : "Categoría"}
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
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
