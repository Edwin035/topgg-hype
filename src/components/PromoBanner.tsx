import { ChevronRight } from "lucide-react";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  discount: string;
  image: string;
  ctaText?: string;
  reversed?: boolean;
}

const PromoBanner = ({
  title,
  subtitle,
  discount,
  image,
  ctaText = "Comprar",
  reversed = false,
}: PromoBannerProps) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${
        reversed ? "from-secondary/20 to-primary/20" : "from-primary/20 to-secondary/20"
      }`}
    >
      <div
        className={`flex flex-col ${
          reversed ? "md:flex-row-reverse" : "md:flex-row"
        } items-center md:items-stretch`}
      >
        {/* Content */}
        <div className="flex-1 p-6 md:p-10">
          <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">
            <span className="text-foreground">{title.split(' ').slice(0, -1).join(' ')} </span>
            <span className="gradient-text">{title.split(' ').slice(-1)}</span>
          </h3>
          <p className="text-muted-foreground mb-4">{subtitle}</p>

          <div className="flex items-center gap-4">
            <span className="text-4xl md:text-5xl font-display font-bold gradient-text">
              {discount}
            </span>
            <button className="btn-gaming flex items-center gap-2">
              {ctaText}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 relative w-full h-52 md:h-auto md:min-h-[260px] lg:min-h-[300px]">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-center md:object-right"
          />

          <div
            className={`absolute inset-0 bg-gradient-to-${
              reversed ? "l" : "r"
            } from-transparent via-transparent to-card/50`}
          />
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
