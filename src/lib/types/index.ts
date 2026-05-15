/* ========== Tipos compartidos ========== */

export type MeResponse = {
  id: string;
  username: string;
  email: string | null;
  phone?: string | null;
  birthDate?: string | null;
  hasGoogleIdentity?: boolean;
};

export type PublicCatalogSubproduct = {
  id: string;
  name: string;
  packageImageUrl: string | null;
  price: number;
  discountPct: number;
  finalPrice: number;
  available: boolean;
};

export type PublicCatalogProduct = {
  createdAt: any;
  maxDiscountPct: number;
  id: string;
  title: string | null;
  category: string | null;
  logoUrl: string | null;
  hot: boolean;
  coverUrl: string | null;
  subproducts: PublicCatalogSubproduct[];
};

export type ExchangeRate = {
  currencyCode: string;
  value: number;
  updatedAt?: string;
};

export type StartWompiSessionPayload = {
  tenantSlug: string;
  subproductId: string;
  productId?: string;
  currencyCode: "COP";
  message?: string;
  customerEmail?: string;
  customerFullName?: string;
  expirationTime?: number; // opcional (timestamp ms)
};

/* Venta logeado (única parte privada en este front) */
export type PaymentPortal = "binance" | "banco_colombia";
export type CreateSalePayload = {
  tenantSlug: string; // lo guardamos para coherencia en el front; el back toma tenant del JWT
  subproductId: string;
  productId?: string;
  currencyCode: string;
  paymentPortal: PaymentPortal;
  message?: string;
};
export type CreatedSale = {
  id: string;
  saleNumber?: number | null;
  status: "COMPLETADO" | "EN_PROCESO" | "PENDIENTE" | "DEVUELTO" | "CANCELADA";
  currencyCode: string;
  finalUsdCents: number;
  finalInCurrency: number;
  paymentPortal: string;
  createdAt: string;
  product: { id: string; title: string; logoUrl?: string | null };
  subproduct: { id: string; name: string; packageImageUrl?: string | null };
};

/* Banners */
export type PublicBanner = {
  id: string;
  title?: string | null;
  imageUrl: string;
  href?: string | null;
  order?: number | null;
};
