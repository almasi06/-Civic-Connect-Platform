// Shared server-side types. Mirror the client domain types so the network
// contract is obvious. Keep in sync with src/domain/types.ts.
export type Category =
  | "pothole" | "traffic_light" | "waste" | "streetlight" | "water_leak"
  | "road_sign" | "sidewalk" | "blocked_drain" | "illegal_dumping"
  | "power_outage" | "vandalism" | "other";

export type Status = "submitted" | "assigned" | "in_progress" | "resolved" | "rejected";
export type Role = "admin" | "field_worker";

export interface HistoryEntry {
  status: Status;
  at: string;
  by: string;
  note?: string;
  photo?: string;
}

export interface ServiceRequest {
  id: string;
  trackingNumber: string;
  category: Category;
  description: string;
  lat: number;
  lng: number;
  photo?: string;
  status: Status;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
  reporterDeviceId: string;
  source: "web";
  syncState: "pending" | "synced";
  assignedTo?: string;
  assignedName?: string;
  assignedWorkerIds?: string[];
  teamLeaderId?: string;
  acceptedAt?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  token: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  department: string;
  contactEmail: string;
  contactPhone: string;
  workerIds: string[];
  createdAt: string;
  updatedAt: string;
}