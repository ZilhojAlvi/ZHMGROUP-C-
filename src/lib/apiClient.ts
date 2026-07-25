/**
 * Thin wrapper around fetch() for calling our own Next.js API routes.
 * Always sends/receives cookies (httpOnly session cookie) and throws a
 * plain Error with the server's message on non-2xx responses, so existing
 * UI code that does `catch (err) { toast.error(err.message) }` keeps working
 * unchanged.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const message =
      (body as { error?: string } | null)?.error || `Request failed (${res.status}).`;
    throw new Error(message);
  }

  return body as T;
}

export function apiGet<T = unknown>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "GET" });
}

export function apiPost<T = unknown>(path: string, data?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined });
}

export function apiPut<T = unknown>(path: string, data?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "PUT", body: data !== undefined ? JSON.stringify(data) : undefined });
}

export function apiPatch<T = unknown>(path: string, data?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "PATCH", body: data !== undefined ? JSON.stringify(data) : undefined });
}

export function apiDelete<T = unknown>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" });
}
