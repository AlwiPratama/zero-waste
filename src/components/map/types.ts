import type { Place } from '@/data/places';
import type { LatLng } from '@/lib/geo/types';
import type { Scheme } from '@/theme/useTheme';

export type FoodMapProps = {
  places: Place[];
  scheme: Scheme;
  userLocation: LatLng | null;
  /** Radius akurasi GPS (meter), digambar sebagai lingkaran tipis. */
  userAccuracy?: number | null;
  selectedId: string | null;
  onSelectPlace: (id: string) => void;
  /** Dipanggil saat area kosong peta diketuk / diklik. */
  onMapPress?: (coord: LatLng) => void;
  /** Titik rute dari tempat terpilih ke tujuan (null = tidak ada). */
  route: LatLng[] | null;
  /** Pin tujuan (merah). Diisi hanya untuk tujuan "alamat"; tujuan "lokasi terkini" sudah diwakili titik biru. */
  destination: LatLng | null;
  /** Ruang yang tertutup panel bawah (px) agar fit tidak tertutup. */
  bottomInset?: number;
  /** Tombol zoom (+/-) khusus web. */
  zoomControl?: boolean;
};

export type FoodMapHandle = {
  focusUser: () => void;
  focusPlace: (id: string) => void;
  fitAll: () => void;
  fitCoordinates: (coords: LatLng[]) => void;
};
