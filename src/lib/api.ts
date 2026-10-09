// Central HTTP client for the app. Every component imports from here so that
// headers, base URL, and error handling live in one place.
//
// TODO(Member 2): when the JWT is moved to an httpOnly cookie, drop the
// `Authorization` header and add `credentials: "include"` to fetch.
import { API, API_BASE_URL } from "@/config/city";
import { authHeader } from "@/application/auth";
import type { ServiceRequest, Status } from "@/domain/types";

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...authHeader(),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export const api = {
  // ---- Requests ----
  listRequests: () => request<ServiceRequest[]>(API.REQUESTS),

  getRequest: (id: string) => request<ServiceRequest>(API.REQUEST(id)),

  createRequest: (payload: ServiceRequest) =>
    request<ServiceRequest>(API.REQUESTS, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  changeStatus: (
    id: string,
    to: Status,
    expectedVersion: number,
    extra?: { assignedTo?: string; assignedName?: string; note?: string; photo?: string },
  ) =>
    request<ServiceRequest>(API.REQUEST_STATUS(id), {
      method: "PATCH",
      body: JSON.stringify({ to, expectedVersion, ...extra }),
    }),

  acceptJob: (id: string, expectedVersion: number) =>
    request<ServiceRequest>(API.REQUEST_ACCEPT(id), {
      method: "POST",
      body: JSON.stringify({ expectedVersion }),
    }),

  fieldUpdate: (id: string, expectedVersion: number, note: string, photo?: string) =>
    request<ServiceRequest>(API.REQUEST_UPDATE(id), {
      method: "POST",
      body: JSON.stringify({ expectedVersion, note, photo }),
    }),

  // ---- Sync ----
  syncQueue: (requests: ServiceRequest[]) =>
    request<{ accepted: string[] }>(API.SYNC, {
      method: "POST",
      body: JSON.stringify({ requests }),
    }),

  // ---- Workers ----
  listWorkers: () => request<{ id: string; name: string }[]>(API.WORKERS),
};