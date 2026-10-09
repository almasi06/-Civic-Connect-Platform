import { API, API_BASE_URL } from "@/config/city";
import { authHeader } from "./auth";
import type { Team } from "@/domain/types";

export type TeamInput = Omit<Team, "id" | "createdAt" | "updatedAt">;
export type WorkerTeam = Pick<Team, "id" | "name" | "department" | "contactEmail" | "contactPhone">;

async function teamRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...authHeader(),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : `Team request failed (${response.status}).`;
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export function listTeams(): Promise<Team[]> {
  return teamRequest<Team[]>(API.TEAMS);
}

export function listMyTeams(): Promise<WorkerTeam[]> {
  return teamRequest<WorkerTeam[]>(`${API.TEAMS}/mine`);
}

export function saveTeam(input: TeamInput, id?: string): Promise<Team> {
  return teamRequest<Team>(id ? `${API.TEAMS}/${encodeURIComponent(id)}` : API.TEAMS, {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(input),
  });
}

export function removeTeam(id: string): Promise<void> {
  return teamRequest<void>(`${API.TEAMS}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
