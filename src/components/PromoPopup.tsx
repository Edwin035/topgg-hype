// Popup promocional del home: muestra las imágenes de las noticias vigentes como
// un carrusel (flechas, dots, auto-slide y swipe). Al hacer clic va a su URL.
// Solo se renderiza si está abierto Y hay noticias con imagen válida.
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getNews } from "@/lib/api/news";
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const { data } = useQuery({
    queryKey: ["news-public"],
    queryFn: ({ signal }) => getNews(signal),
    staleTime: 60_000,
    enabled: isOpen,
  });

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

  // Índice válido si cambian los slides.
  useEffect(() => {
    if (index > slides.length - 1) setIndex(0);
  }, [slides.length, index]);

  // Auto-slide (solo si hay más de 1).
  useEffect(() => {
    if (!isOpen || slides.length <= 1) return;
    const t = setInterval(
      () => setIndex((p) => (p === slides.length - 1 ? 0 : p + 1)),
      5000,
    );
    return () => clearInterval(t);
  }, [isOpen, slides.length]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || slides.length === 0) return null;

  const prev = () =>
    setIndex((p) => (p === 0 ? slides.length - 1 : p - 1));
  const next = () =>
    setIndex((p) => (p === slides.length - 1 ? 0 : p + 1));

  // Clamp en el render: si los slides se encogen (refetch en background) antes de
  // que el effect corrija el índice, evita leer fuera de rango y crashear.
  const safeIndex = Math.min(index, slides.length - 1);
  const current = slides[safeIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative max-h-[90vh] max-w-[95vw] rounded-xl border-2 border-primary bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-50 text-foreground transition-colors hover:text-primary"
          aria-label="Cerrar">
          <X size={22} />
        </button>

        <div
          className="relative flex touch-pan-y items-center justify-center p-4"
          onPointerDown={(e) => {
            setIsSwiping(false);
            setTouchStartX(e.clientX);
          }}
          onPointerUp={(e) => {
            if (touchStartX === null) return;
            const dx = e.clientX - touchStartX;
            if (Math.abs(dx) > 50) {
              setIsSwiping(true);
              if (dx > 0) prev();
              else next();
            }
          }}>
          <img
            src={current.src}
            alt={current.alt}
            loading="eager"
            onClick={() => {
              if (!isSwiping) goToNews(navigate, current.href);
            }}
            className="h-auto max-h-[80vh] w-auto max-w-[90vw] cursor-pointer object-contain"
          />

          {slides.length > 1 ? (
            <>
              <button
                onClick={prev}
                aria-label="Anterior"
                className="absolute left-3 hidden text-3xl text-foreground transition-colors hover:text-primary md:block">
                ‹
              </button>
              <button
                onClick={next}
                aria-label="Siguiente"
                className="absolute right-3 hidden text-3xl text-foreground transition-colors hover:text-primary md:block">
                ›
              </button>
            </>
          ) : null}
        </div>

        {slides.length > 1 ? (
          <div className="mb-4 flex justify-center gap-2">
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
        ) : (
          <div className="h-4" />
        )}
      </div>
    </div>
  );
};

export default PromoPopup;
