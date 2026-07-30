// Página pública de Novedades: todas las noticias vigentes en una grilla.
import { Newspaper } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NewsCard } from "@/components/NewsCard";
import { useNews } from "@/hooks/useNews";

const Novedades = () => {
  const { data, isLoading, isError, refetch } = useNews();

  const items = data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <header className="mb-8 flex items-center gap-3">
          <Newspaper className="h-9 w-9 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Nove<span className="gradient-text">dades</span>
            </h1>
            <p className="text-muted-foreground">
              Las últimas novedades y actualizaciones.
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="space-y-3 rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-destructive">
              No se pudieron cargar las novedades.
            </p>
            <button
              onClick={() => void refetch()}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">
              Reintentar
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card/40 p-10 text-center text-muted-foreground">
            No hay novedades disponibles en este momento.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Novedades;
