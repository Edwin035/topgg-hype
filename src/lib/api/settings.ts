import { http } from "./http";

/** Ajustes públicos del sitio (los edita el panel). */
export interface SiteSettings {
  supportPhone: string;
}

export function getSettings(signal?: AbortSignal) {
  return http<SiteSettings>("/settings", { method: "GET", signal });
}
