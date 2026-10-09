// City configuration. Change these values to deploy CivicConnect for another city.
export const CITY = {
  name: "City of Tshwane",
  municipality: "City of Tshwane Metropolitan Municipality",
  center: { lat: -25.7479, lng: 28.2293 },
  radiusKm: 50,
};

// Leave blank in development to use the Vite proxy; set this for a deployed API.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

/**
 * Every HTTP path the frontend talks to. Import from here — never hardcode
 * a URL inside a component. Member 2 owns the backend that serves these.
 */
export const API = {
  // ---- Auth ----
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  ME: "/api/auth/me",

  // ---- Service requests ----
  REQUESTS: "/api/requests",                     // GET (list), POST (create)
  REQUEST: (id: string) => `/api/requests/${id}`, // GET one, PATCH, DELETE
  REQUEST_STATUS: (id: string) => `/api/requests/${id}/status`, // PATCH status transition
  REQUEST_ACCEPT: (id: string) => `/api/requests/${id}/accept`, // POST job acceptance
  REQUEST_UPDATE: (id: string) => `/api/requests/${id}/update`, // POST field note/photo

  // ---- Staff ----
  WORKERS: "/api/workers",                        // GET list of field workers
  TEAMS: "/api/teams",                            // GET, POST; PATCH /:id

  // ---- Sync (offline queue drain) ----
  SYNC: "/api/sync",                              // POST queued reports

  // ---- Uploads ----
  UPLOAD_PHOTO: "/api/uploads/photo",             // POST multipart
} as const;