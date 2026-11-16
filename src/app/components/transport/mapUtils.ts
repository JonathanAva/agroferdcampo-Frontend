// Utilidades para direcciones de entrega: lectura de links de mapa y geocodificación (OpenStreetMap, gratis)

export interface LatLng {
  lat: number;
  lng: number;
}

const valid = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/**
 * Extrae coordenadas de un link de Google Maps / Waze / OSM / WhatsApp o de un texto "13.69, -89.19".
 * Los links cortos (maps.app.goo.gl) no traen coordenadas: se guardan igual y el pin se marca a mano.
 */
export function parseMapLink(text: string): LatLng | null {
  if (!text) return null;
  let s = text.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    /* texto con % sueltos */
  }

  const patterns: RegExp[] = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/, // Google: datos del lugar (más preciso)
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/, // Google: @lat,lng
    /[?&](?:q|query|ll|destination|daddr|center)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/, // ?q=lat,lng
    /[?&]mlat=(-?\d+(?:\.\d+)?)&mlon=(-?\d+(?:\.\d+)?)/, // OSM
    /^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/, // texto "lat, lng"
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (valid(lat, lng)) return { lat, lng };
    }
  }
  return null;
}

export const isUrl = (text: string) => /^https?:\/\//i.test(text.trim());

/** Busca un texto (dirección) en OpenStreetMap, limitado a El Salvador. */
export async function geocodeAddress(query: string): Promise<LatLng | null> {
  const q = query.trim();
  if (!q) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=sv&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!data.length) return null;
  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);
  return valid(lat, lng) ? { lat, lng } : null;
}

export const googleMapsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/** Link para abrir la ubicación de una dirección guardada (coordenadas o link pegado). */
export function addressMapLink(ref?: { latitude?: any; longitude?: any; mapUrl?: string | null } | null): string | null {
  if (!ref) return null;
  const lat = ref.latitude != null ? Number(ref.latitude) : NaN;
  const lng = ref.longitude != null ? Number(ref.longitude) : NaN;
  if (valid(lat, lng)) return googleMapsUrl(lat, lng);
  if (ref.mapUrl && isUrl(ref.mapUrl)) return ref.mapUrl;
  return null;
}
