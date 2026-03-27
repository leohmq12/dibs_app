import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useViewportDimensions } from '@/hooks/use-viewport-dimensions';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DibsLogo } from '@/components/dibs-logo';
import { FontFamilies } from '@/constants/theme';
import { useDemoSession } from '@/hooks/demo-session';

// Splash uses fixed dark theme to match appUI.pen Splash Screen (node pTXsO)
const SPLASH_BG = '#070A12';

// Splash background overlay (fingerprint-style texture)
const SPLASH_OVERLAY = require('@/assets/images/splash_overlay.png');

export default function SplashScreen() {
  const router = useRouter();
  const { isSignedIn } = useDemoSession();
  const { width, height } = useViewportDimensions();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      router.replace(isSignedIn ? '/(tabs)' : '/(auth)/login');
    }, 1200);
    return () => clearTimeout(timer);
  }, [session, isLoading, router]);

  return (
    <View style={styles.screen}>
      <View style={styles.background}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: SPLASH_BG }]} />
        <Image
          source={SPLASH_OVERLAY}
          style={[styles.decoration, { width, height }]}
          resizeMode="cover"
          accessibilityLabel=""
        />
      </View>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <DibsLogo width={280} height={108} />
          </View>
          <Text style={styles.tagline}>digital image biometric systems</Text>
        </View>
        <View style={styles.indicator}>
          <View style={styles.indicatorBar} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SPLASH_BG,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  decoration: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  logoWrap: {
    alignItems: 'center',
  },
  tagline: {
    fontFamily: FontFamilies.medium,
    fontSize: 13,
    letterSpacing: 2,
    lineHeight: 30,
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  indicator: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  indicatorBar: {
    width: 135,
    height: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
