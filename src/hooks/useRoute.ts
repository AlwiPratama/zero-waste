import { useEffect, useRef, useState } from 'react';

import { haversineMeters } from '@/lib/geo/haversine';
import type { LatLng } from '@/lib/geo/types';
import { fetchFastestRoute, type Route } from '@/lib/routing/osrm';

export type RouteState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  route: Route | null;
  error: string | null;
};

const IDLE: RouteState = { status: 'idle', route: null, error: null };

/** Tujuan "realtime" hanya memicu hitung ulang rute jika bergeser sejauh ini (meter) ... */
const MOVE_THRESHOLD_M = 40;
/** ... dan paling cepat sekali per jeda ini (ms), supaya server rute publik tidak dibanjiri. */
const MIN_INTERVAL_MS = 5000;

/**
 * Rute tercepat dari `from` ke `to`. Dipanggil ulang otomatis bila `from` berubah (pin lain dipilih)
 * atau `to` bergeser cukup jauh (mis. tujuan = lokasi terkini yang terus berubah).
 */
export function useRoute(from: LatLng | null, to: LatLng | null): RouteState {
  const [state, setState] = useState<RouteState>(IDLE);
  const lastRef = useRef<{ from: LatLng; to: LatLng; at: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fLat = from?.latitude;
  const fLng = from?.longitude;
  const tLat = to?.latitude;
  const tLng = to?.longitude;

  useEffect(() => {
    if (fLat === undefined || fLng === undefined || tLat === undefined || tLng === undefined) {
      abortRef.current?.abort();
      lastRef.current = null;
      setState(IDLE);
      return;
    }
    const f = { latitude: fLat, longitude: fLng };
    const t = { latitude: tLat, longitude: tLng };

    const last = lastRef.current;
    const fromChanged = !last || haversineMeters(last.from, f) > 1;
    const toMoved = !last || haversineMeters(last.to, t) >= MOVE_THRESHOLD_M;
    if (!fromChanged && !toMoved) return;
    if (!fromChanged && last && Date.now() - last.at < MIN_INTERVAL_MS) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    lastRef.current = { from: f, to: t, at: Date.now() };

    // Pertahankan rute lama saat memuat ulang agar garis tidak berkedip.
    setState((prev) => ({ status: 'loading', route: fromChanged ? null : prev.route, error: null }));

    fetchFastestRoute(f, t, ctrl.signal)
      .then((route) => {
        if (!ctrl.signal.aborted) setState({ status: 'ready', route, error: null });
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        lastRef.current = null; // izinkan percobaan ulang pada pembaruan berikutnya
        setState({ status: 'error', route: null, error: e instanceof Error ? e.message : 'Gagal memuat rute' });
      });
  }, [fLat, fLng, tLat, tLng]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return state;
}
