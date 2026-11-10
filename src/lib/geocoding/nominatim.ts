import { Platform } from 'react-native';

import type { LatLng } from '@/lib/geo/types';

export type GeocodeResult = {
  id: string;
  title: string;
  subtitle: string;
  coordinate: LatLng;
};

/** Batas kasar Jawa Timur (kiri,atas,kanan,bawah) agar hasil pencarian tidak melenceng ke provinsi lain. */
const JATIM_VIEWBOX = '111.0,-6.8,114.6,-8.8';

type NominatimItem = { place_id: number; display_name: string; lat: string; lon: string };

/**
 * Cari alamat lewat Nominatim (OpenStreetMap). Kebijakan layanan: maks. 1 permintaan/detik
 * dan jangan dipakai untuk autocomplete, jadi pencarian hanya dijalankan saat pengguna menekan "search".
 */
export async function searchAddress(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url =
    'https://nominatim.openstreetmap.org/search' +
    `?format=jsonv2&limit=6&countrycodes=id&bounded=1&accept-language=id` +
    `&viewbox=${JATIM_VIEWBOX}&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/json',
      // Browser melarang mengubah User-Agent; di native, Nominatim meminta identitas aplikasi.
      ...(Platform.OS !== 'web' ? { 'User-Agent': 'ZeroWasteApp/1.0 (tugas kuliah pemrograman mobile)' } : {}),
    },
  });
  if (!res.ok) throw new Error(`Pencarian alamat error (${res.status})`);

  const items = (await res.json()) as NominatimItem[];
  return items.map((it) => {
    const [first, ...rest] = it.display_name.split(', ');
    return {
      id: String(it.place_id),
      title: first,
      subtitle: rest.join(', '),
      coordinate: { latitude: Number(it.lat), longitude: Number(it.lon) },
    };
  });
}
