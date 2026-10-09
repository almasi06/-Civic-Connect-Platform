import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { CheckCircle2, MapPin, Camera } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { CATEGORY_LABEL, type Category, trackingOf } from "@/domain/types";
import { createRequest } from "@/domain/requestFactory";
import { requestRepository } from "@/persistence/requestRepository";
import { deviceId, getLocation, insideCity } from "@/lib/device";
import { checkAndCompress } from "@/lib/photo";
import { CITY } from "@/config/city";

export const Route = createFileRoute("/report")({
  component: ReportPage,
});

const schema = z.object({ description: z.string().trim().max(500) });
const FaultMap = lazy(() => import("@/components/FaultMap"));

function ReportPage() {
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState("");
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string>();
  const [photoName, setPhotoName] = useState("");
  const [err, setErr] = useState("");
  const [locationBusy, setLocationBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const mapCircle = useMemo(
    () => ({ ...CITY.center, radiusKm: CITY.radiusKm }),
    [],
  );
  const mapPoints = useMemo(
    () => loc ? [{
      id: "selected-location",
      ...loc,
      color: "#287a32",
      label: "Live report location",
    }] : [],
    [loc],
  );

  const askLocation = async () => {
    setErr("");
    setLoc(null);
    setLocationBusy(true);
    try {
      const p = await getLocation();
      if (!insideCity(p)) {
        setErr(`Your live location is outside ${CITY.name}. Reports can only be sent from inside the city.`);
        return;
      }
      setLoc(p);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not get your live location.");
    } finally {
      setLocationBusy(false);
    }
  };

  const onPhoto = async (f?: File) => {
    if (!f) return;
    setErr("");
    setPhotoBusy(true);
    try {
      const result = await checkAndCompress(f);
      if (result.ok) {
        setPhoto(result.dataUrl);
        setPhotoName(f.name);
      } else {
        setErr(result.reason);
      }
    } finally {
      setPhotoBusy(false);
    }
  };

  const submit = async () => {
    if (!category || !loc) return;
    setErr("");
    const v = schema.safeParse({ description });
    if (!v.success) return setErr("Description is too long.");
    setSubmitting(true);
    try {
      const liveLocation = await getLocation();
      if (!insideCity(liveLocation)) {
        setLoc(null);
        setErr(`Your live location is outside ${CITY.name}. Reports can only be sent from inside the city.`);
        return;
      }
      setLoc(liveLocation);
      if ("Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission();
      }
      const created = createRequest(category, {
        description: v.data.description,
        ...liveLocation,
        photo,
        deviceId: deviceId(),
      });
      requestRepository.add(created);
      setDone(trackingOf(created));
    } catch (error) {
      setLoc(null);
      setErr(error instanceof Error ? error.message : "Could not send your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AppShell>
        <div className="card success-screen">
          <CheckCircle2 size={64} style={{ color: "var(--primary)" }} />
          <h1>Thank you! Report sent.</h1>
          <p>Your tracking number:</p>
          <p className="tracking">{done}</p>
          <p className="muted small">Your reports and their latest status are available on the tracking page.</p>
          <p className="muted">
            We will let you know when it is fixed. If you are offline, it will send automatically later.
          </p>
          <div className="row-wrap center mt-4">
            <Link to="/track" search={{ n: done }} className="btn btn-accent btn-lg">Track it</Link>
            <Link to="/" className="btn btn-primary btn-lg">Back home</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="stack-lg">
          <section className="wizard-step">
            <h2>1. What is the problem?</h2>
            <div className="category-grid">
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`category-btn ${category === c ? "selected" : ""}`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </section>

          <section className="wizard-step">
            <h2>2. Where is it?</h2>
            <button
              className={`btn btn-lg btn-block ${loc ? "btn-outline" : "btn-primary"}`}
              onClick={askLocation}
              disabled={locationBusy || submitting}
            >
              <MapPin size={20} /> {locationBusy ? "Getting live location…" : loc ? "Refresh live location" : "Share my live location"}
            </button>
            <p className="muted small mt-2">
              Allow location access in your browser when asked. Your current location must be inside {CITY.name}.
            </p>
            <Suspense fallback={
              <div className="map-frame map-loading" style={{ height: 280 }} role="status">
                Loading map…
              </div>
            }>
              <FaultMap
                points={mapPoints}
                circle={mapCircle}
                focusPoint
                height={280}
              />
            </Suspense>
            {loc && (
              <p className="muted small mt-2" aria-live="polite">
                Live location: {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
              </p>
            )}
          </section>

          <section className="wizard-step">
            <h2>
              3. Add a photo{" "}
              <span className="muted small">(optional)</span>
            </h2>
            <label className="photo-btn">
              <Camera size={20} />
              {photoBusy ? "Adding photo…" : photo ? "Change photo" : "Add photo or choose from device"}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const input = event.currentTarget;
                  void onPhoto(input.files?.[0]);
                  input.value = "";
                }}
              />
            </label>
            {photo && (
              <>
                <p className="muted small" aria-live="polite">Attached: {photoName}</p>
                <img src={photo} alt={`Photo attached: ${photoName}`} className="photo-preview" />
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => {
                    setPhoto(undefined);
                    setPhotoName("");
                  }}
                >
                  Remove photo
                </button>
              </>
            )}
          </section>

          <section className="wizard-step">
            <h2>
              4. Anything else?{" "}
              <span className="muted small">(optional)</span>
            </h2>
            <textarea
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              placeholder="e.g. Big hole near the school gate"
            />
          </section>

          {err && (
            <p role="alert" className="field-error card">{err}</p>
          )}

          <button
            className="btn btn-accent btn-lg btn-block"
            disabled={!category || !loc || photoBusy || locationBusy || submitting}
            onClick={submit}
          >
            {submitting ? "Sending report…" : "Send report"}
          </button>
          {(!category || !loc) && (
            <p className="center muted small">
              Choose a problem and share your location to send.
            </p>
          )}
      </div>
    </AppShell>
  );
}