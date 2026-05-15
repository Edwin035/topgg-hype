import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cómo funciona el proceso de compra?",
    answer:
      "Selecciona el producto que deseas y completa el pago. Recibirás tu código o recarga al instante en tu correo electrónico o directamente en tu cuenta.",
  },
  {
    question: "¿Cuánto tiempo tarda en llegar mi pedido?",
    answer:
      "Las recargas por ID se procesan de forma inmediata. Las gift cards y códigos digitales se entregan en menos de 5 minutos después de confirmar el pago.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos transferencias bancarias, Nequi, Daviplata, tarjetas de crédito/débito y criptomonedas. Todos los pagos son procesados de forma segura.",
  },
  {
    question: "¿Puedo solicitar un reembolso?",
    answer:
      "Los reembolsos están disponibles si el código o recarga no ha sido utilizado. Contáctanos dentro de las primeras 24 horas después de la compra para gestionar tu solicitud.",
  },
  {
    question: "¿Cómo me convierto en aliado de TOPLEVEL?",
    answer:
      "Visita nuestra página de Aliados y completa el formulario de solicitud. Nuestro equipo revisará tu información y te contactará para comenzar la colaboración.",
  },
  {
    question: "¿Las recargas por ID son seguras?",
    answer:
      "Sí, todas las recargas se realizan directamente a través de los canales oficiales de cada plataforma. Nunca solicitamos contraseñas ni datos sensibles de tu cuenta.",
  },
  {
    question: "¿Ofrecen descuentos por compras al por mayor?",
    answer:
      "¡Sí! Contamos con precios especiales para compras en volumen y para nuestros aliados. Contáctanos o regístrate como aliado para conocer las tarifas preferenciales.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="section-title font-display text-foreground mb-2">
            Preguntas <span className="gradient-text">Frecuentes</span>
          </h2>
          <p className="text-muted-foreground">
            Resolvemos tus dudas más comunes
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border bg-card rounded-xl px-5 data-[state=open]:border-primary/40 transition-colors"
            >
              <AccordionTrigger className="text-left text-sm md:text-base font-medium text-foreground hover:text-primary py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
