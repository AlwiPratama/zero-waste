import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'system';

type SettingsState = {
  /** Default gelap, bisa diubah di tab Pengaturan. */
  themeMode: ThemeMode;
  /** true = GPS dimatikan, posisi dipindah dengan mengetuk peta. */
  simulate: boolean;
  /** true = distanceInterval menyesuaikan kecepatan. */
  adaptive: boolean;
  setThemeMode: (m: ThemeMode) => void;
  setSimulate: (v: boolean) => void;
  setAdaptive: (v: boolean) => void;
};

export const useSettings = create<SettingsState>()((set) => ({
  themeMode: 'dark',
  simulate: false,
  adaptive: true,
  setThemeMode: (themeMode) => set({ themeMode }),
  setSimulate: (simulate) => set({ simulate }),
  setAdaptive: (adaptive) => set({ adaptive }),
}));
