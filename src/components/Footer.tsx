import { Gamepad2, Monitor, Gift, CreditCard, Tv, MessageCircle, HelpCircle, Clock, Facebook, Instagram, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div>
             <img
                src="https://imagedelivery.net/mdYNjHMfu0qYk6YLCukv2Q/07bccdde-7b1c-4dc0-e236-3a9f7b055f00/public"
                alt="TopLevel"
                loading="eager"
                className="
                  h-10 w-auto
                  md:h-11 lg:h-12
                  max-w-[160px] md:max-w-[190px]
                  object-contain
                  select-none
                "
              />
            <p className="text-sm text-muted-foreground">
              Somos tu mejor aliado gamer. Juega, conecta y evoluciona al máximo nivel.
            </p>
          </div>

          {/* Productos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="h-5 w-5 text-primary" />
              <h4 className="font-display font-bold text-foreground">Productos</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-neon-green" />
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Recargas por ID
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-pink-500" />
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Gift cards
                </a>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-yellow-500" />
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Recargas internas
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Tv className="h-4 w-4 text-purple-500" />
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Streaming
                </a>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h4 className="font-display font-bold text-foreground">Soporte</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-pink-500" />
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contacto
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Handshake className="h-4 w-4 text-neon-cyan" />
                <Link to="/aliados" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Aliados
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-yellow-500" />
                <Link to="/#faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Horario */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h4 className="font-display font-bold text-foreground">Horario</h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Horario de atención</p>
                <p className="text-sm text-muted-foreground">11:00 AM - 11:59 PM</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Horario soporte técnico</p>
                <p className="text-sm text-muted-foreground">10:00 AM - 9:00 PM</p>
              </div>
            </div>
          </div>

          {/* Síguenos */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Síguenos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-4 w-4 text-blue-500" />
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 TOPLEVEL. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Las marcas comerciales y logotipos de los juegos pertenecen a sus respectivos propietarios.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
