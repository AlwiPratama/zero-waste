import { useColorScheme } from 'react-native';

import { useSettings } from '@/store/settings';
import { DARK, LIGHT, type Palette } from './palette';

export type Scheme = 'dark' | 'light';

export function useTheme(): { scheme: Scheme; isDark: boolean; c: Palette } {
  const mode = useSettings((s) => s.themeMode);
  const system = useColorScheme();
  const scheme: Scheme = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;
  return { scheme, isDark: scheme === 'dark', c: scheme === 'dark' ? DARK : LIGHT };
}
