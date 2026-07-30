// "Top" de novedades: grid "Últimas Novedades" en el home. Cada tarjeta lleva a
// la URL de la noticia. Si no hay noticias vigentes (o falla), no renderiza nada.
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getNews, type NewsPublic } from "@/lib/api/news";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Props = { limit?: number };

const NovedadesCarrusel = ({ limit }: Props) => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["news-public"],
    queryFn: ({ signal }) => getNews(signal),
    staleTime: 60_000,
  });

  const items = (data ?? []).slice(0, typeof limit === "number" ? limit : undefined);

  // A dónde lleva la tarjeta: interno (/ruta) via router, externo (http) en pestaña nueva.
  const go = (url?: string | null) => {
    const u = (url || "").trim();
    if (!u) return;
    if (u.startsWith("/")) navigate(u);
    else if (/^https?:\/\//i.test(u)) window.open(u, "_blank", "noopener,noreferrer");
  };

  // Mientras carga o sin noticias: no mostramos nada (evita el título vacío).
  if (isLoading || items.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title mb-8 text-center text-foreground">
          Últimas <span className="gradient-text">Novedades</span>
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((news: NewsPublic) => (
            <article
              key={news.id}
              role="link"
              tabIndex={0}
              onClick={() => go(news.urlNoticia)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") go(news.urlNoticia);
              }}
              className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/60">
              <div className="aspect-[1080/600] w-full overflow-hidden bg-muted">
                <img
                  src={news.imagenPromo}
                  alt={news.titulo}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="space-y-3 p-5">
                <h3 className="line-clamp-1 font-semibold text-foreground">
                  {news.titulo}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {news.descripcion}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(news.publishFrom)}
                  </span>
                  <span className="text-xs font-medium text-primary group-hover:underline">
                    Ver más
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NovedadesCarrusel;
