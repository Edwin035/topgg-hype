import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductSection from "@/components/ProductSection";
import PromoBanner from "@/components/PromoBanner";
import PartnerBanner from "@/components/PartnerBanner";
import FAQSection from "@/components/FAQSection";
import FeaturesBar from "@/components/FeaturesBar";
import Footer from "@/components/Footer";
import { useCatalogSections } from "@/hooks/providers/useCatalogSections";
import type { Product } from "@/components/ProductCard";
import type {
  ProviderCollection,
  ProviderProduct,
} from "@/lib/providers/endpoints/catalog";

type HomeSection = {
  id: number;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  products: Product[];
  banner: {
    title: string;
    subtitle: string;
    discount: string;
    image: string;
  } | null;
};

function splitTitle(title: string) {
  const clean = title.trim();
  const words = clean.split(/\s+/);

  if (words.length <= 1) {
    return { title: clean, titleAccent: undefined };
  }

  return {
    title: words.slice(0, -1).join(" "),
    titleAccent: words[words.length - 1],
  };
}

function normalizeText(value?: string | null) {
  return (value ?? "").trim();
}

function buildProduct(
  product: ProviderProduct,
  collection: ProviderCollection,
): Product {
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

function buildSectionSubtitle(collection: ProviderCollection) {
  if (normalizeText(collection.description))
    return normalizeText(collection.description);

  const hasBonus = collection.products.some((product) => {
    const name = product.name.toLowerCase();
    return (
      name.includes("bonus") || name.includes("bono") || name.includes("bônus")
    );
  });

  return hasBonus ? "Recargas con bonus disponibles" : "Recargas disponibles";
}

function buildBanner(collection: ProviderCollection) {
  const image =
    collection.coverImage ||
    collection.image ||
    collection.products.find((p) => p.coverImage)?.coverImage ||
    collection.products.find((p) => p.image)?.image ||
    "/placeholder.svg";

  const availableDiscounts = collection.products
    .map((p) => Number(p.discountPercent ?? 0))
    .filter((n) => Number.isFinite(n) && n > 0);

  const hasBonus = collection.products.some((product) => {
    const name = product.name.toLowerCase();
    return (
      name.includes("bonus") || name.includes("bono") || name.includes("bônus")
    );
  });

  return {
    title: collection.name.toUpperCase(),
    subtitle:
      collection.howToRedeem ||
      normalizeText(collection.description) ||
      `Explora las mejores recargas de ${collection.name}.`,
    discount:
      availableDiscounts.length > 0
        ? `${Math.max(...availableDiscounts)}% OFF`
        : hasBonus
          ? "BONUS"
          : "TOP UP",
    image,
  };
}

const Index = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useCatalogSections();

  const sections: HomeSection[] = useMemo(() => {
    return data.map((collection) => {
      const { title, titleAccent } = splitTitle(collection.name);

      return {
        id: collection.id,
        title,
        titleAccent,
        subtitle: buildSectionSubtitle(collection),
        products: collection.products.map((product) =>
          buildProduct(product, collection),
        ),
        banner: buildBanner(collection),
      };
    });
  }, [data]);

  function handleBuy(product: Product) {
    navigate(`/producto/${product.id}`, {
      state: { product },
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesBar />

      {loading ? (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="py-10 text-center text-muted-foreground">
              Cargando catálogo...
            </div>
          </div>
        </section>
      ) : error ? (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="py-10 text-center text-destructive">{error}</div>
          </div>
        </section>
      ) : sections.length === 0 ? (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="py-10 text-center text-muted-foreground">
              No hay colecciones disponibles en este momento.
            </div>
          </div>
        </section>
      ) : (
        sections.map((section, index) => (
          <div key={section.id}>
            <ProductSection
              title={section.title}
              titleAccent={section.titleAccent}
              subtitle={section.subtitle}
              products={section.products}
              loading={false}
              error={null}
              onBuy={handleBuy}
              buyingProductId={null}
            />

            {index < sections.length - 1 && section.banner ? (
              <section className="py-8">
                <div className="container mx-auto px-4">
                  <PromoBanner
                    title={section.banner.title}
                    subtitle={section.banner.subtitle}
                    discount={section.banner.discount}
                    image={section.banner.image}
                  />
                </div>
              </section>
            ) : null}
          </div>
        ))
      )}

      <PartnerBanner />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
