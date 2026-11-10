import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FoodMap } from "@/components/map/FoodMap";
import type { FoodMapHandle } from "@/components/map/types";
import {
  Panel,
  type DestMode,
  type PlaceFilter,
} from "@/components/panel/Panel";
import {
  BottomSheet,
  SHEET_PEEK,
  type SheetSnap,
} from "@/components/sheet/BottomSheet";
import { Glyph } from "@/components/ui/Glyph";
import { DEFAULT_CENTER } from "@/constants/geo";
import { PLACES } from "@/data/places";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useRoute } from "@/hooks/useRoute";
import { haversineMeters, sortByDistance } from "@/lib/geo/haversine";
import type { LatLng } from "@/lib/geo/types";
import type { GeocodeResult } from "@/lib/geocoding/nominatim";
import { useSettings } from "@/store/settings";
import { shadow } from "@/theme/shadow";
import { useTheme } from "@/theme/useTheme";

const WIDE_BREAKPOINT = 900;
const MAX_ROWS = 25;

export default function MapScreen() {
  const { c, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;

  const simulate = useSettings((s) => s.simulate);
  const adaptive = useSettings((s) => s.adaptive);

  const mapRef = useRef<FoodMapHandle>(null);
  const [areaH, setAreaH] = useState(0);
  const [snap, setSnap] = useState<SheetSnap>("half");
  const [simPos, setSimPos] = useState<LatLng | null>(null);
  const [filter, setFilter] = useState<PlaceFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [destMode, setDestMode] = useState<DestMode>("live");
  const [destAddress, setDestAddress] = useState<GeocodeResult | null>(null);
  const search = useAddressSearch();

  // --- Posisi saya (GPS realtime, atau simulasi lewat ketukan di peta) ---
  const tracking = useLocationTracking({ enabled: !simulate, adaptive });
  const gps = tracking.location;
  const myPos: LatLng | null = simulate ? simPos : (gps?.coords ?? null);

  useEffect(() => {
    if (simulate && !simPos) setSimPos(gps?.coords ?? DEFAULT_CENTER);
  }, [simulate, simPos, gps]);

  // --- Tujuan: lokasi terkini (berubah realtime) atau alamat pilihan ---
  const destination: LatLng | null =
    destMode === "live" ? myPos : (destAddress?.coordinate ?? null);
  const reference = destination ?? myPos;

  const places = useMemo(
    () => PLACES.filter((p) => filter === "all" || p.kind === filter),
    [filter],
  );
  const rows = useMemo(
    () =>
      (reference
        ? sortByDistance(reference, places).map(({ item, distanceM }) => ({
            place: item,
            distanceM,
          }))
        : places.map((place) => ({ place, distanceM: null }))
      ).slice(0, MAX_ROWS),
    [reference, places],
  );

  // --- Rute tercepat dari pin terpilih ke tujuan ---
  const selected = PLACES.find((p) => p.id === selectedId) ?? null;
  const routeState = useRoute(selected?.coordinate ?? null, destination);
  const straightM =
    selected && destination
      ? haversineMeters(selected.coordinate, destination)
      : null;

  const bottomInset = wide
    ? 0
    : snap === "hidden"
      ? SHEET_PEEK + 10
      : Math.round(areaH * 0.5);

  // Zoom ke seluruh rute sekali per (pin, tujuan); pembaruan realtime tidak menggeser kamera.
  const fitKey = selected
    ? `${selected.id}|${destMode}|${destAddress?.id ?? ""}`
    : "";
  const fittedRef = useRef("");
  useEffect(() => {
    if (!selected) {
      fittedRef.current = "";
      return;
    }
    if (
      routeState.status !== "ready" ||
      !routeState.route ||
      fittedRef.current === fitKey
    )
      return;
    fittedRef.current = fitKey;
    mapRef.current?.fitCoordinates(routeState.route.coordinates);
  }, [selected, routeState.status, routeState.route, fitKey]);

  const onSelect = (id: string) => {
    setSelectedId(id);
    setSnap((s) => (s === "full" || s === "hidden" ? "half" : s));
    if (!destination) mapRef.current?.focusPlace(id);
  };

  const onMapPress = (coord: LatLng) => {
    if (simulate) setSimPos(coord);
    else setSelectedId(null);
  };

  const liveText = simulate
    ? "Mode simulasi aktif: ketuk peta untuk memindahkan posisimu."
    : tracking.permission === "denied" || tracking.permission === "unavailable"
      ? `${tracking.error ?? "Lokasi tidak tersedia"} Aktifkan izin lokasi atau pakai mode simulasi di Pengaturan.`
      : gps
        ? `${tracking.tierLabel} · interval ${tracking.distanceInterval} m. Rute ikut diperbarui saat kamu bergerak.`
        : "Menunggu posisi…";

  const panel = (bottomPad: number) => (
    <Panel
      bottomPad={bottomPad}
      destMode={destMode}
      onDestModeChange={setDestMode}
      liveText={liveText}
      search={search}
      destAddress={destAddress}
      onPickAddress={(r) => {
        setDestAddress(r);
        search.setQuery(r.title);
        search.clearResults();
      }}
      onClearAddress={() => {
        setDestAddress(null);
        search.setQuery("");
      }}
      filter={filter}
      onFilterChange={setFilter}
      rows={rows}
      totalCount={places.length}
      selected={selected}
      onSelect={onSelect}
      onClearSelection={() => setSelectedId(null)}
      hasDestination={destination !== null}
      route={routeState}
      straightM={straightM}
    />
  );

  const heading = (
    <View>
      <Text style={[styles.title, { color: c.label }]}>
        Peta Surplus Makanan
      </Text>
      <Text style={[styles.subtitle, { color: c.secondaryLabel }]}>
        {PLACES.length} lokasi di Jawa Timur
      </Text>
    </View>
  );

  return (
    <View
      style={styles.flex}
      onLayout={(e: LayoutChangeEvent) => setAreaH(e.nativeEvent.layout.height)}
    >
      <FoodMap
        ref={mapRef}
        places={places}
        scheme={scheme}
        userLocation={myPos}
        userAccuracy={simulate ? null : (gps?.accuracy ?? null)}
        selectedId={selectedId}
        onSelectPlace={onSelect}
        onMapPress={onMapPress}
        route={routeState.route?.coordinates ?? null}
        destination={
          destMode === "address" ? (destAddress?.coordinate ?? null) : null
        }
        bottomInset={bottomInset}
        zoomControl={wide}
      />

      {/* Tombol melayang kanan-atas ala Apple Maps */}
      <View style={[styles.fabs, { top: insets.top + 12 }]}>
        <Pressable
          style={[styles.fab, { backgroundColor: c.sheet }]}
          onPress={() => mapRef.current?.focusUser()}
        >
          <Glyph name="locate" size={18} color={c.tint} />
        </Pressable>
        <Pressable
          style={[styles.fab, { backgroundColor: c.sheet }]}
          onPress={() => mapRef.current?.fitAll()}
        >
          <Glyph name="fit" size={19} color={c.tint} />
        </Pressable>
      </View>

      {simulate && (
        <View
          style={[
            styles.pill,
            { top: insets.top + 12, backgroundColor: c.sheet },
          ]}
        >
          <Text style={[styles.pillText, { color: c.orange }]}>
            Mode simulasi
          </Text>
        </View>
      )}

      {wide ? (
        <View
          style={[
            styles.side,
            { backgroundColor: c.sheet, top: insets.top + 12 },
          ]}
        >
          <View style={styles.sideHeader}>{heading}</View>
          {panel(24)}
        </View>
      ) : (
        areaH > 0 && (
          <BottomSheet
            height={areaH}
            topGap={insets.top + 8}
            snap={snap}
            onSnapChange={setSnap}
            header={heading}
            backgroundColor={c.sheet}
            handleColor={c.tertiaryLabel}
          >
            {({ bottomPad }) => panel(bottomPad)}
          </BottomSheet>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, overflow: "hidden" },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 1 },
  fabs: { position: "absolute", right: 12, gap: 10 },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...shadow({ y: 2, blur: 10, opacity: 0.25, elevation: 5 }),
  },
  pill: {
    position: "absolute",
    left: 12,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
  },
  pillText: { fontSize: 13, fontWeight: "600" },
  side: {
    position: "absolute",
    left: 12,
    bottom: 12,
    width: 400,
    borderRadius: 16,
    overflow: "hidden",
    ...shadow({ y: 0, blur: 24, opacity: 0.3, elevation: 10 }),
  },
  sideHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
});
