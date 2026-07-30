// "Top" de novedades: grid "Últimas Novedades" en el home. Cada tarjeta lleva a
// la URL de la noticia. Si no hay noticias vigentes (o falla), no renderiza nada.
import { useQuery } from "@tanstack/react-query";
import { getNews } from "@/lib/api/news";
import { NewsCard } from "@/components/NewsCard";

type Props = { limit?: number };

const NovedadesCarrusel = ({ limit }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["news-public"],
    queryFn: ({ signal }) => getNews(signal),
    staleTime: 60_000,
  });

  const items = (data ?? []).slice(
    0,
    typeof limit === "number" ? limit : undefined,
  );

  // Mientras carga o sin noticias: no mostramos nada (evita el título vacío).
  if (isLoading || items.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title mb-8 text-center text-foreground">
          Últimas <span className="gradient-text">Novedades</span>
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NovedadesCarrusel;
