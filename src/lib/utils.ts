import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un monto con MÍNIMO 2 y MÁXIMO 3 decimales. Los productos propios
 * pueden tener precio con 3 decimales; NO usar `toFixed(2)` porque redondearía
 * (4.125 -> "4.13"). Ejemplos: 10 -> "10.00", 4.5 -> "4.50", 4.125 -> "4.125".
 */
export function formatMoney(n: number): string {
  const s = n.toFixed(3);
  return s.endsWith("0") ? s.slice(0, -1) : s;
}

/** Fecha ISO en formato largo es-CO: "30 de junio de 2026". "" si no es válida. */
export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Fecha ISO en formato corto DD-MM-YYYY (hora local). "" si no es válida. */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
