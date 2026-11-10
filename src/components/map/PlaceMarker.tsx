import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { Glyph } from '@/components/ui/Glyph';
import { CATEGORY_STYLE, KIND_STYLE, type Place } from '@/data/places';

type Props = { place: Place; selected: boolean; onPress: (id: string) => void };

/** Pin ala Apple Maps: lingkaran berwarna + ikon putih + cincin putih. */
export function PlaceMarker({ place, selected, onPress }: Props) {
  // Marker dengan children di-render jadi bitmap; matikan tracking setelah tampil agar hemat CPU.
  const [track, setTrack] = useState(true);
  useEffect(() => {
    setTrack(true);
    const t = setTimeout(() => setTrack(false), 500);
    return () => clearTimeout(t);
  }, [selected]);

  const size = selected ? 46 : 34;

  return (
    <Marker
      coordinate={place.coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={track}
      zIndex={selected ? 10 : 1}
      onPress={(e) => {
        e.stopPropagation();
        onPress(place.id);
      }}>
      <View style={styles.box}>
        <View
          style={[
            styles.pin,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: KIND_STYLE[place.kind].color },
          ]}>
          <Glyph name={CATEGORY_STYLE[place.category].glyph} size={selected ? 24 : 18} color="#fff" strokeWidth={2.2} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  box: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  pin: {
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
});
