// src/components/ProductSection.tsx
import { Link } from 'react-router-dom';
import ProductCard, { type Product } from './ProductCard';
import { ChevronRight } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  titleAccent?: string;
  subtitle?: string;
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onBuy?: (product: Product) => void;
  buyingProductId?: number | null;
}

const ProductSection = ({
  title,
  titleAccent,
  subtitle,
  products,
  loading = false,
  error = null,
  onBuy,
  buyingProductId,
}: ProductSectionProps) => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="section-title text-foreground">
              {title} {titleAccent && <span className="gradient-text">{titleAccent}</span>}
            </h2>
            {subtitle ? <p className="mt-1 text-muted-foreground">{subtitle}</p> : null}
          </div>

          <Link
            to="/catalogo"
            className="hidden items-center gap-2 text-primary transition-colors hover:text-secondary md:flex"
          >
            <span className="text-sm font-medium">Ver todo</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center text-muted-foreground">Cargando productos...</div>
        ) : error ? (
          <div className="py-10 text-center text-destructive">{error}</div>
        ) : products.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            No hay productos disponibles en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onBuy={onBuy}
                buying={buyingProductId === (product.providerProductId ?? product.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-6 text-center md:hidden">
          <Link
            to="/catalogo"
            className="text-sm font-medium text-primary transition-colors hover:text-secondary"
          >
            Ver todos los productos →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;