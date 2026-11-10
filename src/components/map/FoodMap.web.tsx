// Implementasi WEB memakai Leaflet + tile OpenStreetMap (react-native-maps tidak jalan di browser).
// Leaflet menyentuh `window`, jadi di-import secara dinamis di dalam effect (aman untuk render statis Expo Router).
// CSS Leaflet dimuat lewat <link> CDN (lihat di bawah): Metro belum mendukung url(images/...) di dalam file CSS.
import type * as LeafletTypes from 'leaflet';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';

import { glyphSvg } from '@/components/ui/glyph-data';
import { JATIM_REGION, JATIM_ZOOM } from '@/constants/geo';
import { CATEGORY_STYLE, DESTINATION_COLOR, KIND_STYLE, USER_COLOR } from '@/data/places';
import type { FoodMapHandle, FoodMapProps } from './types';

type L = typeof LeafletTypes;

let leafletPromise: Promise<L> | null = null;
function loadLeaflet(): Promise<L> {
  leafletPromise ??= import('leaflet').then((m) => (m as unknown as { default?: L }).default ?? (m as unknown as L));
  return leafletPromise;
}

const STYLE_ID = 'zw-map-style';
const CSS = `
.zw-icon{background:transparent;border:0}
.zw-pin{display:flex;align-items:center;justify-content:center;border:3px solid #fff;border-radius:50%;
  box-shadow:0 2px 6px rgba(0,0,0,.35);transition:transform .15s}
.zw-pin:hover{transform:scale(1.1)}
.zw-user{width:18px;height:18px;border-radius:50%;background:${USER_COLOR};border:3px solid #fff;
  box-shadow:0 0 0 8px rgba(10,132,255,.25)}
.zw-dark{background:#1c1c1e}
.zw-dark .leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(.95) contrast(.9)}
.zw-dark .leaflet-control-zoom a{background:#2c2c2e;color:#fff;border-color:#3a3a3c}
.zw-dark .leaflet-control-attribution{background:rgba(28,28,30,.8);color:#aaa}
.zw-dark .leaflet-control-attribution a{color:#8ab4ff}
`;

function pinIcon(Lf: L, glyph: Parameters<typeof glyphSvg>[0], color: string, selected: boolean) {
  const size = selected ? 46 : 34;
  return Lf.divIcon({
    className: 'zw-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="zw-pin" style="width:${size}px;height:${size}px;background:${color}">${glyphSvg(glyph, '#fff', selected ? 24 : 18, 2.2)}</div>`,
  });
}

