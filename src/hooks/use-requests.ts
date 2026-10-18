import { useEffect, useState } from "react";
import { requestRepository } from "@/persistence/requestRepository";
import type { ServiceRequest } from "@/domain/types";

export function useRequests() {
  const [list, setList] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    const load = () => setList(requestRepository.list());
    
    // 1. Load from local cache immediately (fast UI)
    load();
    
    // 2. Fetch fresh data from the backend (source of truth)
    void requestRepository.refresh().then(load).catch(console.error);

    // 3. Subscribe to local storage changes
    const off = requestRepository.subscribe(load);
    const online = () => {
      void requestRepository.sync().then(() => requestRepository.refresh().then(load));
    };
    
    window.addEventListener("online", online);
    
    return () => {
      off();
      window.removeEventListener("online", online);
    };
  }, []);
  
  return list;
}

export function useOnline() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(navigator.onLine);
    const a = () => setOn(true);
    const b = () => setOn(false);
    window.addEventListener("online", a);
    window.addEventListener("offline", b);
    return () => {
      window.removeEventListener("online", a);
      window.removeEventListener("offline", b);
    };
  }, []);
  return on;
}