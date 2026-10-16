// =============================================================================
// In-process domain event bus (backend).
//
// Events are raised ONLY after a database transaction commits.
// Mirrors frontend src/domain/events.ts, but uses backend types.
// =============================================================================
import type { ServiceRequest, Status } from "../types";

export interface StatusChanged {
  type: "StatusChanged";
  version: 1;
  request: ServiceRequest;
  from: Status;
  to: Status;
}

type Observer = (e: StatusChanged) => void;
const observers = new Set<Observer>();

export const eventBus = {
  subscribe(o: Observer) {
    observers.add(o);
    return () => {
      observers.delete(o);
    };
  },
  raise(e: StatusChanged) {
    observers.forEach((o) => {
      try {
        o(e);
      } catch (err) {
        console.error("[eventBus] observer failed:", err);
      }
    });
  },
};