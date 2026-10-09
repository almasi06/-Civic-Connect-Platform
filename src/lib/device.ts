import { CITY } from "@/config/city";

// DB NOTE: today, "who is this reporter" is a random UUID kept in localStorage.
// When anonymous reports move to Postgres, this becomes a row in `devices` and
// the API returns a deviceToken the client stores instead.
export function deviceId() {
  let id = localStorage.getItem("cc.device");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cc.device", id);
  }
  return id;
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const insideCity = (p: { lat: number; lng: number }) =>
  distanceKm(p, CITY.center) <= CITY.radiusKm;

export function getLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator))
      return reject(new Error("This browser does not support live location sharing."));
    if (!window.isSecureContext)
      return reject(new Error("Live location requires a secure page (HTTPS or localhost)."));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) =>
        reject(
          new Error(
            e.code === 1
              ? "Location permission was denied. Allow location access in your browser settings, then try again."
              : e.code === 2
                ? "Your device could not determine its location. Check that location services are enabled and try again."
                : "Location lookup timed out. Move to an area with a clearer signal and try again.",
          ),
        ),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  });
}