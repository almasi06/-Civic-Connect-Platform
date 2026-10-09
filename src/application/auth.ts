import { API, API_BASE_URL } from "@/config/city";

export type StaffRole = "admin" | "field_worker";

export interface StaffSession {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  token: string;
}

export interface FieldWorker {
  id: string;
  name: string;
  role: StaffRole;
}

const KEY = "cc.staff";

async function readError(response: Response, fallback: string): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
    return body.message;
  }
  return fallback;
}

export async function login(email: string, password: string): Promise<StaffSession> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  if (normalizedEmail.length > 255 || normalizedPassword.length > 128) {
    throw new Error("Invalid details");
  }

  const response = await fetch(`${API_BASE_URL}${API.LOGIN}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, "Email or password is incorrect"));
  }

  const session = (await response.json()) as StaffSession;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    throw new Error("Your browser blocked sign in. Please allow site storage and try again.");
  }
  return session;
}

export function currentStaff(): StaffSession | null {
  if (typeof window === "undefined") return null;
  try {
    const session: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    if (
      session &&
      typeof session === "object" &&
      "id" in session &&
      typeof session.id === "string" &&
      "name" in session &&
      typeof session.name === "string" &&
      "email" in session &&
      typeof session.email === "string" &&
      "role" in session &&
      (session.role === "admin" || session.role === "field_worker") &&
      "token" in session &&
      typeof session.token === "string"
    ) {
      return session as StaffSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function authHeader(): Record<string, string> {
  const session = currentStaff();
  return session ? { authorization: `Bearer ${session.token}` } : {};
}

export async function logout(): Promise<void> {
  const session = currentStaff();
  try {
    if (session) {
      await fetch(`${API_BASE_URL}${API.LOGOUT}`, {
        method: "POST",
        headers: authHeader(),
      });
    }
  } finally {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* Storage may be disabled; local logout still completes. */
    }
  }
}

export async function fetchFieldWorkers(): Promise<FieldWorker[]> {
  const response = await fetch(`${API_BASE_URL}${API.WORKERS}`, {
    headers: authHeader(),
  });
  if (!response.ok) {
    throw new Error(await readError(response, "Could not load field workers"));
  }
  return (await response.json()) as FieldWorker[];
}
