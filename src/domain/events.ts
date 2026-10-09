// In-process domain event bus. Events are raised only after commit.
import type { ServiceRequest, Status } from "./types";

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
    return () => observers.delete(o);
  },
  raise(e: StatusChanged) {
    observers.forEach((o) => {
      try {
        o(e);
      } catch (err) {
        console.error("Observer failed", err);
      }
    });
  },
};