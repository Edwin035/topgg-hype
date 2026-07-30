// Ajustes públicos del sitio (número de soporte, etc.). Un solo queryKey ->
// cache compartido entre el botón flotante y el footer.
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/api/settings";

export function useSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: ({ signal }) => getSettings(signal),
    staleTime: 5 * 60_000,
  });
}
