// Query compartido de noticias públicas. Un solo queryKey (["news-public"]) → el
// cache lo comparten el "top" del home, la página /novedades y el popup promocional.
import { useQuery } from "@tanstack/react-query";
import { getNews } from "@/lib/api/news";

export function useNews(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["news-public"],
    queryFn: ({ signal }) => getNews(signal),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  });
}