export const FoodMap = forwardRef<FoodMapHandle, FoodMapProps>(function FoodMap(props, ref) {
  const {
    places, scheme, userLocation, userAccuracy, selectedId, onSelectPlace, onMapPress,
    route, destination, bottomInset = 0, zoomControl = true,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletTypes.Map | null>(null);
  const lfRef = useRef<L | null>(null);
  const placeLayerRef = useRef<LeafletTypes.LayerGroup | null>(null);
  const userLayerRef = useRef<LeafletTypes.LayerGroup | null>(null);
  const routeLayerRef = useRef<LeafletTypes.LayerGroup | null>(null);
  const zoomRef = useRef<LeafletTypes.Control | null>(null);
  const [ready, setReady] = useState(false);

  // Callback terbaru disimpan di ref agar peta tidak dibuat ulang tiap render.
  const cb = useRef({ onSelectPlace, onMapPress });
  useEffect(() => {
    cb.current = { onSelectPlace, onMapPress };
  });

  // 1) Buat peta sekali.
  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | null = null;

    loadLeaflet().then((Lf) => {
      const el = containerRef.current;
      if (disposed || !el) return;

      if (!document.getElementById('zw-leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'zw-leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS;
        document.head.appendChild(style);
      }

      const map = Lf.map(el, { zoomControl: false }).setView([JATIM_REGION.latitude, JATIM_REGION.longitude], JATIM_ZOOM);
      Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      map.on('click', (e) => cb.current.onMapPress?.({ latitude: e.latlng.lat, longitude: e.latlng.lng }));

      routeLayerRef.current = Lf.layerGroup().addTo(map);
      placeLayerRef.current = Lf.layerGroup().addTo(map);
      userLayerRef.current = Lf.layerGroup().addTo(map);
      mapRef.current = map;
      lfRef.current = Lf;

      // Ukuran jendela browser / layout berubah -> hitung ulang ukuran peta.
      observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(el);
      setReady(true);
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      lfRef.current = null;
    };
  }, []);

  // 2) Tema gelap/terang.
  useEffect(() => {
    containerRef.current?.classList.toggle('zw-dark', scheme === 'dark');
  }, [scheme, ready]);

  // 3) Tombol zoom.
  useEffect(() => {
    const Lf = lfRef.current;
    const map = mapRef.current;
    if (!ready || !Lf || !map) return;
    zoomRef.current?.remove();
    zoomRef.current = zoomControl ? Lf.control.zoom({ position: 'bottomright' }).addTo(map) : null;
  }, [ready, zoomControl]);

  // 4) Marker tempat.
  useEffect(() => {
    const Lf = lfRef.current;
    const layer = placeLayerRef.current;
    if (!ready || !Lf || !layer) return;

    layer.clearLayers();
    places.forEach((p) => {
      const icon = pinIcon(Lf, CATEGORY_STYLE[p.category].glyph, KIND_STYLE[p.kind].color, p.id === selectedId);
      Lf.marker([p.coordinate.latitude, p.coordinate.longitude], {
        icon,
        zIndexOffset: p.id === selectedId ? 1000 : 0,
        title: p.name,
      })
        .on('click', () => cb.current.onSelectPlace(p.id))
        .addTo(layer);
    });
  }, [ready, places, selectedId]);

  // 5) Marker pengguna + lingkaran akurasi + pin tujuan.
  useEffect(() => {
    const Lf = lfRef.current;
    const layer = userLayerRef.current;
    if (!ready || !Lf || !layer) return;

    layer.clearLayers();
    if (userLocation) {
      const ll: [number, number] = [userLocation.latitude, userLocation.longitude];
      if (userAccuracy != null && userAccuracy < 500) {
        Lf.circle(ll, { radius: userAccuracy, color: USER_COLOR, weight: 1, fillOpacity: 0.1, interactive: false }).addTo(layer);
      }
      Lf.marker(ll, {
        icon: Lf.divIcon({ className: 'zw-icon', iconSize: [18, 18], iconAnchor: [9, 9], html: '<div class="zw-user"></div>' }),
        zIndexOffset: 2000,
        interactive: false,
      }).addTo(layer);
    }
    if (destination) {
      Lf.marker([destination.latitude, destination.longitude], {
        icon: Lf.divIcon({
          className: 'zw-icon',
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          html: `<div class="zw-pin" style="width:38px;height:38px;background:${DESTINATION_COLOR}">${glyphSvg('flag', '#fff', 18, 2.4)}</div>`,
        }),
        zIndexOffset: 3000,
        interactive: false,
      }).addTo(layer);
    }
  }, [ready, userLocation, userAccuracy, destination]);

  // 6) Rute tercepat (atau garis putus-putus bila rute belum ada).
  useEffect(() => {
    const Lf = lfRef.current;
    const layer = routeLayerRef.current;
    if (!ready || !Lf || !layer) return;

    layer.clearLayers();
    if (route && route.length > 1) {
      const pts = route.map((p) => [p.latitude, p.longitude] as [number, number]);
      Lf.polyline(pts, { color: '#fff', weight: 9, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(layer);
      Lf.polyline(pts, { color: USER_COLOR, weight: 5, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(layer);
      return;
    }
    const sel = places.find((p) => p.id === selectedId);
    if (userLocation && sel) {
      Lf.polyline(
        [
          [sel.coordinate.latitude, sel.coordinate.longitude],
          [userLocation.latitude, userLocation.longitude],
        ],
        { color: KIND_STYLE[sel.kind].color, weight: 3, dashArray: '10 8', interactive: false },
      ).addTo(layer);
    }
  }, [ready, route, places, selectedId, userLocation]);

  useImperativeHandle(ref, () => {
    const fit = (coords: { latitude: number; longitude: number }[]) => {
      const Lf = lfRef.current;
      if (!Lf || coords.length === 0) return;
      mapRef.current?.fitBounds(Lf.latLngBounds(coords.map((p) => [p.latitude, p.longitude] as [number, number])), {
        paddingTopLeft: [50, 110],
        paddingBottomRight: [50, bottomInset + 50],
      });
    };
    return {
      focusUser() {
        if (userLocation) mapRef.current?.flyTo([userLocation.latitude, userLocation.longitude], 16);
      },
      focusPlace(id) {
        const p = places.find((x) => x.id === id);
        if (p) mapRef.current?.flyTo([p.coordinate.latitude, p.coordinate.longitude], 15);
      },
      fitAll() {
        const coords = places.map((p) => p.coordinate);
        if (userLocation) coords.push(userLocation);
        fit(coords);
      },
      fitCoordinates: fit,
    };
  });

  return (
    <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
});
