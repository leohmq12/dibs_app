import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DibsLogo } from '@/components/dibs-logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FontFamilies } from '@/constants/theme';
import { useDemoSession } from '@/hooks/demo-session';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SplashScreen() {
  const router = useRouter();
  const { isSignedIn } = useDemoSession();
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(isSignedIn ? '/(tabs)' : '/(auth)/login');
    }, 1200);
    return () => clearTimeout(timer);
  }, [isSignedIn, router]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <DibsLogo width={120} height={46} />
          </View>
          <ThemedText
            style={[
              styles.tagline,
              {
                color: colorScheme === 'dark' ? '#FFFFFF' : '#0F1A2B',
                opacity: colorScheme === 'dark' ? 1 : 0.85,
              },
            ]}>
            digital image biometric systems
          </ThemedText>
        </View>
        <View style={styles.indicator}>
          <View
            style={[
              styles.indicatorBar,
              { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(15,26,43,0.2)' },
            ]}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
  },
});
