import xboxImg from '@/assets/xbox.jpg';
import steamImg from '@/assets/steam.jpg';
import characterImg from '@/assets/game-character.jpg';

export interface Product {
  id: number;
  image: string;
  title: string;
  platform: string;
  originalPrice: number;
  discountPrice: number;
  discount?: number;
  description?: string;
  tags?: string[];
  distributor?: string;
  activation?: string;
}

export const allProducts: Product[] = [
  // PlayStation
  { id: 1, image: 'https://img.hype.games/cdn/019e4dbb-3656-449e-95b5-7a75fd38467bTRMX25-250.jpg', title: 'PlayStation Plus Essential 1 Mes', platform: 'PlayStation', originalPrice: 10, discountPrice: 8.50, discount: 15, description: 'Accede a juegos online, descuentos exclusivos y juegos gratis mensuales con PlayStation Plus Essential.', tags: ['Suscripción', 'Online', 'Multijugador'], distributor: 'Sony', activation: 'PlayStation Store' },
  { id: 3, image: 'https://img.hype.games/cdn/019e4dbb-3656-449e-95b5-7a75fd38467bTRMX25-250.jpg', title: 'PlayStation Plus Extra 3 Meses', platform: 'PlayStation', originalPrice: 25, discountPrice: 21, description: 'Disfruta de un catálogo de cientos de juegos descargables además de todos los beneficios de Essential.', tags: ['Suscripción', 'Catálogo', 'Juegos'], distributor: 'Sony', activation: 'PlayStation Store' },
  { id: 5, image: 'https://img.hype.games/cdn/019e4dbb-3656-449e-95b5-7a75fd38467bTRMX25-250.jpg', title: 'PlayStation Plus Premium Anual', platform: 'PlayStation', originalPrice: 159, discountPrice: 135, discount: 15, description: 'La experiencia completa con streaming de juegos, catálogo clásico y todas las ventajas de PlayStation Plus.', tags: ['Suscripción', 'Premium', 'Streaming', 'Clásicos'], distributor: 'Sony', activation: 'PlayStation Store' },
  { id: 5, image: 'https://img.hype.games/cdn/019e4dbb-3656-449e-95b5-7a75fd38467bTRMX25-250.jpg', title: 'PlayStation Plus Premium Anual', platform: 'PlayStation', originalPrice: 159, discountPrice: 135, discount: 15, description: 'La experiencia completa con streaming de juegos, catálogo clásico y todas las ventajas de PlayStation Plus.', tags: ['Suscripción', 'Premium', 'Streaming', 'Clásicos'], distributor: 'Sony', activation: 'PlayStation Store' },
  { id: 5, image: 'https://img.hype.games/cdn/019e4dbb-3656-449e-95b5-7a75fd38467bTRMX25-250.jpg', title: 'PlayStation Plus Premium Anual', platform: 'PlayStation', originalPrice: 159, discountPrice: 135, discount: 15, description: 'La experiencia completa con streaming de juegos, catálogo clásico y todas las ventajas de PlayStation Plus.', tags: ['Suscripción', 'Premium', 'Streaming', 'Clásicos'], distributor: 'Sony', activation: 'PlayStation Store' },
  

  // Mobile
  { id: 16, image: 'https://img.hype.games/cdn/ff60ee73-eee3-44e6-99a2-9703c370b594freefirecover100.png', title: 'Free Fire 520 Diamantes', platform: 'Mobile', originalPrice: 9, discountPrice: 7.65, discount: 15, description: 'Recarga diamantes directamente a tu cuenta de Free Fire para comprar skins y pases.', tags: ['Diamantes', 'Recarga', 'Battle Royale'], distributor: 'Garena', activation: 'Free Fire ID' },
  { id: 17, image: 'https://img.hype.games/cdn/ff60ee73-eee3-44e6-99a2-9703c370b594freefirecover100.png', title: 'Free Fire 1060 Diamantes', platform: 'Mobile', originalPrice: 17, discountPrice: 14, discount: 15, description: 'Paquete de 1060 diamantes para Free Fire. Obtén más contenido exclusivo en el juego.', tags: ['Diamantes', 'Recarga', 'Battle Royale'], distributor: 'Garena', activation: 'Free Fire ID' },
  { id: 18, image: 'https://img.hype.games/cdn/ff60ee73-eee3-44e6-99a2-9703c370b594freefirecover100.png', title: 'Free Fire 2180 Diamantes', platform: 'Mobile', originalPrice: 29, discountPrice: 24.65, discount: 15, description: 'El mejor paquete de diamantes para Free Fire. Maximiza tu experiencia de juego.', tags: ['Diamantes', 'Recarga', 'Battle Royale'], distributor: 'Garena', activation: 'Free Fire ID' },
];

export const getProductById = (id: number): Product | undefined => {
  return allProducts.find(product => product.id === id);
};

export const getRelatedProducts = (product: Product, limit: number = 4): Product[] => {
  return allProducts
    .filter(p => p.platform === product.platform && p.id !== product.id)
    .slice(0, limit);
};

export const getProductsByPlatform = (platform: string): Product[] => {
  return allProducts.filter(p => p.platform === platform);
};
