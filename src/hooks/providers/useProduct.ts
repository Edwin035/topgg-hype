export type Product = {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number | null;
  currencySymbol?: string;
  description?: string;
  platform: 'PlayStation' | 'Xbox' | 'Steam' | 'Mobile';
  isAvailable?: boolean;
  providerProductId?: number;
  countryCode?: string;
  salesCurrencyCode?: string;
  bonusLabel?: string;
};

export const allProducts: Product[] = [
  {
    id: 900001,
    name: 'PlayStation Gift Card',
    image:
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1200&auto=format&fit=crop',
    price: 25,
    currencySymbol: '$',
    description: 'Tarjetas y recargas para PlayStation.',
    platform: 'PlayStation',
    isAvailable: true,
  },
  {
    id: 900002,
    name: 'Xbox Gift Card',
    image:
      'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=1200&auto=format&fit=crop',
    price: 20,
    currencySymbol: '$',
    description: 'Tarjetas y recargas para Xbox.',
    platform: 'Xbox',
    isAvailable: true,
  },
  {
    id: 900003,
    name: 'Steam Wallet',
    image:
      'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=1200&auto=format&fit=crop',
    price: 10,
    currencySymbol: '$',
    description: 'Saldo y productos para Steam.',
    platform: 'Steam',
    isAvailable: true,
  },
];

export const sampleProducts = {
  playstation: allProducts.filter((p) => p.platform === 'PlayStation'),
  xbox: allProducts.filter((p) => p.platform === 'Xbox'),
  steam: allProducts.filter((p) => p.platform === 'Steam'),
  mobile: allProducts.filter((p) => p.platform === 'Mobile'),
};