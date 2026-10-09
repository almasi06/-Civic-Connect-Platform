import { useEffect, useState, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import { CITY } from "@/config/city";
import { getLocation, insideCity } from "@/lib/device";

/**
 * Restricts citizen access to people inside the city.
 * Result is remembered for 12h so offline use still works.
 *
 * TODO(Member 2): also enforce server-side (IP geolocation or signed location
 * check) in the API. A user can spoof this client-side check trivially.
 */
const KEY = "cc.cityCheck";
type State = "unknown" | "checking" | "inside" | "outside" | "error";

export function CityGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("unknown");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (
        saved &&
        typeof saved === "object" &&
        "ok" in saved &&
        saved.ok === true &&
        "at" in saved &&
        typeof saved.at === "number" &&
        saved.at <= Date.now() &&
        Date.now() - saved.at < 12 * 3600e3
      ) {
        setState("inside");
      }
    } catch (error) {
      console.warn("Could not read the saved city check.", error);
    }
  }, []);

  const check = async () => {
    setState("checking");
    try {
      const p = await getLocation();
      const ok = insideCity(p);
      try {
        localStorage.setItem(KEY, JSON.stringify({ ok, at: Date.now() }));
      } catch (error) {
        console.warn("Could not save the city check.", error);
      }
      setState(ok ? "inside" : "outside");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Could not check your location.");
      setState("error");
    }
  };

  if (state === "inside") return <>{children}</>;

  return (
    <div className="gate">
      <MapPin size={48} />
      {state === "outside" ? (
        <>
          <h1>Sorry, this service is only for {CITY.name}</h1>
          <p className="muted">Your location is outside the city.</p>
        </>
      ) : (
        <>
          <h1>Are you in {CITY.name}?</h1>
          <p className="muted">
            This service is only for people in {CITY.name}. Your phone will ask if you
            allow us to see your location. Please press <b>Allow</b>.
          </p>
          {state === "error" && <p className="field-error">{msg}</p>}
          <button
            type="button"
            className="btn btn-primary btn-lg btn-block mt-4"
            onClick={check}
            disabled={state === "checking"}
          >
            {state === "checking" ? "Checking…" : "Check my location"}
          </button>
        </>
      )}
    </div>
  );
}