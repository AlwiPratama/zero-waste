# Progress — Zero-Waste Food Redistribution Network (SDG 12)

Catatan serah-terima untuk dua anggota tim. Perbarui file ini tiap selesai milestone atau setelah merombak banyak kode.

## Setup
Proyek ini memakai **Expo SDK 58** (React Native 0.88); `package.json` sudah berisi versi SDK 58. Di PowerShell (jangan pakai `&&`), jalankan satu per satu:
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json   # hanya jika sebelumnya setengah ter-update
npm install
npx expo install expo-location react-native-maps
npm install leaflet zustand
npm install -D @types/leaflet
npx expo install react-native-svg
npx expo start          # tekan w = browser, scan QR = Expo Go (SDK 58)
```
Jika `expo install` kena ERESOLVE, tambahkan `-- --legacy-peer-deps` di akhir perintah.

## Milestone 1 — LBS & Interactive Mapping (selesai, belum diuji di perangkat)
| Deliverable | File |
|---|---|
| react-native-maps + expo-location | `app.json` (plugin expo-location), `src/components/map/FoodMap.tsx` |
| Hook `useLocationTracking` (distanceInterval adaptif) | `src/hooks/useLocationTracking.ts`, `src/lib/geo/adaptive.ts` |
| Custom marker + Haversine | `src/components/map/PlaceMarker.tsx`, `FoodMap.web.tsx`, `src/lib/geo/haversine.ts` |

Arsitektur: `FoodMap.tsx` (native) dan `FoodMap.web.tsx` (Leaflet) memakai props yang sama (`types.ts`); Metro memilih otomatis. Data dummy ada di `src/data/places.ts`.

Tier adaptif: diam 20 m, jalan 10 m, kendaraan pelan 25 m, kendaraan cepat 50 m; pindah tier setelah 2 sampel berturut-turut.

## Revisi UI (setelah Milestone 1)
- Tampilan ala iOS (warna sistem iOS, segmented control, grouped list, tab bar), default **tema gelap**, bisa diganti di tab Pengaturan (Gelap / Terang / Sistem). State di `src/store/settings.ts` (Zustand).
- Pin ala Apple Maps: lingkaran berwarna + ikon putih (`src/components/ui/glyph-data.ts`, dipakai native lewat react-native-svg dan web lewat string SVG).
- Lokasi tujuan: **Lokasi terkini** (realtime, mengikuti GPS/simulasi) atau **Masukkan alamat** (Nominatim, dibatasi Jawa Timur).
- Tekan pin -> rute tercepat dari pin ke tujuan (OSRM, `src/lib/routing/osrm.ts`, `src/hooks/useRoute.ts`). Tujuan realtime memicu hitung ulang tiap bergeser >= 40 m, minimal jeda 5 dtk.
- Bottom sheet 3 posisi (tertutup / setengah / penuh) di layar sempit; layar lebar (>= 900 px) memakai kartu samping.
- Data dummy: 74 lokasi di 23 kota/kabupaten Jawa Timur (`src/data/places.ts`).
- Tab: Peta dan Pengaturan (`src/app/(tabs)`).

## Batasan yang diketahui
- OSRM, Nominatim, dan tile OSM memakai server publik gratis: hanya untuk demo, jangan dipakai berat.
- Pengaturan (tema, simulasi) belum disimpan permanen; kembali ke default tiap aplikasi dibuka ulang.
- Marker native belum di-cluster; kalau lag saat zoom jauh, tambahkan clustering.

## Berikutnya
Milestone 2 (belum ditentukan): inventaris surplus (Zustand), tracking kurir, verifikasi KTP, analytics.
