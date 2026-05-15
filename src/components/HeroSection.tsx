import { ChevronRight, Zap, Gamepad2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/AuthProvider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { useCallback, useEffect, useState } from "react";

import heroImage1 from "@/assets/hero-gaming.jpg";
import heroImage2 from "@/assets/hero-slide-2.jpg";
import heroImage3 from "@/assets/hero-slide-3.jpg";

const slides = [
  {
    image: heroImage1,
    badge: "Oferta Especial",
    badgeIcon: Zap,
    titleTop: "NIVEL FINAL",
    titleBottom: "Máximo descuento",
    description: "Hasta <strong>15% OFF</strong> en todos tus juegos favoritos",
    ctaPrimary: "Comprar Ahora",
    ctaSecondary: "Ver Catálogo",
  },
  {
    image: heroImage2,
    badge: "Nuevos Lanzamientos",
    badgeIcon: Gamepad2,
    titleTop: "LOS MÁS JUGADOS",
    titleBottom: "Éxitos del momento",
    description:
      "Descubre los juegos <strong>más populares</strong> de la temporada",
    ctaPrimary: "Explorar",
    ctaSecondary: "Ver Catálogo",
  },
  {
    image: heroImage3,
    badge: "Gift Cards",
    badgeIcon: CreditCard,
    titleTop: "TARJETAS REGALO",
    titleBottom: "Steam · Xbox · PSN",
    description:
      "Las mejores tarjetas al <strong>mejor precio</strong> del mercado",
    ctaPrimary: "Ver Tarjetas",
    ctaSecondary: "Ver Catálogo",
  },
];

const HeroSection = () => {
  const navigate = useNavigate();

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const handleBuyClick = () => {
    navigate("/catalogo");
  };

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

  // Auto-play
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="relative">
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="relative min-h-[500px] md:min-h-[600px] overflow-hidden">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="relative container mx-auto px-4 py-16 md:py-24 flex flex-col justify-center items-center md:items-start min-h-[500px] md:min-h-[600px]">
                  <div className="max-w-xl text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full mb-6 animate-glow">
                      <slide.badgeIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {slide.badge}
                      </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight">
                      <span className="gradient-text">{slide.titleTop}</span>
                      <br />
                      <span className="text-foreground">
                        {slide.titleBottom}
                      </span>
                    </h1>

                    <p
                      className="text-lg md:text-xl text-muted-foreground mb-8"
                      dangerouslySetInnerHTML={{ __html: slide.description }}
                    />

                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <button
                        onClick={handleBuyClick}
                        className="btn-gaming flex items-center gap-2">
                        {slide.ctaPrimary}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate("/catalogo")}
                        className="px-6 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider border border-primary text-primary hover:bg-primary/10 transition-all duration-300">
                        {slide.ctaSecondary}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
      </Carousel>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
