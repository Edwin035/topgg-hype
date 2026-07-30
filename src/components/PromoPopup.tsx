// Popup promocional del home: muestra las imágenes de las noticias vigentes como
// un carrusel (flechas, dots, auto-slide y swipe). Al hacer clic va a su URL.
// Montado sobre el Dialog de shadcn (Radix): trae overlay, bloqueo de scroll del
// body, foco atrapado, aria-modal y cierre con Escape sin reimplementarlos.
// Solo se renderiza si está abierto Y hay noticias con imagen válida.
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNews } from "@/hooks/useNews";
import { goToNews } from "@/lib/newsNav";

interface PromoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type Slide = { src: string; alt: string; href?: string };

function isValidImg(u: string) {
  const s = (u || "").trim();
  return /^https?:\/\//i.test(s) || s.startsWith("/");
}

const PromoPopup = ({ isOpen, onClose }: PromoPopupProps) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  // Refs (no estado) para el swipe: se leen de forma síncrona en el click, sin
  // depender de que React "flushee" un setState entre pointerup y el click.
  const touchStartXRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);

  const { data } = useNews({ enabled: isOpen });

  const slides: Slide[] = useMemo(() => {
    const mapped = (data ?? [])
      .map((n) => ({
        src: (n.imagenPromo || "").trim(),
        alt: (n.titulo || "Promo").trim(),
        href: (n.urlNoticia || "").trim() || undefined,
      }))
      .filter((s) => isValidImg(s.src));
    // Dedup por imagen.
    const seen = new Set<string>();
    return mapped.filter((s) => (seen.has(s.src) ? false : seen.add(s.src)));
  }, [data]);

  // Índice válido si cambian los slides (p. ej. refetch en background que reduce).
  useEffect(() => {
    if (index > slides.length - 1) setIndex(0);
  }, [slides.length, index]);

  // Auto-slide (solo si hay más de 1). Depende de `index`: cada navegación manual
  // reinicia la ventana de 5s (evita el salto abrupto justo después de tocar).
  useEffect(() => {
    if (!isOpen || slides.length <= 1) return;
    const t = setInterval(
      () => setIndex((p) => (p >= slides.length - 1 ? 0 : p + 1)),
      5000,
    );
    return () => clearInterval(t);
  }, [isOpen, slides.length, index]);

  if (!isOpen || slides.length === 0) return null;

  const prev = () => setIndex((p) => (p <= 0 ? slides.length - 1 : p - 1));
  const next = () => setIndex((p) => (p >= slides.length - 1 ? 0 : p + 1));

  // Clamp en el render: si los slides se encogen antes de que el effect corrija
  // el índice, evita leer fuera de rango y crashear.
  const safeIndex = Math.min(index, slides.length - 1);
  const current = slides[safeIndex];

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <DialogContent className="max-w-[95vw] gap-0 overflow-hidden border-2 border-primary bg-card p-0 sm:max-w-2xl sm:gap-0">
        <DialogTitle className="sr-only">Promociones</DialogTitle>
        <DialogDescription className="sr-only">
          Novedades y promociones de la tienda
        </DialogDescription>

        <div
          className="relative flex touch-pan-y items-center justify-center"
          onPointerDown={(e) => {
            isSwipingRef.current = false;
            touchStartXRef.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (touchStartXRef.current === null) return;
            const dx = e.clientX - touchStartXRef.current;
            if (Math.abs(dx) > 50) {
              isSwipingRef.current = true;
              if (dx > 0) prev();
              else next();
            }
          }}>
          <img
            src={current.src}
            alt={current.alt}
            loading="eager"
            onClick={() => {
              if (!isSwipingRef.current) goToNews(navigate, current.href);
            }}
            className="block max-h-[80vh] w-auto max-w-full cursor-pointer object-contain"
          />

          {slides.length > 1 ? (
            <>
              <button
                onClick={prev}
                aria-label="Anterior"
                className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 px-2 text-3xl leading-none text-white transition-colors hover:text-primary md:block">
                ‹
              </button>
              <button
                onClick={next}
                aria-label="Siguiente"
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 px-2 text-3xl leading-none text-white transition-colors hover:text-primary md:block">
                ›
              </button>
            </>
          ) : null}
        </div>

        {slides.length > 1 ? (
          <div className="flex justify-center gap-2 py-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Ir al ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === safeIndex ? "bg-primary" : "bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default PromoPopup;
