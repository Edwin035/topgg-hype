import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/utils';

export type Product = {
  id: number;
  providerProductId?: number;
  name: string;
  image?: string | null;
  price: number;
  originalPrice?: number | null;
  currencySymbol?: string;
  description?: string;
  isAvailable?: boolean;
  bonusLabel?: string;
  platform?: 'PlayStation' | 'Xbox' | 'Steam' | 'Mobile';
  countryCode?: string;
  salesCurrencyCode?: string;
  termsAndConditions?: string;
  howToRedeem?: string;
  adultsOnly?: boolean;
  tags?: string[];
  partnerCostPrice?: number;
  partnerCostPercent?: number;
  discountPercent?: number | null;
  /** Producto propio: 0 = venta bajo pedido (entrega tras el pago). */
  stock?: number;
  /** Producto propio: id de su categoría (para filtrar el catálogo). */
  categoryId?: number;
};

type ProductCardProps = Product & {
  onBuy?: (product: Product) => void;
  buying?: boolean;
};

function formatPrice(price: number, symbol = '$') {
  return `${symbol}${formatMoney(price)}`;
}

const ProductCard = ({
  onBuy,
  buying = false,
  ...product
}: ProductCardProps) => {
  const {
    name,
    image,
    price,
    originalPrice,
    currencySymbol = '$',
    description,
    isAvailable = true,
    bonusLabel,
    stock,
  } = product;

  // Producto propio sin códigos libres: se vende bajo pedido (entrega tras pago).
  const bajoPedido = stock === 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={image || '/placeholder.svg'}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground md:text-base">
            {name}
          </h3>

          {description ? (
            <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">
              {description}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {bonusLabel ? (
              <Badge variant="secondary">{bonusLabel}</Badge>
            ) : null}
            {bajoPedido ? (
              <Badge className="bg-amber-500/90 text-white hover:bg-amber-500/90">
                Bajo pedido
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(price, currencySymbol)}
          </span>

          {typeof originalPrice === 'number' && originalPrice > price ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice, currencySymbol)}
            </span>
          ) : null}
        </div>

        <Button
          className="w-full"
          disabled={!isAvailable || buying}
          onClick={() => onBuy?.(product)}
        >
          {buying ? 'Procesando...' : isAvailable ? 'Comprar ahora' : 'No disponible'}
        </Button>

        {bajoPedido ? (
          <p className="text-center text-[11px] text-muted-foreground">
            Bajo pedido · se entrega tras confirmar el pago
          </p>
        ) : null}
      </div>
    </article>
  );
};

export default ProductCard;