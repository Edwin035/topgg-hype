import { http } from "./http";

export interface NewsPublic {
  id: string;
  imagenPromo: string;
  titulo: string;
  descripcion: string;
  urlNoticia: string;
  publishFrom: string; // ISO
  publishTo: string; // ISO
}

/** Noticias vigentes (dentro de su ventana de publicación). Público. */
export function getNews(signal?: AbortSignal) {
  return http<NewsPublic[]>("/news", { method: "GET", signal });
}
