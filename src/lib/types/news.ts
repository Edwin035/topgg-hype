export type NewsPublic = {
  id: string;

  imagenPromo: string;

  titulo: string;

  descripcion: string;

  urlNoticia: string;

  publishFrom: string; // ISO string

  publishTo: string; // ISO string

  dispo: boolean; // siempre true en public, pero lo dejamos por consistencia
};

export type NewsAdmin = NewsPublic & {
  tenantId?: string;

  createdAt?: string;

  updatedAt?: string;
};
