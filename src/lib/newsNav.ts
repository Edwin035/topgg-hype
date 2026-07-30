/** A dónde lleva una noticia: interno (/ruta) por router, externo (http) en pestaña nueva. */
export function goToNews(navigate: (to: string) => void, url?: string | null) {
  const u = (url || "").trim();
  if (!u) return;
  if (u.startsWith("/")) navigate(u);
  else if (/^https?:\/\//i.test(u))
    window.open(u, "_blank", "noopener,noreferrer");
}
