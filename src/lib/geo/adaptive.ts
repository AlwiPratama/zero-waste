import { haversineMeters } from './haversine';
import type { LatLng } from './types';

/**
 * Logika murni (tanpa import expo) untuk distanceInterval adaptif,
 * supaya mudah diuji dan dibaca terpisah dari hook.
 *
 * Ide: makin cepat pengguna bergerak, makin besar jarak antar-update yang masuk
 * akal (hemat baterai & render). Saat diam, interval besar juga meredam "GPS drift".
 * Saat jalan kaki, interval kecil agar posisi kurir terasa halus.
 */
export type TierName = 'idle' | 'walking' | 'riding' | 'driving';

export type TierConfig = {
  label: string;
  /** Batas atas kecepatan (m/s) untuk tier ini. */
  maxSpeedMps: number;
  /** Jarak minimum antar-update (meter). */
  distanceInterval: number;
  /** Waktu minimum antar-update (ms). Hanya berlaku di Android. */
  timeInterval: number;
  accuracy: 'balanced' | 'high';
};

export const TIERS: Record<TierName, TierConfig> = {
  idle: { label: 'Diam', maxSpeedMps: 0.5, distanceInterval: 20, timeInterval: 15000, accuracy: 'balanced' },
  walking: { label: 'Jalan kaki', maxSpeedMps: 2.5, distanceInterval: 10, timeInterval: 5000, accuracy: 'high' },
  riding: { label: 'Sepeda / motor pelan', maxSpeedMps: 8, distanceInterval: 25, timeInterval: 4000, accuracy: 'high' },
  driving: { label: 'Kendaraan cepat', maxSpeedMps: Number.POSITIVE_INFINITY, distanceInterval: 50, timeInterval: 3000, accuracy: 'balanced' },
};

const ORDER: TierName[] = ['idle', 'walking', 'riding', 'driving'];

export function tierForSpeed(speedMps: number): TierName {
  return ORDER.find((name) => speedMps < TIERS[name].maxSpeedMps) ?? 'driving';
}

export type TierState = {
  tier: TierName;
  /** Tier yang sedang "diusulkan" tapi belum cukup stabil untuk dipakai. */
  pending: TierName | null;
  pendingCount: number;
};

/**
 * Pindah tier hanya jika sampel berturut-turut mengusulkan tier yang sama
 * (hysteresis), supaya satu pembacaan speed yang loncat tidak membuat
 * watcher di-restart bolak-balik.
 */
export function stepTier(state: TierState, speedMps: number | null, required = 2): TierState {
  if (speedMps === null || !Number.isFinite(speedMps) || speedMps < 0) return state;
  const target = tierForSpeed(speedMps);
  if (target === state.tier) return { tier: state.tier, pending: null, pendingCount: 0 };

  const count = state.pending === target ? state.pendingCount + 1 : 1;
  if (count >= required) return { tier: target, pending: null, pendingCount: 0 };
  return { tier: state.tier, pending: target, pendingCount: count };
}

type Stamped = { coords: LatLng; timestamp: number };

/**
 * Kecepatan (m/s). Prioritas: speed dari perangkat; jika tidak ada (null / -1),
 * hitung dari jarak Haversine ÷ selisih waktu dua sampel terakhir.
 * Selisih waktu > 60 dtk dianggap tidak representatif → null.
 */
export function estimateSpeed(
  deviceSpeed: number | null | undefined,
  prev: Stamped | null,
  curr: Stamped,
): number | null {
  if (typeof deviceSpeed === 'number' && Number.isFinite(deviceSpeed) && deviceSpeed >= 0) {
    return deviceSpeed;
  }
  if (!prev) return null;
  const dtSec = (curr.timestamp - prev.timestamp) / 1000;
  if (dtSec <= 0 || dtSec > 60) return null;
  return haversineMeters(prev.coords, curr.coords) / dtSec;
}
