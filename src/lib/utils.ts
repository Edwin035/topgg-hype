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
