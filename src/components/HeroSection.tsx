import { ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { useCallback, useEffect, useState } from "react";

import heroImage1 from "@/assets/hero-gaming.jpg";
import { getBanners, type Banner, type BannerButton } from "@/lib/api/banners";

/** Modelo de slide ya listo para pintar (banner del API o fallback). */
interface Slide {
  background: string;
  character: string | null;
  characterScale: number;
  characterOffsetX: number;
  characterOffsetY: number;
  badge: string | null;
  titleTop: string | null;
  titleBottom: string | null;
  description: string | null;
  primary: { label: string; href: string } | null;
  secondary: { label: string; href: string } | null;
}

/** Resuelve a dónde lleva un botón según su tipo (o null si no hay botón). */
function ctaHref(cta: BannerButton): string | null {
  if (!cta || cta.type === "NONE" || !cta.value) return null;
  switch (cta.type) {
    case "PRODUCT":
      return `/producto/${cta.value}`;
    case "CATEGORY":
      return `/catalogo?categoria=${cta.value}`;
    case "PAGE":
      if (cta.value === "aliados") return "/aliados";
      if (cta.value === "home") return "/";
      return "/catalogo";
    default:
      return null;
  }
}

function toButton(cta: BannerButton): Slide["primary"] {
  const href = ctaHref(cta);
  if (!href) return null;
  return { label: cta.label?.trim() || "Ver más", href };
}

function bannerToSlide(b: Banner): Slide {
  return {
    background: b.backgroundUrl,
    character: b.characterUrl,
    characterScale: b.characterScale ?? 90,
    characterOffsetX: b.characterOffsetX ?? 0,
    characterOffsetY: b.characterOffsetY ?? 0,
    badge: b.badge,
    titleTop: b.titleTop,
    titleBottom: b.titleBottom,
    description: b.description,
    primary: toButton(b.primary),
    secondary: toButton(b.secondary),
  };
}

/** Slide por defecto si no hay banners activos (o falla la carga). */
const DEFAULT_SLIDE: Slide = {
  background: heroImage1,
  character: null,
  characterScale: 90,
  characterOffsetX: 0,
  characterOffsetY: 0,
  badge: "Oferta Especial",
  titleTop: "NIVEL FINAL",
  titleBottom: "Máximo descuento",
  description: "Hasta 15% OFF en todos tus juegos favoritos",
  primary: { label: "Comprar ahora", href: "/catalogo" },
  secondary: { label: "Ver catálogo", href: "/catalogo" },
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[] | null>(null);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getBanners(controller.signal)
      .then((banners) => {
        if (controller.signal.aborted) return;
        setSlides(banners.length ? banners.map(bannerToSlide) : [DEFAULT_SLIDE]);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSlides([DEFAULT_SLIDE]);
      });
    return () => controller.abort();
  }, []);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Auto-play (solo si hay más de un slide).
  useEffect(() => {
    if (!api || (slides?.length ?? 0) <= 1) return;
    const interval = setInterval(() => api.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [api, slides]);

  // Mientras carga, reserva el alto para no mover el layout.
  if (!slides) {
    return <section className="min-h-[500px] bg-background md:min-h-[600px]" />;
  }

  return (
    <section className="relative">
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="relative min-h-[500px] overflow-hidden md:min-h-[600px]">
                {/* Fondo */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.background})` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                {/* Personaje (derecha). Escala y offset configurables por banner:
                    height = % del hero; translate = % del propio personaje
                    (X: + derecha / − izquierda; Y: + arriba / − abajo). */}
                {slide.character ? (
                  <img
                    src={slide.character}
                    alt=""
                    style={{
                      height: `${slide.characterScale}%`,
                      transform: `translate(${slide.characterOffsetX}%, ${-slide.characterOffsetY}%)`,
                    }}
                    className="pointer-events-none absolute bottom-0 right-0 hidden w-auto object-contain md:block"
                  />
                ) : null}

                {/* Contenido */}
                <div className="relative container mx-auto flex min-h-[500px] flex-col items-center justify-center px-4 py-16 md:min-h-[600px] md:items-start md:py-24">
                  <div className="max-w-xl text-center md:text-left">
                    {slide.badge ? (
                      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 animate-glow">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {slide.badge}
                        </span>
                      </div>
                    ) : null}

                    {slide.titleTop || slide.titleBottom ? (
                      <h1 className="mb-4 text-4xl font-display font-bold leading-tight md:text-6xl">
                        {slide.titleTop ? (
                          <span className="gradient-text">
                            {slide.titleTop}
                          </span>
                        ) : null}
                        {slide.titleTop && slide.titleBottom ? <br /> : null}
                        {slide.titleBottom ? (
                          <span className="text-foreground">
                            {slide.titleBottom}
                          </span>
                        ) : null}
                      </h1>
                    ) : null}

                    {slide.description ? (
                      <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                        {slide.description}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                      {slide.primary ? (
                        <button
                          onClick={() => navigate(slide.primary!.href)}
                          className="btn-gaming flex items-center gap-2">
                          {slide.primary.label}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : null}
                      {slide.secondary ? (
                        <button
                          onClick={() => navigate(slide.secondary!.href)}
                          className="rounded-lg border border-primary px-6 py-2 text-sm font-semibold uppercase tracking-wider text-primary transition-all duration-300 hover:bg-primary/10">
                          {slide.secondary.label}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Dots */}
        {slides.length > 1 ? (
          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === index
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                }`}
              />
            ))}
          </div>
        ) : null}
      </Carousel>

      {/* Gradiente inferior */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
