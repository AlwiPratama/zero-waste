import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Group, Row } from '@/components/ui/Group';
import { Segmented } from '@/components/ui/Segmented';
import { PLACES } from '@/data/places';
import { useSettings, type ThemeMode } from '@/store/settings';
import { useTheme } from '@/theme/useTheme';

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Gelap' },
  { value: 'light', label: 'Terang' },
  { value: 'system', label: 'Sistem' },
];

export default function SettingsScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { themeMode, simulate, adaptive, setThemeMode, setSimulate, setAdaptive } = useSettings();

  const toggle = (value: boolean, onChange: (v: boolean) => void) => (
    <Switch value={value} onValueChange={onChange} trackColor={{ true: c.green, false: c.fill }} ios_backgroundColor={c.fill} />
  );

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <Text style={[styles.large, { color: c.label }]}>Pengaturan</Text>

      <Group title="Tampilan" footer="Tema gelap dipakai secara default.">
        <View style={styles.pad}>
          <Segmented options={THEMES} value={themeMode} onChange={setThemeMode} />
        </View>
      </Group>

      <Group
        title="Lokasi"
        footer="Mode simulasi mematikan GPS dan memindahkan posisimu dengan mengetuk peta, berguna untuk demo di browser. Interval adaptif menyesuaikan jarak antar-update dengan kecepatan gerak (diam 20 m, jalan kaki 10 m, kendaraan pelan 25 m, kendaraan cepat 50 m).">
        <Row label="Mode simulasi lokasi" right={toggle(simulate, setSimulate)} />
        <Row label="Interval jarak adaptif" right={toggle(adaptive, setAdaptive)} />
      </Group>

      <Group title="Cakupan">
        <Row label="Wilayah" detail="Jawa Timur" />
        <Row label="Jumlah lokasi (data dummy)" detail={`${PLACES.length} titik di 23 kota/kabupaten`} />
      </Group>

      <Group title="Tentang">
        <Row label="Versi" detail="1.0.0 · Milestone 1" />
        <Row label="Peta" detail="© kontributor OpenStreetMap" />
        <Row label="Rute tercepat" detail="OSRM (server demo publik)" />
        <Row label="Pencarian alamat" detail="Nominatim (OpenStreetMap)" />
      </Group>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 24 },
  large: { fontSize: 34, fontWeight: '700' },
  pad: { padding: 12 },
});
