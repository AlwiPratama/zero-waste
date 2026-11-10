import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Glyph } from '@/components/ui/Glyph';
import { Group } from '@/components/ui/Group';
import { SearchField } from '@/components/ui/SearchField';
import { Segmented } from '@/components/ui/Segmented';
import { CATEGORY_STYLE, KIND_STYLE, type Place, type PlaceKind } from '@/data/places';
import type { AddressSearch } from '@/hooks/useAddressSearch';
import type { RouteState } from '@/hooks/useRoute';
import { formatDistance } from '@/lib/geo/haversine';
import type { GeocodeResult } from '@/lib/geocoding/nominatim';
import { formatDuration } from '@/lib/routing/osrm';
import { useTheme } from '@/theme/useTheme';

export type PlaceFilter = 'all' | PlaceKind;
export type DestMode = 'live' | 'address';

type Props = {
  bottomPad: number;
  destMode: DestMode;
  onDestModeChange: (m: DestMode) => void;
  /** Teks status posisi untuk mode "lokasi terkini". */
  liveText: string;
  search: AddressSearch;
  destAddress: GeocodeResult | null;
  onPickAddress: (r: GeocodeResult) => void;
  onClearAddress: () => void;
  filter: PlaceFilter;
  onFilterChange: (f: PlaceFilter) => void;
  rows: { place: Place; distanceM: number | null }[];
  totalCount: number;
  selected: Place | null;
  onSelect: (id: string) => void;
  onClearSelection: () => void;
  hasDestination: boolean;
  route: RouteState;
  straightM: number | null;
};

const FILTERS: { value: PlaceFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'donor', label: 'Donor' },
  { value: 'recipient', label: 'Penerima' },
];

