/** Mensaje por defecto al abrir el chat de soporte. */
export const SUPPORT_TEXT = "Hola, necesito ayuda con mi compra en TOP LEVEL.";

/**
 * Construye el enlace de WhatsApp (wa.me) a partir de un número.
 * Ignora espacios, "+", guiones, etc. Devuelve "" si no hay número.
 */
export function waLink(phone?: string | null, text?: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
