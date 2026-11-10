import type { LatLng } from '@/lib/geo/types';

export type Route = {
  coordinates: LatLng[];
  distanceM: number;
  durationS: number;
};

const MAX_POINTS = 800;

/** Kurangi jumlah titik (rute panjang bisa ribuan titik) tanpa membuang titik awal dan akhir. */
export function decimate<T>(points: T[], max = MAX_POINTS): T[] {
  if (points.length <= max) return points;
  const step = (points.length - 1) / (max - 1);
  const out: T[] = [];
  for (let i = 0; i < max - 1; i++) out.push(points[Math.round(i * step)]);
  out.push(points[points.length - 1]);
  return out;
}

type OsrmResponse = {
  code: string;
  routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
};

/**
 * Rute tercepat via OSRM (profil mobil). Memakai server demo publik OSRM:
 * cukup untuk tugas/demo, bukan untuk produksi. Untuk produksi host OSRM/Valhalla sendiri.
 */
export async function fetchFastestRoute(from: LatLng, to: LatLng, signal?: AbortSignal): Promise<Route> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    `?overview=full&geometries=geojson&alternatives=false&steps=false`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Layanan rute error (${res.status})`);
  const json = (await res.json()) as OsrmResponse;
  const best = json.routes?.[0];
  if (json.code !== 'Ok' || !best) throw new Error('Rute tidak ditemukan');

  const coordinates = best.geometry.coordinates.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
  return { coordinates: decimate(coordinates), distanceM: best.distance, durationS: best.duration };
}

/** 540 -> "9 mnt", 4500 -> "1 j 15 mnt". */
export function formatDuration(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return `${mins} mnt`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} j` : `${h} j ${m} mnt`;
}