export function Panel(p: Props) {
  const { c } = useTheme();

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: p.bottomPad }]} keyboardShouldPersistTaps="handled">
      {/* Tujuan */}
      <Group title="Lokasi tujuan" inset>
        <View style={styles.pad}>
          <Segmented
            options={[
              { value: 'live', label: 'Lokasi terkini' },
              { value: 'address', label: 'Masukkan alamat' },
            ]}
            value={p.destMode}
            onChange={p.onDestModeChange}
          />
        </View>

        {p.destMode === 'live' ? (
          <View style={[styles.pad, styles.rowGap]}>
            <Glyph name="locate" size={16} color={c.tint} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.body, { color: c.label }]}>Tujuan = posisimu saat ini</Text>
              <Text style={[styles.small, { color: c.secondaryLabel }]}>
                {p.liveText}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.pad, { gap: 8 }]}>
            <SearchField
              value={p.search.query}
              onChangeText={p.search.setQuery}
              onSubmit={p.search.submit}
              placeholder="Cari alamat di Jawa Timur"
              loading={p.search.status === 'loading'}
            />
            {p.search.status === 'error' && <Text style={[styles.small, { color: c.red }]}>{p.search.error}</Text>}
            {p.search.status === 'done' && p.search.results.length === 0 && (
              <Text style={[styles.small, { color: c.secondaryLabel }]}>Alamat tidak ditemukan. Coba kata kunci lain.</Text>
            )}
            {p.search.results.map((r) => (
              <Pressable key={r.id} onPress={() => p.onPickAddress(r)} style={styles.result}>
                <Glyph name="flag" size={16} color={c.red} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.body, { color: c.label }]} numberOfLines={1}>{r.title}</Text>
                  <Text style={[styles.small, { color: c.secondaryLabel }]} numberOfLines={1}>{r.subtitle}</Text>
                </View>
              </Pressable>
            ))}
            {p.destAddress && (
              <View style={[styles.chosen, { backgroundColor: c.fill }]}>
                <Glyph name="check" size={16} color={c.green} strokeWidth={2.6} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.body, { color: c.label }]} numberOfLines={1}>{p.destAddress.title}</Text>
                  <Text style={[styles.small, { color: c.secondaryLabel }]} numberOfLines={1}>{p.destAddress.subtitle}</Text>
                </View>
                <Pressable onPress={p.onClearAddress} hitSlop={8}>
                  <Glyph name="close" size={16} color={c.secondaryLabel} />
                </Pressable>
              </View>
            )}
          </View>
        )}
      </Group>

      {/* Rute ke tempat terpilih */}
      {p.selected && (
        <View style={[styles.routeCard, { backgroundColor: c.inset, borderColor: KIND_STYLE[p.selected.kind].color }]}>
          <View style={styles.rowGap}>
            <View style={[styles.badge, { backgroundColor: KIND_STYLE[p.selected.kind].color }]}>
              <Glyph name={CATEGORY_STYLE[p.selected.category].glyph} size={18} color="#fff" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: c.label }]} numberOfLines={1}>{p.selected.name}</Text>
              <Text style={[styles.small, { color: c.secondaryLabel }]} numberOfLines={1}>
                {KIND_STYLE[p.selected.kind].label} · {p.selected.city}
              </Text>
            </View>
            <Pressable onPress={p.onClearSelection} hitSlop={8}>
              <Glyph name="close" size={18} color={c.secondaryLabel} />
            </Pressable>
          </View>
          <Text style={[styles.small, { color: c.secondaryLabel }]}>{p.selected.note}</Text>

          {!p.hasDestination ? (
            <Text style={[styles.body, { color: c.orange }]}>
              {p.destMode === 'address' ? 'Masukkan alamat tujuan untuk melihat rute.' : 'Menunggu posisimu untuk menghitung rute.'}
            </Text>
          ) : p.route.status === 'loading' && !p.route.route ? (
            <View style={styles.rowGap}>
              <ActivityIndicator size="small" color={c.tint} />
              <Text style={[styles.body, { color: c.secondaryLabel }]}>Mencari rute tercepat…</Text>
            </View>
          ) : p.route.status === 'error' ? (
            <Text style={[styles.body, { color: c.red }]}>{p.route.error}</Text>
          ) : p.route.route ? (
            <View style={{ gap: 2 }}>
              <Text style={[styles.big, { color: c.label }]}>
                {formatDuration(p.route.route.durationS)}
                <Text style={[styles.small, { color: c.secondaryLabel }]}>  ·  {formatDistance(p.route.route.distanceM)} lewat jalan</Text>
              </Text>
              <Text style={[styles.small, { color: c.secondaryLabel }]}>
                Rute tercepat (mobil). Jarak garis lurus Haversine: {p.straightM === null ? '-' : formatDistance(p.straightM)}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Daftar */}
      <View style={{ gap: 10 }}>
        <Segmented options={FILTERS} value={p.filter} onChange={p.onFilterChange} />
        <Text style={[styles.section, { color: c.secondaryLabel }]}>
          {p.hasDestination ? 'TERDEKAT DARI TUJUAN' : 'SEMUA LOKASI'} · {p.rows.length} DARI {p.totalCount}
        </Text>
        <View style={[styles.list, { backgroundColor: c.inset }]}>
          {p.rows.map(({ place, distanceM }, i) => (
            <Pressable
              key={place.id}
              onPress={() => p.onSelect(place.id)}
              style={[
                styles.item,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.separator },
                place.id === p.selected?.id && { backgroundColor: c.fill },
              ]}>
              <View style={[styles.badge, { backgroundColor: KIND_STYLE[place.kind].color }]}>
                <Glyph name={CATEGORY_STYLE[place.category].glyph} size={18} color="#fff" strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.body, { color: c.label }]} numberOfLines={1}>{place.name}</Text>
                <Text style={[styles.small, { color: c.secondaryLabel }]} numberOfLines={1}>
                  {CATEGORY_STYLE[place.category].label} · {place.city}
                </Text>
              </View>
              <Text style={[styles.dist, { color: c.secondaryLabel }]}>{distanceM === null ? '' : formatDistance(distanceM)}</Text>
              <Glyph name="chevron" size={13} color={c.tertiaryLabel} strokeWidth={2.5} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 18 },
  pad: { padding: 12 },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  body: { fontSize: 15 },
  small: { fontSize: 13 },
  title: { fontSize: 17, fontWeight: '600' },
  big: { fontSize: 24, fontWeight: '700' },
  section: { fontSize: 13, paddingHorizontal: 4 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  chosen: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10 },
  routeCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 10 },
  badge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  list: { borderRadius: 12, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  dist: { fontSize: 13 },
});
