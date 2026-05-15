import { useNavigate } from 'react-router-dom';
import partnerImg from '@/assets/partner-character.png';

const PartnerBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/20 border border-primary/30 min-h-[200px] md:min-h-[260px]">
          {/* Diagonal stripes overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
            }}
          />

          {/* Top & bottom accent bars */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-secondary to-primary" />

          <div className="relative flex flex-col md:flex-row items-center h-full">
            {/* Character image */}
            <div className="flex-1 flex justify-center items-end pt-6 md:pt-0">
              <img
                src={partnerImg}
                alt="Partner character"
                className="h-40 md:h-56 lg:h-64 object-contain drop-shadow-2xl"
              />
            </div>

            {/* Text content */}
            <div className="flex-1 flex flex-col items-center md:items-start justify-center p-6 md:p-10 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground italic mb-4 leading-tight">
                Crece con nosotros,
                <br />
                <span className="gradient-text">sé nuestro aliado</span>
              </h3>
              <button
                onClick={() => navigate('/aliados')}
                className="btn-gaming px-8 py-3 rounded-full text-primary-foreground font-semibold text-sm uppercase tracking-wider"
              >
                Comenzar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerBanner;
