import { http } from "./http";

export type BannerCtaType = "NONE" | "PRODUCT" | "CATEGORY" | "PAGE";

export interface BannerButton {
  label: string | null;
  type: BannerCtaType;
  value: string | null;
}

export interface Banner {
  id: number;
  isActive: boolean;
  order: number;
  backgroundUrl: string;
  characterUrl: string | null;
  /** Ajuste del personaje en el hero. scale: alto como % del hero. offsetX/offsetY:
   *  desplazamiento en % del propio personaje (X: + derecha; Y: + arriba).
   *  Opcionales: backends viejos (sin desplegar) no los envían -> se usa el default. */
  characterScale?: number;
  characterOffsetX?: number;
  characterOffsetY?: number;
  badge: string | null;
  titleTop: string | null;
  titleBottom: string | null;
  description: string | null;
  primary: BannerButton;
  secondary: BannerButton;
}

/** Banners activos del carrusel del home (público). */
export function getBanners(signal?: AbortSignal) {
  return http<Banner[]>("/banners", { method: "GET", signal });
}
