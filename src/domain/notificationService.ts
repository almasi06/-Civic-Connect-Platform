import { trackingOf, type ServiceRequest } from "./types";

const ALERTED_KEY = "cc.alerted";
const SEEN_KEY = "cc.seen";

type SeenRequest = { version: number; status: ServiceRequest["status"] };

function readSeen(): Record<string, SeenRequest> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}") as Record<string, SeenRequest>;
  } catch {
    return {};
  }
}

export function alertIfResolved(request: ServiceRequest) {
  const alerted = new Set<string>(JSON.parse(localStorage.getItem(ALERTED_KEY) ?? "[]") as string[]);
  if (alerted.has(request.id)) return;
  alerted.add(request.id);
  localStorage.setItem(ALERTED_KEY, JSON.stringify([...alerted]));

  const detail = {
    title: "Your report was resolved",
    body: `${trackingOf(request)} — the ${request.category.replaceAll("_", " ")} issue has been resolved.`,
  };
  window.dispatchEvent(new CustomEvent("cc-alert", { detail }));
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(detail.title, { body: detail.body });
  }
}

export function checkForUpdates(requests: ServiceRequest[], deviceId: string) {
  const seen = readSeen();
  for (const request of requests) {
    const previous = seen[request.id];
    if (
      previous &&
      previous.version < request.version &&
      previous.status !== "resolved" &&
      request.status === "resolved" &&
      request.reporterDeviceId === deviceId
    ) {
      alertIfResolved(request);
    }
    seen[request.id] = { version: request.version, status: request.status };
  }
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
}
