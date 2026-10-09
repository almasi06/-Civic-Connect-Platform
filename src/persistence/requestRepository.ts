// Repository (persistence layer).
//
// For now, everything is stored on-device in localStorage so the app works
// offline. Member 2 will replace the localStorage calls below with the
// Express + Prisma + Postgres API. Search for `DB NOTE` to find every spot.
import { API_BASE_URL, API } from "@/config/city";
import { authHeader } from "@/application/auth";
import type { HistoryEntry, ServiceRequest, Status } from "@/domain/types";

const KEY = "cc.requests";
const listeners = new Set<() => void>();

// =============================================================================
// DB NOTE — this is the storage engine today.
// When the backend is ready, replace the two functions below with:
//
//   const prisma = new PrismaClient();                     // src/server/db.ts
//   async function read() { return prisma.request.findMany(); }
//   async function write(all) { /* upsert each row with version lock */ }
//
// Every caller in this file already funnels through `read()` and `write()` so
// the swap is localized to this one file.
// =============================================================================
function read(): ServiceRequest[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(all: ServiceRequest[]) {
  // DB NOTE: the Postgres/Prisma equivalent is a transaction that upserts
  // every row whose syncState is "pending", then flips it back to "synced".
  localStorage.setItem(KEY, JSON.stringify(all));
  listeners.forEach((l) => l());
}

function reportSyncError(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cc-alert", {
    detail: { title: "Could not sync reports", body: message },
  }));
}

export const requestRepository = {
  list: () => read().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  get: (id: string) => read().find((r) => r.id === id),

  add(r: ServiceRequest) {
    write([r, ...read()]);
    void this.sync();
  },

  // DB NOTE: single SQL transaction —
  //   UPDATE requests SET status=$1, version=version+1, updated_at=now()
  //     WHERE id=$2 AND version=$3;
  //   INSERT INTO request_history(...) VALUES (...);
  updateStatusTx(
    id: string,
    to: Status,
    by: string,
    expectedVersion: number,
    extra?: {
      assignedTo?: string;
      assignedName?: string;
      note?: string;
      photo?: string;
    },
  ) {
    const all = read();
    const i = all.findIndex((r) => r.id === id);
    const cur = all[i];
    if (i < 0 || !cur) throw new Error("Report not found");
    if (cur.version !== expectedVersion)
      throw new Error("This report was changed by someone else. Refresh.");
    const now = new Date().toISOString();
    const updated: ServiceRequest = {
      ...cur,
      status: to,
      version: cur.version + 1,
      updatedAt: now,
      history: [
        ...cur.history,
        {
          status: to,
          at: now,
          by,
          ...(extra?.note ? { note: extra.note } : {}),
          ...(extra?.photo ? { photo: extra.photo } : {}),
        },
      ],
      syncState: "pending",
      ...(extra?.assignedTo
        ? { assignedTo: extra.assignedTo, assignedName: extra.assignedName }
        : {}),
    };
    all[i] = updated;
    write(all);
    void this.sync();
    return updated;
  },

  assignWorkersTx(
    id: string,
    expectedVersion: number,
    by: string,
    workers: { id: string; name: string }[],
    teamLeaderId?: string,
  ) {
    const all = read();
    const i = all.findIndex((request) => request.id === id);
    const current = all[i];
    if (!current) throw new Error("Report not found");
    if (current.version !== expectedVersion) {
      throw new Error("This report was changed by someone else. Refresh.");
    }
    if (teamLeaderId && !workers.some((worker) => worker.id === teamLeaderId)) {
      throw new Error("The team leader must be one of the assigned workers.");
    }

    const assignedWorkerIds = workers.map((worker) => worker.id);
    const leader = workers.find((worker) => worker.id === teamLeaderId);
    const now = new Date().toISOString();
    const updated: ServiceRequest = {
      ...current,
      assignedWorkerIds,
      teamLeaderId: leader?.id,
      assignedTo: leader?.id ?? workers[0]?.id,
      assignedName: leader?.name ?? workers[0]?.name,
      version: current.version + 1,
      updatedAt: now,
      syncState: "pending",
      history: [
        ...current.history,
        {
          status: current.status,
          at: now,
          by,
          note: workers.length
            ? `Team assignment updated: ${workers.map((worker) => worker.name).join(", ")}${leader ? `; team leader: ${leader.name}` : ""}`
            : "All team members removed from this report",
        },
      ],
    };
    all[i] = updated;
    write(all);
    void this.sync();
    return updated;
  },

  // DB NOTE: same pattern as updateStatusTx — version-locked UPDATE + history INSERT.
  patchTx(id: string, expectedVersion: number, patch: Partial<ServiceRequest>, entry: HistoryEntry) {
    const all = read();
    const i = all.findIndex((r) => r.id === id);
    const cur = all[i];
    if (i < 0 || !cur) throw new Error("Report not found");
    if (cur.version !== expectedVersion)
      throw new Error("This report was changed by someone else. Refresh.");
    const now = new Date().toISOString();
    const updated: ServiceRequest = {
      ...cur,
      ...patch,
      version: cur.version + 1,
      updatedAt: now,
      syncState: "pending",
      history: [...cur.history, { ...entry, at: now }],
    };
    all[i] = updated;
    write(all);
    void this.sync();
    return updated;
  },

  subscribe(l: () => void) {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => e.key === KEY && l();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  },

  async refresh() {
    if (typeof navigator === "undefined" || !navigator.onLine) return;
    const response = await fetch(`${API_BASE_URL}${API.REQUESTS}`, {
      headers: { ...authHeader() },
    });
    if (!response.ok) {
      throw new Error(`Could not load reports from the API (${response.status}).`);
    }

    const remote = (await response.json()) as ServiceRequest[];
    const local = read();
    const merged = new Map(remote.map((request) => [request.id, request]));
    for (const request of local) {
      const serverRequest = merged.get(request.id);
      if (!serverRequest || (request.syncState === "pending" && request.version > serverRequest.version)) {
        merged.set(request.id, request);
      }
    }
    write([...merged.values()]);
  },

  async sync() {
    if (typeof navigator === "undefined" || !navigator.onLine) return;
    const pending = read().filter((r) => r.syncState === "pending");
    if (!pending.length) return;

    // DB NOTE: the real endpoint (POST /api/sync) upserts each pending row
    // into Postgres using the same optimistic-concurrency check as
    // updateStatusTx. If a row is stale it is dropped from the response so
    // the client knows to re-fetch.
    try {
      const res = await fetch(`${API_BASE_URL}${API.SYNC}`, {
        method: "POST",
        headers: { "content-type": "application/json", ...authHeader() },
        body: JSON.stringify({ requests: pending }),
      });
      if (!res.ok) {
        reportSyncError(`The API rejected the sync request (${res.status}).`);
        return;
      }
      const { accepted } = (await res.json()) as { accepted: string[] };
      const ids = new Set(accepted);
      write(read().map((r) => (ids.has(r.id) ? { ...r, syncState: "synced" } : r)));
    } catch (error) {
      if (navigator.onLine) {
        reportSyncError(error instanceof Error ? error.message : "The API could not be reached.");
      }
    }
  },
};