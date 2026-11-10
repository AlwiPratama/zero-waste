# Zero-Waste Food Redistribution Network (SDG 12)

Aplikasi peta untuk menghubungkan donor dan penerima surplus makanan di Jawa Timur. Dibangun dengan Expo SDK 58 (React Native 0.88), berjalan di web, Android, dan iOS.

Fitur utama:
- Peta interaktif dengan 74 lokasi dummy (Leaflet di web, react-native-maps di native)
- Pelacakan lokasi dengan `distanceInterval` adaptif
- Rute tercepat ke lokasi terpilih (OSRM) dan pencarian alamat (Nominatim)
- Tema gelap/terang dan mode simulasi lokasi

Catatan serah-terima pengembangan ada di [`docs/PROGRESS.md`](docs/PROGRESS.md).

## Prasyarat

- [Node.js](https://nodejs.org) versi 20 atau lebih baru (cek dengan `node -v`)
- Koneksi internet (untuk tile peta OSM, rute OSRM, dan pencarian alamat)
- Opsional: aplikasi [Expo Go](https://expo.dev/go) di HP (versi yang mendukung SDK 58), atau Android emulator / iOS simulator

## Menjalankan proyek

Jalankan perintah satu per satu, dari dalam folder proyek (`zerowaste`). Di PowerShell jangan memakai `&&`.

1. Masuk ke folder proyek

   ```bash
   cd zerowaste
   ```

2. Pasang dependensi dasar

   ```bash
   npm install
   ```

3. Pasang paket yang dipakai kode tetapi belum tercatat di `package.json`

   ```bash
   npx expo install expo-location react-native-maps react-native-svg
   ```

   ```bash
   npm install leaflet zustand
   ```

   ```bash
   npm install -D @types/leaflet
   ```

   Jika muncul error `ERESOLVE`, ulangi perintah yang gagal dengan tambahan `--legacy-peer-deps` di akhir.

4. Samakan versi paket dengan SDK 58 (opsional, tetapi disarankan)

   ```bash
   npx expo install --fix
   ```

5. Jalankan server Expo

   - Di browser (paling cepat):

     ```bash
     npx expo start --web --clear
     ```

     Aplikasi terbuka di `http://localhost:8081`.

   - Di HP lewat Expo Go: jalankan `npx expo start --clear`, lalu scan QR code di terminal. HP dan komputer harus satu jaringan Wi-Fi. Jika gagal tersambung, pakai `npx expo start --tunnel`.

   - Di emulator: setelah server jalan, tekan `a` (Android) atau `i` (iOS, hanya macOS).

   Opsi `--clear` membersihkan cache Metro supaya tidak ada sisa error lama.

6. Cek console

   Di browser tekan F12 lalu buka tab Console. Tidak boleh ada error merah. Izinkan akses lokasi saat diminta, atau aktifkan **Mode simulasi** di tab Pengaturan lalu ketuk peta untuk memindahkan posisi.

## Pemecahan masalah

| Gejala | Penyebab dan solusi |
|---|---|
| `Unable to resolve module zustand` (atau `leaflet`, `expo-location`, `react-native-svg`, `react-native-maps`) | Paket belum terpasang. Ulangi langkah 3. |
| `Cannot read property 'query' of undefined` di `Panel.tsx`, dengan stack menyebut `src\app\index.tsx` | Sisa file lama dari template. Hapus `src/app/index.tsx` dan `src/app/explore.tsx`, hapus folder `.expo`, lalu jalankan `npx expo start --web --clear`. Halaman utama yang benar ada di `src/app/(tabs)/index.tsx`. |
| Isi `src/app` harus persis seperti ini | `_layout.tsx` dan folder `(tabs)` yang berisi `_layout.tsx`, `index.tsx`, `settings.tsx`. |
| Ekstrak zip menimpa folder lama lalu error aneh | Ekstrak ke folder kosong, jangan menimpa folder lama. File yang sudah dihapus di versi baru tidak ikut terhapus saat menimpa. |
| `Remove-Item` gagal dengan `Access is denied` pada `node_modules` | File `.node` masih dipakai proses Node. Jalankan `taskkill /F /IM node.exe`, lalu `cmd /c "rmdir /s /q node_modules"`. Tutup juga VS Code atau terminal lain yang membuka folder itu. |
| Peringatan `shadow* style props are deprecated` di console web | Sudah ditangani lewat `src/theme/shadow.ts`. Pastikan file itu ada dan dipakai. |
| `Importing local resources in CSS is not supported yet` (leaflet.css) | Jangan meng-import `leaflet/dist/leaflet.css`. CSS Leaflet dimuat lewat `<link>` CDN di `src/components/map/FoodMap.web.tsx`. |
| Error soal `babel-plugin-react-compiler` | Jalankan `npx expo install babel-plugin-react-compiler`. |
| Lokasi tidak muncul di browser | Izin lokasi ditolak atau halaman tidak diakses lewat `localhost`/HTTPS. Aktifkan Mode simulasi di tab Pengaturan. |

## Struktur singkat

```
src/
  app/            # rute Expo Router: _layout.tsx, (tabs)/index.tsx (peta), (tabs)/settings.tsx
  components/     # map (FoodMap.tsx native, FoodMap.web.tsx Leaflet), panel, sheet, ui
  hooks/          # useLocationTracking, useRoute, useAddressSearch
  lib/            # geo (haversine, adaptif), routing (OSRM), geocoding (Nominatim)
  data/           # data dummy lokasi
  store/          # state tema dan simulasi (Zustand)
  theme/          # palet warna, useTheme, helper shadow
```

## Batasan

OSRM, Nominatim, dan tile OSM memakai server publik gratis, hanya untuk demo. Jangan dipakai untuk beban berat.
