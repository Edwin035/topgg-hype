import { http } from "./http";

export type TutorialType = "TEXT" | "IMAGE" | "VIDEO_LINK";

export interface PublicTutorial {
  id: string;
  title: string;
  description?: string | null;
  type: TutorialType;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  createdAt?: string;
}

/** Tutoriales publicados (disponibles, ordenados). Público. */
export function getTutorials(signal?: AbortSignal) {
  return http<PublicTutorial[]>("/tutorials", { method: "GET", signal });
}
