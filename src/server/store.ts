// =============================================================================
// DB NOTE — this is the ONLY file that touches storage.
//
// When Member 2 wires Postgres:
//   1. Add `src/server/db.ts` exporting a PrismaClient.
//   2. Replace the Map below with Prisma queries.
//   3. Nothing else in `src/server/` needs to change.
//
// Everything in this file is currently in-memory, so restarting the dev server
// loses all reports. That is intentional: it makes the swap obvious.
// =============================================================================
import type { ServiceRequest, StaffUser, Team } from "./types";

const seededTeams: Array<Omit<Team, "createdAt" | "updatedAt">> = [
  {
    id: "team-roads",
    name: "Roads & Transport",
    description: "Road maintenance, traffic signals, signs, and sidewalks.",
    department: "roads",
    contactEmail: "roads@tshwane.gov.za",
    contactPhone: "",
    workerIds: ["worker-1"],
  },
  {
    id: "team-electricity",
    name: "Electricity Services",
    description: "Street lighting and power infrastructure.",
    department: "electricity",
    contactEmail: "electricity@tshwane.gov.za",
    contactPhone: "",
    workerIds: [],
  },
  {
    id: "team-water",
    name: "Water & Sanitation",
    description: "Water leaks, drains, and sanitation infrastructure.",
    department: "water",
    contactEmail: "water@tshwane.gov.za",
    contactPhone: "",
    workerIds: [],
  },
  {
    id: "team-waste",
    name: "Waste Management",
    description: "Waste collection and illegal dumping response.",
    department: "waste",
    contactEmail: "waste@tshwane.gov.za",
    contactPhone: "",
    workerIds: ["worker-2"],
  },
  {
    id: "team-community",
    name: "Community Safety",
    description: "Vandalism and community safety reports.",
    department: "community",
    contactEmail: "safety@tshwane.gov.za",
    contactPhone: "",
    workerIds: [],
  },
];

const seededAt = new Date().toISOString();

export const store = {
  requests: new Map<string, ServiceRequest>(),
  users: new Map<string, StaffUser>(),
  teams: new Map<string, Team>(
    seededTeams.map((team) => [
      team.id,
      { ...team, createdAt: seededAt, updatedAt: seededAt },
    ]),
  ),
};

// =============================================================================
// DB NOTE — mock users live here so the login route can be tested before the
// real identity provider is wired in. Delete this block and replace with a
// lookup against the municipal directory.
//
//   Real query: SELECT id, name, email, role, password_hash FROM staff WHERE email = $1
// =============================================================================
export const MOCK_STAFF = [
  { id: "admin-1", name: "Municipal Administrator", email: "admin@tshwane.gov.za", role: "admin" as const, password: "admin1234" },
  { id: "worker-1", name: "Thabo Mokoena", email: "worker@tshwane.gov.za", role: "field_worker" as const, password: "worker1234" },
  { id: "worker-2", name: "Lerato Dlamini", email: "worker2@tshwane.gov.za", role: "field_worker" as const, password: "worker1234" },
];