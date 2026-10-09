// Browser-only map (Leaflet + OpenStreetMap tiles, no API key).
// Browser-only map; this SPA does not render it on the server.
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY } from "@/config/city";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  color: string;
  label: string;
}

export default function FaultMap({
  points,
  circle,
  onPick,
  focusPoint = false,
  height = 320,
}: {
  points: MapPoint[];
  circle?: { lat: number; lng: number; radiusKm: number };
  onPick?: (p: { lat: number; lng: number }) => void;
  focusPoint?: boolean;
  height?: number;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [layer, setLayer] = useState<L.LayerGroup | null>(null);
  const pick = useRef(onPick);
  pick.current = onPick;

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { scrollWheelZoom: false })
      .setView([CITY.center.lat, CITY.center.lng], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(m);
    m.on("click", (e) => pick.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
    const markers = L.layerGroup().addTo(m);
    map.current = m;
    setLayer(markers);
    return () => {
      m.remove();
      map.current = null;
      setLayer(null);
    };
  }, []);

  useEffect(() => {
    const g = layer;
    if (!g) return;
    g.clearLayers();
    if (circle) {
      L.circle([circle.lat, circle.lng], {
        radius: circle.radiusKm * 1000,
        color: "#e0b100",
        fillOpacity: 0.08,
      }).addTo(g);
      L.marker([circle.lat, circle.lng], {
        icon: L.divIcon({
          className: "",
          html: '<div style="width:14px;height:14px;border-radius:50%;background:#e0b100;border:2px solid #1f3d2b"></div>',
        }),
      }).addTo(g);
    }
    points.forEach((p) => {
      const popup = document.createElement("span");
      popup.textContent = p.label;
      L.circleMarker([p.lat, p.lng], {
        radius: 8,
        color: "#fff",
        weight: 2,
        fillColor: p.color,
        fillOpacity: 0.95,
      })
        .bindPopup(popup)
        .addTo(g);
    });
    if (focusPoint && points.length === 1) {
      const point = points[0];
      map.current?.setView([point.lat, point.lng], Math.max(map.current.getZoom(), 15));
    }
  }, [layer, points, circle, focusPoint]);

  return (
    <div
      ref={el}
      className="map-frame"
      style={{ height }}
      role="application"
      aria-label="Map of reported service issues"
    />
  );
}