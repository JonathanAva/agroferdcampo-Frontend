import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DeliveryMapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
  disabled?: boolean;
  height?: number;
}

// Centro aproximado de El Salvador
const DEFAULT_CENTER: L.LatLngExpression = [13.7942, -88.8965];

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;transform:translate(-50%,-100%);position:absolute;left:0;top:0">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="#16a34a" stroke="#fff" stroke-width="1.5">
      <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z"/>
      <circle cx="12" cy="10" r="3" fill="#fff"/>
    </svg></div>`,
  iconSize: [0, 0],
});

/** Mapa (OpenStreetMap) para marcar el punto de entrega con un clic o arrastrando el pin. */
export function DeliveryMapPicker({ lat, lng, onChange, disabled, height = 220 }: DeliveryMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const hasPoint = lat !== undefined && lng !== undefined && Number.isFinite(lat) && Number.isFinite(lng);

  const placeMarker = (map: L.Map, point: L.LatLngExpression) => {
    if (!markerRef.current) {
      markerRef.current = L.marker(point, { icon: pinIcon, draggable: !disabledRef.current }).addTo(map);
      markerRef.current.on("dragend", () => {
        const p = markerRef.current!.getLatLng();
        onChangeRef.current(p.lat, p.lng);
      });
    } else {
      markerRef.current.setLatLng(point);
    }
  };

  // Crear el mapa una sola vez
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: hasPoint ? [lat!, lng!] : DEFAULT_CENTER,
      zoom: hasPoint ? 16 : 8,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    if (hasPoint) placeMarker(map, [lat!, lng!]);

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (disabledRef.current) return;
      placeMarker(map, e.latlng);
      onChangeRef.current(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    // El mapa vive dentro de diálogos con animación: recalcular tamaño
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => map.invalidateSize())
      : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro?.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar cuando cambian las coordenadas desde afuera (link pegado, búsqueda, dirección guardada)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (hasPoint) {
      const current = markerRef.current?.getLatLng();
      if (!current || current.lat !== lat || current.lng !== lng) {
        placeMarker(map, [lat!, lng!]);
        map.setView([lat!, lng!], Math.max(map.getZoom(), 16));
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-lg border border-[var(--border)] overflow-hidden z-0 relative"
    />
  );
}
