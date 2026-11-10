import type { LatLng } from './types';

/** Jari-jari rata-rata bumi (IUGG), dalam meter. */
export const EARTH_RADIUS_M = 6_371_008.8;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Jarak garis lurus (great-circle) antara dua koordinat, dalam meter.
 *
 *   a = sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2)
 *   d = 2R · asin(√a)
 */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  // min(1, …) menjaga dari galat pembulatan floating point di dekat titik antipode.
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type WithDistance<T> = { item: T; distanceM: number };

/** Urutkan item dari yang terdekat ke `origin`. Tidak mengubah array asli. */
export function sortByDistance<T extends { coordinate: LatLng }>(
  origin: LatLng,
  items: readonly T[],
): WithDistance<T>[] {
  return items
    .map((item) => ({ item, distanceM: haversineMeters(origin, item.coordinate) }))
    .sort((x, y) => x.distanceM - y.distanceM);
}

/** Item terdekat ke `origin`, atau null bila daftar kosong. */
export function nearest<T extends { coordinate: LatLng }>(
  origin: LatLng,
  items: readonly T[],
): WithDistance<T> | null {
  return sortByDistance(origin, items)[0] ?? null;
}

/** 850 → "850 m", 1234 → "1,23 km", 15400 → "15,4 km". */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return '-';
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  return `${km.toFixed(km < 10 ? 2 : 1).replace('.', ',')} km`;
}
