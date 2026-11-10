import { Pressable, StyleSheet, Text, View } from 'react-native';

import { shadow } from '@/theme/shadow';
import { useTheme } from '@/theme/useTheme';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
};

/** Segmented control ala iOS. */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const { c } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: c.fill }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.seg, on && { backgroundColor: c.segmentThumb, ...styles.thumb }]}>
            <Text style={{ color: c.label, fontSize: 13, fontWeight: on ? '600' : '400' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 9, padding: 2 },
  seg: { flex: 1, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  thumb: shadow({ y: 1, blur: 4, opacity: 0.18, elevation: 2 }),
});
