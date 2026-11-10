import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, PanResponder, Platform, StyleSheet, View } from 'react-native';

import { shadow } from '@/theme/shadow';

export type SheetSnap = 'hidden' | 'half' | 'full';

/** Tinggi bagian yang tetap terlihat saat sheet "tertutup" (pegangan + judul). */
export const SHEET_PEEK = 84;

type Props = {
  /** Tinggi area peta (px). */
  height: number;
  /** Jarak dari atas saat sheet penuh (mis. area status bar). */
  topGap: number;
  snap: SheetSnap;
  onSnapChange: (s: SheetSnap) => void;
  /** Bagian yang bisa diseret (judul, dll.). */
  header: ReactNode;
  backgroundColor: string;
  handleColor: string;
  children: (info: { bottomPad: number }) => ReactNode;
};

function springTo(y: Animated.Value, toValue: number) {
  Animated.spring(y, {
    toValue,
    useNativeDriver: Platform.OS !== 'web',
    bounciness: 0,
    speed: 16,
  }).start();
}

const webTouch = Platform.select({ web: { touchAction: 'none', userSelect: 'none' } as object, default: {} });

/**
 * Bottom sheet 3 posisi ala iOS Maps: tertutup (hanya pegangan), setengah, dan penuh (menutupi peta).
 * Seret bagian header; ketuk header untuk berpindah posisi.
 */
export function BottomSheet({ height, topGap, snap, onSnapChange, header, backgroundColor, handleColor, children }: Props) {
  const offsets = useMemo(
    () => ({
      full: topGap,
      half: Math.round(height * 0.5),
      hidden: Math.max(height - SHEET_PEEK, topGap),
    }),
    [height, topGap],
  );

  const [y] = useState(() => new Animated.Value(offsets[snap]));
  const startY = useRef(0);
  const live = useRef({ offsets, snap, onSnapChange });
  useEffect(() => {
    live.current = { offsets, snap, onSnapChange };
  });

  // Ikuti perubahan snap dari luar (mis. pin ditekan -> sheet naik ke setengah).
  useEffect(() => {
    springTo(y, offsets[snap]);
  }, [y, offsets, snap]);

  const [pan] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        y.stopAnimation((v) => {
          startY.current = v;
        });
      },
      onPanResponderMove: (_, g) => {
        const o = live.current.offsets;
        y.setValue(Math.min(o.hidden, Math.max(o.full, startY.current + g.dy)));
      },
      onPanResponderRelease: (_, g) => {
        const { offsets: o, snap: cur, onSnapChange: change } = live.current;
        const isTap = Math.abs(g.dy) < 6 && Math.abs(g.dx) < 6;
        let target: SheetSnap;
        if (isTap) {
          target = cur === 'hidden' ? 'half' : cur === 'half' ? 'full' : 'half';
        } else {
          const projected = startY.current + g.dy + g.vy * 150;
          target = (['full', 'half', 'hidden'] as const).reduce(
            (best, k) => (Math.abs(o[k] - projected) < Math.abs(o[best] - projected) ? k : best),
            'half' as SheetSnap,
          );
        }
        change(target);
        springTo(y, o[target]);
      },
      onPanResponderTerminate: () => {
        const { offsets: o, snap: cur } = live.current;
        springTo(y, o[cur]);
      },
    }),
  );

  // Bagian bawah sheet berada di luar layar saat "setengah"; tambahkan ruang agar item terakhir bisa di-scroll.
  const bottomPad = snap === 'full' ? 24 : offsets.half - topGap + 24;

  return (
    <Animated.View
      style={[styles.sheet, { height: Math.max(height - topGap, 0), backgroundColor, transform: [{ translateY: y }] }]}>
      <View {...pan.panHandlers} style={[styles.header, webTouch]}>
        <View style={[styles.grabber, { backgroundColor: handleColor }]} />
        {header}
      </View>
      <View style={styles.body}>{children({ bottomPad })}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    ...shadow({ y: -2, blur: 24, opacity: 0.25, elevation: 16 }),
  },
  header: { paddingTop: 6, paddingHorizontal: 16, paddingBottom: 8 },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, marginBottom: 8 },
  body: { flex: 1 },
});
