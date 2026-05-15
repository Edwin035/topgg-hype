export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "https://hypes.up.railway.app/api";

export const STORE_TOKEN_KEY = "toplevel_access_token";

export const PIN_HYPE_DEFAULTS = {
  country: import.meta.env.VITE_PIN_HYPE_COUNTRY?.trim() || "CO",
  currency: import.meta.env.VITE_PIN_HYPE_CURRENCY?.trim() || "COP",
  language: import.meta.env.VITE_PIN_HYPE_LANGUAGE?.trim() || "es",
  freeFireCollectionId: Number(import.meta.env.VITE_FREE_FIRE_COLLECTION_ID || 2),
};

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: BodyInit | object | null;
  query?: QueryParams;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getStoredToken() {
  return localStorage.getItem(STORE_TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(STORE_TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(STORE_TOKEN_KEY);
}

function buildUrl(path: string, query?: QueryParams) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_URL}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function getErrorMessage(data: any) {
  if (!data) return "Error de conexión con el servidor.";

  if (typeof data.message === "string") return data.message;

  if (Array.isArray(data.message)) return data.message.join(", ");

  if (typeof data.error === "string") return data.error;

  if (typeof data.error?.message === "string") return data.error.message;

  return "Ocurrió un error inesperado.";
}

function isJsonBody(body: unknown) {
  if (!body) return false;

  return (
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams)
  );
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, query, body, headers: customHeaders, ...fetchOptions } = options;

  const authToken = token ?? getStoredToken();
  const headers = new Headers(customHeaders);

  let requestBody: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (isJsonBody(body)) {
      requestBody = JSON.stringify(body);

      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    } else {
      requestBody = body as BodyInit;
    }
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const res = await fetch(buildUrl(path, query), {
    ...fetchOptions,
    headers,
    body: requestBody,
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  const data = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    throw new ApiError(getErrorMessage(data), res.status, data);
  }

  return data as T;
}

/**
 * Alias para compatibilidad con código viejo.
 */
export async function authClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return apiRequest<T>(path, options);
}

/**
 * Alias corto para cualquier módulo.
 */
export async function http<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return apiRequest<T>(path, options);
}