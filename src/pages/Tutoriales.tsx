// Página pública de Tutoriales / Instrucciones. Tarjetas uniformes con filtro
// por tipo; al abrir una tarjeta se ve su contenido completo (imagen o video).
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  FileText,
  GraduationCap,
  Image as ImgIcon,
  PlayCircle,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getTutorials,
  type PublicTutorial,
  type TutorialType,
} from "@/lib/api/tutorials";

type FilterKey = "ALL" | "VIDEO" | "IMAGE" | "TEXT";

function groupOf(type: TutorialType): Exclude<FilterKey, "ALL"> {
  if (type === "IMAGE") return "IMAGE";
  if (type === "TEXT") return "TEXT";
  return "VIDEO";
}

/** Extrae el ID de YouTube de varias formas de URL. */
function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return m ? m[1] : null;
}

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

/** Devuelve una URL embebible o null si no se reconoce. */
function toEmbedUrl(url: string): string | null {
  const yt = youTubeId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}`;
  const vm = vimeoId(url);
  if (vm) return `https://player.vimeo.com/video/${vm}`;
  return null;
}

function thumbFor(t: PublicTutorial): string | null {
  if (t.thumbnailUrl) return t.thumbnailUrl;
  if (t.type === "IMAGE" && t.mediaUrl) return t.mediaUrl;
  if (t.type === "VIDEO_LINK" && t.mediaUrl) {
    const yt = youTubeId(t.mediaUrl);
    if (yt) return `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
  }
  return null;
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "VIDEO", label: "Videos" },
  { key: "IMAGE", label: "Imágenes" },
  { key: "TEXT", label: "Guías" },
];

const TYPE_META: Record<TutorialType, { icon: typeof FileText; label: string }> =
  {
    TEXT: { icon: FileText, label: "Guía" },
    IMAGE: { icon: ImgIcon, label: "Imagen" },
    VIDEO_LINK: { icon: PlayCircle, label: "Video" },
  };

function TypeBadge({ type }: { type: TutorialType }) {
  const { icon: Icon, label } = TYPE_META[type];
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function TutorialMedia({ t }: { t: PublicTutorial }) {
  if (t.type === "IMAGE" && t.mediaUrl) {
    return (
      <img
        src={t.mediaUrl}
        alt={t.title}
        className="max-h-[70vh] w-full rounded-xl bg-black/30 object-contain"
      />
    );
  }
  if (t.type === "VIDEO_LINK" && t.mediaUrl) {
    const embed = toEmbedUrl(t.mediaUrl);
    if (embed) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={embed}
            title={t.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <a
        href={t.mediaUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-gaming inline-flex items-center gap-2">
        <ExternalLink className="h-4 w-4" /> Ver video
      </a>
    );
  }
  return null;
}

const Tutoriales = () => {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [active, setActive] = useState<PublicTutorial | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tutorials-public"],
    queryFn: ({ signal }) => getTutorials(signal),
    staleTime: 60_000,
  });

  const tutorials = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return tutorials;
    return tutorials.filter((t) => groupOf(t.type) === filter);
  }, [tutorials, filter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto max-w-5xl px-4 py-12">
        <header className="mb-6 flex items-center gap-3">
          <GraduationCap className="h-9 w-9 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Tutoriales e <span className="gradient-text">instrucciones</span>
            </h1>
            <p className="text-muted-foreground">
              Guías paso a paso para comprar y recargar sin enredos.
            </p>
          </div>
        </header>

        {/* Filtros por tipo */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const activeChip = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  activeChip
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}>
                {f.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/40 p-10 text-center text-muted-foreground">
            Aún no hay tutoriales publicados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => {
              const thumb = thumbFor(t);
              const isVideo = groupOf(t.type) === "VIDEO";
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={t.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {t.type === "TEXT" ? (
                          <FileText className="h-10 w-10 text-muted-foreground/60" />
                        ) : (
                          <PlayCircle className="h-12 w-12 text-muted-foreground/60" />
                        )}
                      </div>
                    )}
                    {isVideo ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-white/90 drop-shadow-lg" />
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <TypeBadge type={t.type} />
                    <h3 className="line-clamp-2 font-semibold leading-tight text-foreground">
                      {t.title}
                    </h3>
                    {t.description ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Detalle */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto">
          {active ? (
            <>
              <DialogHeader className="pr-8">
                <TypeBadge type={active.type} />
                <DialogTitle className="break-words text-base text-foreground sm:text-lg">
                  {active.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <TutorialMedia t={active} />
                {active.description ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {active.description}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tutoriales;
