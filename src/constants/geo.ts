import type { LatLng } from '@/lib/geo/types';

/** Posisi awal (simulasi) bila GPS belum tersedia. */
export const DEFAULT_CENTER: LatLng = { latitude: -7.9797, longitude: 112.6304 };

/** Tampilan awal peta: seluruh Jawa Timur. */
export const JATIM_REGION = {
  latitude: -7.75,
  longitude: 112.75,
  latitudeDelta: 4.2,
  longitudeDelta: 4.2,
};

export const JATIM_ZOOM = 8;
