// Implementasi NATIVE (Android/iOS) memakai react-native-maps.
// Di web, Metro otomatis memakai FoodMap.web.tsx (Leaflet) karena react-native-maps tidak mendukung web.
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';

import { Glyph } from '@/components/ui/Glyph';
import { JATIM_REGION } from '@/constants/geo';
import { DESTINATION_COLOR, KIND_STYLE, USER_COLOR } from '@/data/places';
import { DARK_MAP_STYLE } from './dark-style';
import { PlaceMarker } from './PlaceMarker';
import type { FoodMapHandle, FoodMapProps } from './types';

export const FoodMap = forwardRef<FoodMapHandle, FoodMapProps>(function FoodMap(
  {
    places, scheme, userLocation, userAccuracy, selectedId, onSelectPlace, onMapPress,
    route, destination, bottomInset = 0,
  },
  ref,
) {
  const mapRef = useRef<MapView>(null);
  const selected = places.find((p) => p.id === selectedId) ?? null;

  const fit = (coords: { latitude: number; longitude: number }[]) => {
    if (coords.length === 0) return;
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 120, right: 50, bottom: bottomInset + 50, left: 50 },
      animated: true,
    });
  };

  useImperativeHandle(ref, () => ({
    focusUser() {
      if (!userLocation) return;
      mapRef.current?.animateToRegion({ ...userLocation, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 600);
    },
    focusPlace(id) {
      const p = places.find((x) => x.id === id);
      if (!p) return;
      mapRef.current?.animateToRegion({ ...p.coordinate, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 600);
    },
    fitAll() {
      const coords = places.map((p) => p.coordinate);
      if (userLocation) coords.push(userLocation);
      fit(coords);
    },
    fitCoordinates: fit,
  }));

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={JATIM_REGION}
      userInterfaceStyle={scheme}
      customMapStyle={scheme === 'dark' ? DARK_MAP_STYLE : undefined}
      onPress={(e) => onMapPress?.(e.nativeEvent.coordinate)}
      toolbarEnabled={false}
      showsCompass={false}>
      {places.map((p) => (
        <PlaceMarker key={p.id} place={p} selected={p.id === selectedId} onPress={onSelectPlace} />
      ))}

      {route && route.length > 1 && (
        <>
          <Polyline coordinates={route} strokeColor="#FFFFFF" strokeWidth={9} lineCap="round" lineJoin="round" />
          <Polyline coordinates={route} strokeColor={USER_COLOR} strokeWidth={5} lineCap="round" lineJoin="round" />
        </>
      )}

      {!route && userLocation && selected && (
        <Polyline
          coordinates={[selected.coordinate, userLocation]}
          strokeColor={KIND_STYLE[selected.kind].color}
          strokeWidth={3}
          lineDashPattern={[10, 8]}
        />
      )}

      {userLocation && userAccuracy != null && userAccuracy < 500 && (
        <Circle
          center={userLocation}
          radius={userAccuracy}
          strokeColor="rgba(10,132,255,0.5)"
          fillColor="rgba(10,132,255,0.12)"
        />
      )}

      {userLocation && (
        <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }} zIndex={20} tracksViewChanges={false}>
          <View style={styles.userHalo}>
            <View style={styles.userDot} />
          </View>
        </Marker>
      )}

      {destination && (
        <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }} zIndex={30}>
          <View style={styles.destPin}>
            <Glyph name="flag" size={18} color="#fff" strokeWidth={2.4} />
          </View>
        </Marker>
      )}
    </MapView>
  );
});

const styles = StyleSheet.create({
  userHalo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(10,132,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: USER_COLOR, borderWidth: 3, borderColor: '#fff' },
  destPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DESTINATION_COLOR,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
