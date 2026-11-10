import { Platform, type ViewStyle } from 'react-native';

/**
 * Bayangan lintas-platform. react-native-web 0.21 menandai `shadow*` sebagai deprecated
 * (console.warn "shadow* style props are deprecated. Use boxShadow"), jadi web memakai `boxShadow`,
 * sedangkan iOS/Android tetap memakai shadow* + elevation seperti sebelumnya.
 */
export function shadow({
  x = 0,
  y,
  blur,
  opacity,
  elevation,
}: {
  x?: number;
  y: number;
  blur: number;
  opacity: number;
  elevation: number;
}): ViewStyle {
  if (Platform.OS === 'web') {
    return { boxShadow: `${x}px ${y}px ${blur}px rgba(0,0,0,${opacity})` } as ViewStyle;
  }
  return {
    shadowColor: '#000',
    shadowOpacity: opacity,
    shadowRadius: blur / 2,
    shadowOffset: { width: x, height: y },
    elevation,
  };
}
