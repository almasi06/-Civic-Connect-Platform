// Search / filter / sort for service requests.
//
// TODO(Member 2): mirror as GET /api/requests?q=&status=&category=&department=&sort=
import {
  CATEGORY_LABEL, DEPARTMENT_LABEL, departmentOf, isOpen, trackingOf,
  type ServiceRequest,
} from "./types";
import { distanceKm } from "@/lib/device";

export type SortKey = "newest" | "oldest" | "updated" | "category" | "status" | "distance";

export interface RequestQuery {
  q?: string;
  status?: string;
  category?: string;
  department?: string;
  sort?: SortKey;
  near?: { lat: number; lng: number; radiusKm: number } | undefined;
}

export function queryRequests(list: ServiceRequest[], f: RequestQuery): ServiceRequest[] {
  const q = (f.q ?? "").trim().toLowerCase();
  let out = list.filter((r) => {
    if (f.status && f.status !== "any" && (f.status === "open" ? !isOpen(r) : r.status !== f.status)) return false;
    if (f.category && f.category !== "any" && r.category !== f.category) return false;
    if (f.department && f.department !== "any" && departmentOf(r) !== f.department) return false;
    if (f.near && distanceKm(r, f.near) > f.near.radiusKm) return false;
    if (!q) return true;
    const hay = [
      trackingOf(r),
      CATEGORY_LABEL[r.category],
      DEPARTMENT_LABEL[departmentOf(r)],
      r.description,
      r.assignedName ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const near = f.near;
  const by: Record<SortKey, (a: ServiceRequest, b: ServiceRequest) => number> = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
    updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
    category: (a, b) => CATEGORY_LABEL[a.category].localeCompare(CATEGORY_LABEL[b.category]),
    status: (a, b) => a.status.localeCompare(b.status),
    distance: (a, b) => (near ? distanceKm(a, near) - distanceKm(b, near) : 0),
  };

  out = [...out].sort(by[f.sort ?? "newest"]);
  return out;
}