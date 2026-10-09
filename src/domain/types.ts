export type Category =
  | "pothole" | "traffic_light" | "waste" | "streetlight" | "water_leak"
  | "road_sign" | "sidewalk" | "blocked_drain" | "illegal_dumping"
  | "power_outage" | "vandalism" | "other";

export type Status = "submitted" | "assigned" | "in_progress" | "resolved" | "rejected";

export interface HistoryEntry {
  status: Status;
  at: string;
  by: string;
  note?: string;
  photo?: string;
}

export interface ServiceRequest {
  id: string;
  category: Category;
  description: string;
  lat: number;
  lng: number;
  photo?: string | undefined;
  status: Status;
  version: number;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
  reporterDeviceId: string;
  source: "web";
  syncState: "pending" | "synced";
  assignedTo?: string | undefined;
  assignedName?: string | undefined;
  assignedWorkerIds?: string[] | undefined;
  teamLeaderId?: string | undefined;
  acceptedAt?: string | undefined;
  trackingNumber?: string | undefined;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  pothole: "Pothole",
  traffic_light: "Traffic light broken",
  waste: "Bins not collected",
  streetlight: "Street light out",
  water_leak: "Water leak",
  road_sign: "Broken road sign",
  sidewalk: "Broken sidewalk",
  blocked_drain: "Blocked drain",
  illegal_dumping: "Illegal dumping",
  power_outage: "Power outage",
  vandalism: "Vandalism",
  other: "Something else",
};

export const STATUS_LABEL: Record<Status, string> = {
  submitted: "Received",
  assigned: "Team assigned",
  in_progress: "Being fixed",
  resolved: "Fixed",
  rejected: "Closed",
};

export type Department = "roads" | "electricity" | "water" | "waste" | "community";

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

export const DEPARTMENT_LABEL: Record<Department, string> = {
  roads: "Roads & Transport",
  electricity: "Electricity",
  water: "Water & Sanitation",
  waste: "Waste Management",
  community: "Community Safety",
};

export const DEPARTMENT_COLOR: Record<Department, string> = {
  roads: "#1f5f3a",
  electricity: "#e0b100",
  water: "#1d6fb8",
  waste: "#7a4a1e",
  community: "#b8322a",
};

export const CATEGORY_DEPARTMENT: Record<Category, Department> = {
  pothole: "roads",
  traffic_light: "roads",
  road_sign: "roads",
  sidewalk: "roads",
  streetlight: "electricity",
  power_outage: "electricity",
  water_leak: "water",
  blocked_drain: "water",
  waste: "waste",
  illegal_dumping: "waste",
  vandalism: "community",
  other: "community",
};

export const departmentOf = (r: { category: Category }) => CATEGORY_DEPARTMENT[r.category];

export const assignedWorkerIdsOf = (
  request: Pick<ServiceRequest, "assignedTo" | "assignedWorkerIds">,
) => request.assignedWorkerIds ?? (request.assignedTo ? [request.assignedTo] : []);

export const isAssignedToWorker = (
  request: Pick<ServiceRequest, "assignedTo" | "assignedWorkerIds">,
  workerId: string,
) => assignedWorkerIdsOf(request).includes(workerId);

// Older reports have no stored number; derive a stable one from the id.
export const trackingOf = (r: { id: string; trackingNumber?: string | undefined }) =>
  r.trackingNumber ?? `TSH-${r.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

export const isOpen = (r: { status: Status }) =>
  r.status !== "resolved" && r.status !== "rejected";