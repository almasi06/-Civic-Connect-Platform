import { randomUUID } from "node:crypto";
import { Router } from "express";
import { authenticatedUser } from "../auth";
import { MOCK_STAFF, store } from "../store";
import type { Team } from "../types";

export const teamsRouter = Router();

function isAdmin(req: Parameters<typeof authenticatedUser>[0]) {
  return authenticatedUser(req)?.role === "admin";
}

teamsRouter.get("/mine", (req, res) => {
  const staff = authenticatedUser(req);
  if (!staff || staff.role !== "field_worker") {
    return res.status(403).json({ message: "Field worker access required." });
  }
  const teams = [...store.teams.values()]
    .filter((team) => team.workerIds.includes(staff.id))
    .map(({ id, name, department, contactEmail, contactPhone }) => ({
      id,
      name,
      department,
      contactEmail,
      contactPhone,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  res.json(teams);
});

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text.length <= maxLength ? text : undefined;
}

function validTeamFields(body: unknown):
  | Omit<Team, "id" | "createdAt" | "updatedAt">
  | undefined {
  if (!body || typeof body !== "object") return undefined;
  const input = body as Record<string, unknown>;
  const name = cleanText(input.name, 100);
  const description = cleanText(input.description, 1000);
  const department = cleanText(input.department, 100);
  const contactEmail = cleanText(input.contactEmail, 255);
  const contactPhone = cleanText(input.contactPhone, 50);
  const workerIds = input.workerIds;

  if (
    !name ||
    description === undefined ||
    !department ||
    contactEmail === undefined ||
    contactPhone === undefined ||
    !Array.isArray(workerIds) ||
    !workerIds.every((id) => typeof id === "string") ||
    workerIds.some((id) => !MOCK_STAFF.some((worker) => worker.id === id && worker.role === "field_worker")) ||
    (contactEmail !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
  ) {
    return undefined;
  }

  return {
    name,
    description,
    department,
    contactEmail,
    contactPhone,
    workerIds: [...new Set(workerIds as string[])],
  };
}

teamsRouter.get("/", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
  res.json([...store.teams.values()].sort((a, b) => a.name.localeCompare(b.name)));
});

teamsRouter.post("/", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
  const fields = validTeamFields(req.body);
  if (!fields) return res.status(400).json({ message: "Enter valid team details and select valid workers." });

  const now = new Date().toISOString();
  const team: Team = { id: randomUUID(), ...fields, createdAt: now, updatedAt: now };
  store.teams.set(team.id, team);
  res.status(201).json(team);
});

teamsRouter.patch("/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
  const existing = store.teams.get(req.params.id);
  if (!existing) return res.status(404).json({ message: "Team not found." });
  const fields = validTeamFields(req.body);
  if (!fields) return res.status(400).json({ message: "Enter valid team details and select valid workers." });

  const updated: Team = { ...existing, ...fields, updatedAt: new Date().toISOString() };
  store.teams.set(updated.id, updated);
  res.json(updated);
});

teamsRouter.delete("/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Admin access required." });
  if (!store.teams.has(req.params.id)) {
    return res.status(404).json({ message: "Team not found." });
  }
  store.teams.delete(req.params.id);
  res.json({ ok: true });
});
