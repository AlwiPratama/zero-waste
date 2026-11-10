import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';
import { Glyph } from './Glyph';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit: () => void;
  placeholder: string;
  loading?: boolean;
};

const webReset = Platform.select({ web: { outlineStyle: 'none' } as object, default: {} });

/** Kolom pencarian ala iOS (UISearchBar). */
export function SearchField({ value, onChangeText, onSubmit, placeholder, loading }: Props) {
  const { c } = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: c.fill }]}>
      <Glyph name="search" size={16} color={c.secondaryLabel} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={c.tertiaryLabel}
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.input, { color: c.label }, webReset]}
      />
      {loading ? (
        <ActivityIndicator size="small" color={c.secondaryLabel} />
      ) : value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Glyph name="close" size={16} color={c.secondaryLabel} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, borderRadius: 10, paddingHorizontal: 10 },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
});
