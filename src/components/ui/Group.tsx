import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';
import { Glyph } from './Glyph';

type GroupProps = { title?: string; footer?: string; children: ReactNode; inset?: boolean };

/** Kelompok baris ala "Inset Grouped" di Pengaturan iOS. */
export function Group({ title, footer, children, inset = false }: GroupProps) {
  const { c } = useTheme();
  const items = Children.toArray(children);
  return (
    <View style={{ gap: 6 }}>
      {title ? <Text style={[styles.header, { color: c.secondaryLabel }]}>{title.toUpperCase()}</Text> : null}
      <View style={[styles.card, { backgroundColor: inset ? c.inset : c.card }]}>
        {items.map((child, i) => (
          <Fragment key={i}>
            {child}
            {i < items.length - 1 && <View style={[styles.sep, { backgroundColor: c.separator }]} />}
          </Fragment>
        ))}
      </View>
      {footer ? <Text style={[styles.footer, { color: c.secondaryLabel }]}>{footer}</Text> : null}
    </View>
  );
}

type RowProps = {
  label: string;
  detail?: string;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
};

export function Row({ label, detail, right, onPress, chevron }: RowProps) {
  const { c } = useTheme();
  const body = (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: c.label }]}>{label}</Text>
        {detail ? <Text style={[styles.detail, { color: c.secondaryLabel }]}>{detail}</Text> : null}
      </View>
      {right}
      {chevron ? <Glyph name="chevron" size={14} color={c.tertiaryLabel} strokeWidth={2.5} /> : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

const styles = StyleSheet.create({
  header: { fontSize: 13, paddingHorizontal: 16 },
  footer: { fontSize: 13, paddingHorizontal: 16 },
  card: { borderRadius: 12, overflow: 'hidden' },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  label: { fontSize: 16 },
  detail: { fontSize: 13, marginTop: 1 },
});
