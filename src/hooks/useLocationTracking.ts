import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  estimateSpeed,
  stepTier,
  TIERS,
  type TierConfig,
  type TierName,
  type TierState,
} from '@/lib/geo/adaptive';
import { haversineMeters } from '@/lib/geo/haversine';
import type { LatLng } from '@/lib/geo/types';

export type PermissionState = 'undetermined' | 'granted' | 'denied' | 'unavailable';

export type LocationSample = {
  coords: LatLng;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
};

export type UseLocationTrackingOptions = {
  /** false = berhenti memantau (mis. saat mode simulasi). */
  enabled?: boolean;
  /** true = distanceInterval menyesuaikan kecepatan. false = pakai `fixedDistanceInterval`. */
  adaptive?: boolean;
  fixedDistanceInterval?: number;
};

const ACCURACY = {
  balanced: Location.Accuracy.Balanced,
  high: Location.Accuracy.High,
} as const;

function toSample(loc: Location.LocationObject): LocationSample {
  const { latitude, longitude, accuracy, speed, heading } = loc.coords;
  return {
    coords: { latitude, longitude },
    accuracy: accuracy ?? null,
    speed: speed ?? null,
    heading: heading ?? null,
    timestamp: loc.timestamp,
  };
}

export function useLocationTracking({
  enabled = true,
  adaptive = true,
  fixedDistanceInterval = 10,
}: UseLocationTrackingOptions = {}) {
  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [location, setLocation] = useState<LocationSample | null>(null);
  const [tier, setTier] = useState<TierName>('walking');
  const [speedMps, setSpeedMps] = useState<number | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const lastRef = useRef<LocationSample | null>(null);
  const tierStateRef = useRef<TierState>({ tier: 'walking', pending: null, pendingCount: 0 });

  /**
   * Satu pintu masuk untuk semua sampel lokasi.
   * Filter jarak dilakukan juga di sini karena `distanceInterval` diabaikan di web
   * (navigator.geolocation tidak mengenalnya), jadi perilakunya sama di semua platform.
   */
  const ingest = useCallback(
    (loc: Location.LocationObject, minDistanceM: number) => {
      const sample = toSample(loc);
      const prev = lastRef.current;
      if (prev && minDistanceM > 0 && haversineMeters(prev.coords, sample.coords) < minDistanceM) {
        return;
      }

      lastRef.current = sample;
      setLocation(sample);
      setUpdateCount((c) => c + 1);
      setError(null);

      const speed = estimateSpeed(sample.speed, prev, sample);
      if (speed !== null) {
        setSpeedMps(speed);
        if (adaptive) {
          tierStateRef.current = stepTier(tierStateRef.current, speed);
          setTier(tierStateRef.current.tier);
        }
      }
    },
    [adaptive],
  );

  // 1) Izin + posisi pertama
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (res.status !== Location.PermissionStatus.GRANTED) {
          setPermission('denied');
          setError('Izin lokasi ditolak.');
          return;
        }
        setPermission('granted');
        setError(null);

        try {
          const first = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!cancelled) ingest(first, 0);
        } catch {
          if (!cancelled) setError('Belum dapat posisi pertama. Pastikan GPS / layanan lokasi aktif.');
        }
      } catch {
        if (!cancelled) {
          setPermission('unavailable');
          setError('Layanan lokasi tidak tersedia di perangkat/browser ini.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, attempt, ingest]);

  // 2) Watcher. Dipasang ulang setiap `tier` berubah => distanceInterval ikut berganti.
  useEffect(() => {
    if (!enabled || permission !== 'granted') return;

    const cfg: TierConfig = adaptive
      ? TIERS[tier]
      : { ...TIERS.walking, distanceInterval: fixedDistanceInterval };

    let cancelled = false;
    let sub: Location.LocationSubscription | null = null;

    Location.watchPositionAsync(
      {
        accuracy: ACCURACY[cfg.accuracy],
        distanceInterval: cfg.distanceInterval,
        timeInterval: cfg.timeInterval,
      },
      (loc) => ingest(loc, cfg.distanceInterval),
    )
      .then((s) => {
        // Komponen bisa saja sudah unmount / tier sudah berganti sebelum promise selesai.
        if (cancelled) s.remove();
        else sub = s;
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memantau lokasi.');
      });

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled, permission, adaptive, tier, fixedDistanceInterval, ingest]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  const activeConfig = adaptive
    ? TIERS[tier]
    : { ...TIERS.walking, label: 'Tetap', distanceInterval: fixedDistanceInterval };

  return {
    permission,
    location,
    error,
    retry,
    tier,
    tierLabel: activeConfig.label,
    distanceInterval: activeConfig.distanceInterval,
    speedMps,
    updateCount,
  };
}

export type LocationTracking = ReturnType<typeof useLocationTracking>;
