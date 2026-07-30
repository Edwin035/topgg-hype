import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cómo compro en TOP LEVEL?",
    answer:
      "Inicia sesión, elige tu producto y presiona Comprar. Completa el pago con Binance Pay y recibirás tu código o pin al confirmarse el pago. Si es tu primera vez, revisa la sección Tutoriales, donde encontrarás el paso a paso.",
  },
  {
    question: "¿Cómo recibo mi producto?",
    answer:
      "Al confirmarse el pago, tu código o pin queda disponible en la factura de la compra y en tu Historial. Recibes un código que tú mismo canjeas: nunca te pedimos la contraseña ni los datos de acceso de tu cuenta de juego.",
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer:
      "La mayoría de los códigos se entregan de inmediato al confirmarse el pago. Algunos productos marcados como “Bajo pedido” se entregan un poco después, cuando el equipo asigna el código a tu compra. Puedes seguir el estado en tu Historial.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "El pago se realiza con Binance Pay en USDT. Como 1 USDT equivale a 1 dólar, pagas exactamente el monto que ves en la compra; además verás el total en USDT antes de confirmar.",
  },
  {
    question: "¿Necesito iniciar sesión para comprar?",
    answer:
      "Sí. Debes iniciar sesión para completar una compra, ver tu Historial y consultar el estado de cada pedido.",
  },
  {
    question: "¿Puedo comprar varias unidades en una sola compra?",
    answer:
      "Sí, puedes comprar hasta 5 unidades del mismo producto en una compra. Por ahora cada compra es de un solo producto: no hay carrito para combinar productos distintos.",
  },
  {
    question: "¿Puedo cancelar mi compra?",
    answer:
      "Una vez que el código o pin ha sido entregado, la compra no puede cancelarse ni reembolsarse. Si el pago aún no se ha procesado o el producto no pudo entregarse, escríbenos a soporte lo antes posible y revisaremos tu caso.",
  },
  {
    question: "¿Hacen devoluciones?",
    answer:
      "Como los productos son códigos digitales, no se hacen reembolsos una vez entregado el código. Si un pedido no puede completarse por una causa de nuestro lado o del proveedor, el equipo de soporte lo reintenta o resuelve tu caso de forma personalizada.",
  },
  {
    question: "¿Qué es el programa de afiliados?",
    answer:
      "Es nuestro programa para revendedores y personas que quieran comercializar recargas y productos digitales con precios preferenciales. Puedes conocer las condiciones y registrarte en la sección Aliados.",
  },
  {
    question: "¿Ofrecen precios por compras al por mayor?",
    answer:
      "Sí, contamos con tarifas preferenciales para compras en volumen y para nuestros aliados. Regístrate como aliado o escríbenos a soporte para conocer las condiciones.",
  },
  {
    question: "¿Ofrecen soporte técnico?",
    answer:
      "Sí. Nuestro equipo te ayuda con pagos, entregas, tu cuenta y cualquier inconveniente con una compra. El horario de soporte es de 10:00 a.m. a 9:00 p.m. Si escribes fuera de ese horario, deja tu mensaje y te responderemos al reabrir.",
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
