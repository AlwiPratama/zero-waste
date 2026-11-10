import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Glyph } from '@/components/ui/Glyph';
import { useTheme } from '@/theme/useTheme';

/** Tab bar ala iOS: ikon + label kecil, garis tipis di atas, latar semi-transparan. */
export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.bg },
        tabBarActiveTintColor: c.tint,
        tabBarInactiveTintColor: c.secondaryLabel,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        tabBarStyle: {
          backgroundColor: c.barBg,
          borderTopColor: c.separator,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Peta', tabBarIcon: ({ color }) => <Glyph name="map" size={25} color={color} strokeWidth={1.8} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Pengaturan', tabBarIcon: ({ color }) => <Glyph name="sliders" size={25} color={color} strokeWidth={1.8} /> }}
      />
    </Tabs>
  );
}
