// Tarjeta de noticia reutilizable (la usan el "top" del home y la página /novedades).
import { useNavigate } from "react-router-dom";
import type { NewsPublic } from "@/lib/api/news";
import { goToNews } from "@/lib/newsNav";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function NewsCard({ news }: { news: NewsPublic }) {
  const navigate = useNavigate();
  const go = () => goToNews(navigate, news.urlNoticia);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") go();
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
  );
}
