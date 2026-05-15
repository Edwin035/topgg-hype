import { CreditCard, Truck, Shield, Headphones } from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: 'Pago Seguro',
    description: 'Múltiples métodos de pago',
  },
  {
    icon: Truck,
    title: 'Entrega Inmediata',
    description: 'Códigos al instante',
  },
  {
    icon: Shield,
    title: 'Garantía Total',
    description: 'Productos originales 100%',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Ayuda cuando la necesites',
  },
];

const FeaturesBar = () => {
  return (
    <section className="py-8 bg-card/50 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
