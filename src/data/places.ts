import type { GlyphName } from '@/components/ui/glyph-data';
import type { LatLng } from '@/lib/geo/types';

export type PlaceKind = 'donor' | 'recipient';
export type PlaceCategory = 'restoran' | 'hotel' | 'toko' | 'panti' | 'komunitas';

export type Place = {
  id: string;
  kind: PlaceKind;
  category: PlaceCategory;
  name: string;
  city: string;
  coordinate: LatLng;
  note: string;
};

export const KIND_STYLE: Record<PlaceKind, { label: string; color: string }> = {
  donor: { label: 'Donor', color: '#FF9500' },
  recipient: { label: 'Penerima', color: '#34C759' },
};

export const CATEGORY_STYLE: Record<PlaceCategory, { label: string; glyph: GlyphName }> = {
  restoran: { label: 'Restoran', glyph: 'restoran' },
  hotel: { label: 'Hotel', glyph: 'hotel' },
  toko: { label: 'Toko kelontong', glyph: 'toko' },
  panti: { label: 'Panti asuhan', glyph: 'panti' },
  komunitas: { label: 'Komunitas', glyph: 'komunitas' },
};

export const USER_COLOR = '#0A84FF';
export const DESTINATION_COLOR = '#FF3B30';

type City = { name: string; lat: number; lng: number; big?: boolean };

/** Pusat kota/kabupaten di Jawa Timur (koordinat kasar). */
const CITIES: City[] = [
  { name: 'Surabaya', lat: -7.2575, lng: 112.7521, big: true },
  { name: 'Malang', lat: -7.9797, lng: 112.6304, big: true },
  { name: 'Sidoarjo', lat: -7.4478, lng: 112.7183, big: true },
  { name: 'Gresik', lat: -7.1539, lng: 112.6561 },
  { name: 'Mojokerto', lat: -7.4726, lng: 112.4338 },
  { name: 'Jombang', lat: -7.546, lng: 112.233 },
  { name: 'Pasuruan', lat: -7.6453, lng: 112.9075 },
  { name: 'Probolinggo', lat: -7.7543, lng: 113.2159 },
  { name: 'Lumajang', lat: -8.1335, lng: 113.2226 },
  { name: 'Jember', lat: -8.1845, lng: 113.6681, big: true },
  { name: 'Banyuwangi', lat: -8.2192, lng: 114.3691 },
  { name: 'Kediri', lat: -7.848, lng: 112.0178, big: true },
  { name: 'Blitar', lat: -8.0954, lng: 112.1609 },
  { name: 'Tulungagung', lat: -8.0654, lng: 111.9025 },
  { name: 'Nganjuk', lat: -7.6051, lng: 111.904 },
  { name: 'Madiun', lat: -7.6298, lng: 111.5239 },
  { name: 'Ponorogo', lat: -7.865, lng: 111.4696 },
  { name: 'Bojonegoro', lat: -7.1502, lng: 111.8817 },
  { name: 'Tuban', lat: -6.8976, lng: 112.0647 },
  { name: 'Lamongan', lat: -7.1167, lng: 112.4167 },
  { name: 'Batu', lat: -7.8672, lng: 112.5239 },
  { name: 'Pamekasan', lat: -7.1568, lng: 113.4825 },
  { name: 'Sumenep', lat: -7.0167, lng: 113.8667 },
];

/**
 * DATA DUMMY untuk demo. Nama, jumlah porsi, dan posisi tepatnya fiktif;
 * hanya pusat kota yang mendekati koordinat sebenarnya. Nanti diganti data dari backend/store.
 */
function build(): Place[] {
  const out: Place[] = [];
  CITIES.forEach((c, i) => {
    const slug = c.name.toLowerCase();
    const n = (k: number) => 12 + ((i * 7 + k * 11) % 34);
    const push = (
      kind: PlaceKind,
      category: PlaceCategory,
      name: string,
      dLat: number,
      dLng: number,
      note: string,
    ) =>
      out.push({
        id: `${slug}-${out.length}`,
        kind,
        category,
        name,
        city: c.name,
        coordinate: { latitude: c.lat + dLat, longitude: c.lng + dLng },
        note,
      });

    push('donor', 'restoran', `Resto Rasa Nusantara ${c.name}`, 0.006, -0.004, `${n(1)} porsi makanan matang, siap diambil pukul ${17 + (i % 4)}.00`);
    if (c.big) {
      push('donor', 'hotel', `Hotel Pesona ${c.name}`, -0.005, 0.007, `Sisa sarapan prasmanan ±${n(2)} porsi, ambil sebelum 10.30`);
    } else {
      push('donor', 'toko', `Toko Sumber Rejeki ${c.name}`, -0.005, 0.007, `${n(2)} item roti dan susu mendekati kedaluwarsa`);
    }
    push('recipient', 'panti', `Panti Asuhan Harapan ${c.name}`, 0.004, 0.006, `Butuh ±${n(3)} porsi per hari`);
    if (c.big) {
      push('recipient', 'komunitas', `Komunitas Peduli ${c.name}`, -0.007, -0.005, `Distribusi sore untuk ±${n(4) + 20} warga`);
    }
  });
  return out;
}

export const PLACES: Place[] = build();
