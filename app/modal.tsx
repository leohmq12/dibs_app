/**
 * Verify Identity modal — Pencil F42wX (Model2) / CIzTh.
 * Centered card on dark background, not a bottom sheet.
 */
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FontFamilies } from '@/constants/theme';
import { useDemoSession } from '@/hooks/demo-session';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CARD_WIDTH = 320;
const FACE_SIZE = 174;

export default function IdentityVerificationModal() {
  const router = useRouter();
  const { verifyVault } = useDemoSession();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    setVerifying(true);
    verifyVault();
    setTimeout(() => router.back(), 400);
  };

  const cardBg = colorScheme === 'dark' ? '#11141C' : theme.surface;

  return (
    <ThemedView style={styles.screen} lightColor="rgba(0, 0, 0, 0.45)" darkColor="#070A12">
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={FadeIn.duration(220)}
            style={[styles.card, { backgroundColor: cardBg, borderColor: theme.cardTintBorder }]}>
            {/* Padlock — Pencil ADGv9: 60×60, teal tint */}
            <View style={[styles.iconWrap, { backgroundColor: theme.cardTint }]}>
              <MaterialIcons name="lock" size={32} color={theme.accent} />
            </View>
            <ThemedText style={[styles.title, { color: theme.text }]}>Verify Identity</ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.mutedText }]}>
              Securely confirm your identity to unlock the vault.
            </ThemedText>

            {/* Instruction — Pencil WmORg */}
            <View style={[styles.instructionBox, { backgroundColor: theme.cardTint, borderColor: theme.cardTintBorder }]}>
              <MaterialIcons name="lightbulb-outline" size={24} color={theme.mutedText} style={{ opacity: 0.7 }} />
              <ThemedText style={[styles.instructionText, { color: theme.mutedText }]}>
                Remove hats or glasses, keep a neutral expression and stay still.
              </ThemedText>
            </View>

            {/* Face / scan area — Pencil 1Cise: 174×174, teal border */}
            <View style={[styles.faceFrame, { borderColor: theme.accent }]}>
              <Image
                source={require('../assets/images/face.png')}
                style={styles.faceImage}
                contentFit="contain"
              />
            </View>

            {/* Scanning pill — Pencil UymuP */}
            <View style={[styles.scanningPill, { backgroundColor: theme.cardTint, borderColor: theme.cardTintBorder }]}>
              <MaterialIcons name="videocam" size={14} color={theme.accent} />
              <ThemedText style={[styles.scanningText, { color: theme.accent }]}>Scanning</ThemedText>
            </View>

            {/* Red button — Pencil fr50r: 230×46 */}
            <Pressable
              onPress={handleVerify}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
              ]}>
              <ThemedText style={styles.primaryButtonText}>Use Pin Instead</ThemedText>
            </Pressable>

            {/* Cancel — Pencil LguQx */}
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.8 }]}>
              <ThemedText style={[styles.cancelButtonText, { color: theme.mutedText }]}>Cancel Verification</ThemedText>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 28,
  },
  card: {
    width: CARD_WIDTH,
    maxWidth: '100%',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: FontFamilies.semiBold,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  faceFrame: {
    width: FACE_SIZE,
    height: FACE_SIZE,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  faceImage: {
    width: 152,
    height: 152,
    borderRadius: 12,
  },
  scanningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 40,
    borderWidth: 1,
    marginBottom: 24,
  },
  scanningText: {
    fontSize: 12,
    fontFamily: FontFamilies.medium,
  },
  primaryButton: {
    width: 230,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFF', fontSize: 14, fontFamily: FontFamilies.semiBold },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: { fontSize: 14, opacity: 0.7 },
});
