import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, LifeBuoy, Loader2, XCircle } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/Auth/AuthProvider";
import { getMySale } from "@/lib/api/sales";

const POLL_MS = 2500;
const MAX_TRIES = 40; // ~100s

const PENDING_KEY = "tg_pending_binance_sale";

type Stage =
  | "polling"
  | "fulfilling"
  | "fulfilling_timeout"
  | "needs_attention"
  | "cancelled"
  | "timeout"
  | "error";

function readPendingSaleId(fromQuery: string | null): number | null {
  if (fromQuery && /^\d+$/.test(fromQuery)) return Number(fromQuery);

  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { saleId?: number };
      if (parsed?.saleId) return Number(parsed.saleId);
    }
  } catch {
    // ignore
  }
  return null;
}

const BinancePaySuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, initializing } = useAuth();

  const [stage, setStage] = useState<Stage>("polling");
  const triesRef = useRef(0);

  const saleId = readPendingSaleId(params.get("saleId"));

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    if (!saleId) {
      setStage("error");
      return;
    }

    let active = true;
    let timer: number | undefined;

    async function poll() {
      if (!active) return;
      triesRef.current += 1;

      try {
        const sale = await getMySale(saleId as number);
        const status = String(sale.status).toUpperCase();

        if (status === "COMPLETADA") {
          localStorage.removeItem(PENDING_KEY);
          navigate(`/factura/${sale.productId}`, {
            replace: true,
            state: { sale, quantity: sale.quantity },
          });
          return;
        }

        if (status === "CANCELADA" || status === "DEVUELTA") {
          localStorage.removeItem(PENDING_KEY);
          setStage("cancelled");
          return;
        }

        // Pagado pero la entrega no se pudo completar tras los reintentos: pasa a
        // resolución manual. No es un error del usuario; ya pagó.
        if (status === "REQUIERE_ATENCION") {
          localStorage.removeItem(PENDING_KEY);
          setStage("needs_attention");
          return;
        }

        // Pagado pero aún generando el pin.
        if (status === "EN_PROCESO") {
          setStage("fulfilling");
        }
      } catch {
        // Error transitorio: seguimos intentando.
      }

      if (triesRef.current >= MAX_TRIES) {
        setStage((prev) =>
          prev === "fulfilling" ? "fulfilling_timeout" : "timeout",
        );
        return;
      }

      timer = window.setTimeout(() => void poll(), POLL_MS);
    }

    void poll();

    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [saleId, user, initializing, navigate]);

  const isWaiting = stage === "polling" || stage === "fulfilling";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          {isWaiting ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {stage === "fulfilling"
                  ? "Pago confirmado, generando tu pin…"
                  : "Confirmando tu pago…"}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {stage === "fulfilling"
                  ? "Tu pago llegó. Estamos entregando tu pin, no cierres esta ventana."
                  : "Esto puede tardar unos segundos después de completar el pago en Binance."}
              </p>
            </>
          ) : null}

          {stage === "fulfilling_timeout" ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Pago recibido
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Tu pago fue confirmado y tu pin se está generando. Aparecerá en
                tu historial en unos minutos.
              </p>
              <Link
                to="/historial"
                className="btn-gaming mt-6 inline-block px-6 py-3">
                Ver mi historial
              </Link>
            </>
          ) : null}

          {stage === "needs_attention" ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                <LifeBuoy className="h-8 w-8 text-yellow-400" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Pago recibido, estamos gestionando tu pin
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Recibimos tu pago, pero tuvimos un inconveniente al entregar tu
                pin automáticamente. Nuestro equipo ya está al tanto y se pondrá
                en contacto contigo para resolverlo. No necesitas volver a pagar.
              </p>
              <Link
                to="/historial"
                className="btn-gaming mt-6 inline-block px-6 py-3">
                Ver mi historial
              </Link>
            </>
          ) : null}

          {stage === "timeout" ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Aún no vemos el pago
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Si ya pagaste, tu compra aparecerá en tu historial en cuanto se
                confirme. Si no completaste el pago, puedes intentarlo de nuevo.
              </p>
              <Link
                to="/historial"
                className="btn-gaming mt-6 inline-block px-6 py-3">
                Ver mi historial
              </Link>
            </>
          ) : null}

          {stage === "cancelled" || stage === "error" ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {stage === "cancelled"
                  ? "Pago no completado"
                  : "No pudimos ubicar tu compra"}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {stage === "cancelled"
                  ? "El pago fue cancelado o expiró. No se te cobró. Puedes intentarlo de nuevo."
                  : "No encontramos la orden de pago. Revisa tu historial o inicia una nueva compra."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/catalogo" className="btn-gaming px-6 py-3">
                  Volver al catálogo
                </Link>
                <Link
                  to="/historial"
                  className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">
                  Ver historial
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BinancePaySuccess;
