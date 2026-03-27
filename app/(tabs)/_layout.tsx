import { Tabs } from 'expo-router';
import React, { useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { FloatingTabBar } from '@/components/floating-tab-bar';
import { OverlayPortalContext } from '@/hooks/overlay-portal-context';

export default function TabLayout() {
  const overlayHostRef = useRef<View | null>(null);

  return (
    <OverlayPortalContext.Provider value={Platform.OS === 'web' ? overlayHostRef : null}>
      <View style={styles.container}>
        <Tabs
          screenOptions={{
            headerShown: false,
          }}
          tabBar={(props) => <FloatingTabBar {...props} />}
        />
        {Platform.OS === 'web' ? (
          <View
            ref={overlayHostRef}
            style={styles.portalHost}
            pointerEvents="box-none"
            collapsable={false}
          />
        ) : null}
      </View>
    </OverlayPortalContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative' as const,
  },
  portalHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    pointerEvents: 'box-none' as const,
  },
});