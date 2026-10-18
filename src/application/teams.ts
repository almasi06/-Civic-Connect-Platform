import { API_BASE_URL, API } from "@/config/city";
import { authHeader } from "@/application/auth";
import type { Team } from "@/domain/types";

export interface TeamInput {
  name: string;
  description: string;
  department: string;
  contactEmail: string;
  contactPhone: string;
  workerIds: string[];
}

export type WorkerTeam = Pick<Team, "id" | "name" | "department" | "contactEmail" | "contactPhone">;

export async function listTeams(): Promise<Team[]> {
  const res = await fetch(`${API_BASE_URL}/api/teams`, { headers: authHeader() });
  if (!res.ok) throw new Error("Could not load teams.");
  return await res.json();
}

export async function saveTeam(form: TeamInput, id?: string): Promise<Team> {
  const url = id 
    ? `${API_BASE_URL}/api/teams/${id}` 
    : `${API_BASE_URL}/api/teams`;
    
  const res = await fetch(url, {
    method: id ? "PATCH" : "POST",
    headers: { "content-type": "application/json", ...authHeader() },
    body: JSON.stringify(form),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Could not save team.");
  }
  return await res.json();
}

export async function removeTeam(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Could not delete team.");
}

export async function listMyTeams(): Promise<WorkerTeam[]> {
  const res = await fetch(`${API_BASE_URL}/api/teams/mine`, { headers: authHeader() });
  if (!res.ok) throw new Error("Could not load your teams.");
  return await res.json();
}