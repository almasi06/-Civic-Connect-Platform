// Factory Method: one creator per category, no branching intake.
import type { Category, ServiceRequest } from "./types";

type Input = {
  description: string;
  lat: number;
  lng: number;
  photo?: string | undefined;
  deviceId: string;
};

function base(category: Category, i: Input): ServiceRequest {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  return {
    id,
    trackingNumber: `TSH-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
    category,
    description: i.description.trim().slice(0, 500),
    lat: i.lat,
    lng: i.lng,
    photo: i.photo,
    status: "submitted",
    version: 1,
    createdAt: now,
    updatedAt: now,
    history: [{ status: "submitted", at: now, by: "citizen" }],
    reporterDeviceId: i.deviceId,
    source: "web",
    syncState: "pending",
  };
}

const factories: Record<Category, (i: Input) => ServiceRequest> = {
  pothole: (i) => base("pothole", i),
  traffic_light: (i) => base("traffic_light", i),
  waste: (i) => base("waste", i),
  streetlight: (i) => base("streetlight", i),
  water_leak: (i) => base("water_leak", i),
  road_sign: (i) => base("road_sign", i),
  sidewalk: (i) => base("sidewalk", i),
  blocked_drain: (i) => base("blocked_drain", i),
  illegal_dumping: (i) => base("illegal_dumping", i),
  power_outage: (i) => base("power_outage", i),
  vandalism: (i) => base("vandalism", i),
  other: (i) => base("other", i),
};

export const createRequest = (c: Category, i: Input) => factories[c](i);