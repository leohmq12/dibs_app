import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import { Colors, FontFamilies } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const FACE_CIRCLE_SIZE = 224;
const FACE_CIRCLE_STROKE = 10;

export default function FaceEnrollScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { isMobile } = useResponsive();

  const handleEnroll = () => {
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={!isMobile && styles.tabletCont}>
          {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={12}>
            <MaterialIcons name="chevron-left" size={28} color={theme.text} />
          </Pressable>
          <ThemedText
            style={[
              styles.headerTitle,
              { color: theme.text },
            ]}>
            Face Enrollment
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Status pills: Lighting, Active, Pose */}
        <View style={styles.pillsRow}>
          <View style={[styles.pill, styles.pillGreen]}>
            <MaterialIcons name="check" size={14} color="#FFF" />
            <ThemedText style={styles.pillText}>Lighting</ThemedText>
          </View>
          <View style={[styles.pill, styles.pillBlue]}>
            <MaterialIcons name="camera-alt" size={14} color="#FFF" />
            <ThemedText style={styles.pillText}>Active</ThemedText>
          </View>
          <View style={[styles.pill, styles.pillGrey]}>
            <MaterialIcons name="refresh" size={14} color="#FFF" />
            <ThemedText style={styles.pillText}>Pose</ThemedText>
          </View>
        </View>

        {/* Central face guide circle (pure RN ring, no SVG) */}
        <View style={styles.faceGuideWrap}>
          <View style={styles.faceCircleOuter}>
            <View
              style={[
                styles.faceCircleRing,
                {
                  borderColor: 'rgba(255,255,255,0.1)',
                  width: FACE_CIRCLE_SIZE,
                  height: FACE_CIRCLE_SIZE,
                  borderRadius: FACE_CIRCLE_SIZE / 2,
                  borderWidth: FACE_CIRCLE_STROKE / 2,
                },
              ]}
            />
            <View style={[styles.faceCircleInner, { backgroundColor: theme.background }]}>
              {/* Placeholder for camera / face preview */}
            </View>
          </View>
        </View>

        <ThemedText style={[styles.instructionTitle, { color: theme.text }]}>
          Look Straight at the{'\n'}camera
        </ThemedText>
        <ThemedText style={[styles.instructionSub, { color: theme.mutedText }]}>
          Ensure your face is centered, well-lit and{'\n'}unobstructed by glasses or masks.
        </ThemedText>

        {/* Enroll button */}
        <Pressable
          onPress={handleEnroll}
          style={({ pressed }) => [
            styles.enrollButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.92 : 1 },
          ]}>
          <ThemedText style={styles.enrollButtonText}>Enroll Face ID</ThemedText>
          <MaterialIcons name="face" size={18} color="#FFF" />
        </Pressable>

        <Pressable onPress={handleSkip} style={({ pressed }) => [styles.skipWrap, { opacity: pressed ? 0.8 : 1 }]}>
          <ThemedText style={[styles.skipText, { color: theme.mutedText }]}>Skip for now</ThemedText>
        </Pressable>

        {/* Footer security message */}
        <View style={styles.footerSecure}>
          <MaterialIcons name="lock" size={18} color={theme.mutedText} style={{ opacity: 0.7 }} />
          <ThemedText style={[styles.footerSecureText, { color: theme.mutedText }]}>
            DIBS Secured. Biometric data is encrypted.
          </ThemedText>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  tabletCont: { maxWidth: 500, width: '100%', flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontFamily: FontFamilies.semiBold,
    lineHeight: 30,
  },
  headerSpacer: { width: 28 },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 40,
  },
  pillGreen: {
    backgroundColor: 'rgba(73, 221, 127, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(73, 221, 127, 0.2)',
  },
  pillBlue: {
    backgroundColor: 'rgba(148, 199, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(148, 199, 255, 0.2)',
  },
  pillGrey: {
    backgroundColor: 'rgba(99, 106, 117, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99, 106, 117, 0.2)',
  },
  pillText: { color: '#FFF', fontSize: 12, fontFamily: FontFamilies.medium },
  faceGuideWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  faceCircleOuter: {
    width: FACE_CIRCLE_SIZE,
    height: FACE_CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceCircleRing: {
    position: 'absolute',
  },
  faceCircleInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
  },
  instructionTitle: {
    fontSize: 24,
    fontFamily: FontFamilies.medium,
    lineHeight: 32,
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSub: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28,
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 46,
    borderRadius: 10,
    marginBottom: 12,
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FontFamilies.semiBold,
  },
  skipWrap: { alignSelf: 'center', paddingVertical: 12, marginBottom: 24 },
  skipText: { fontSize: 14, fontFamily: FontFamilies.regular },
  footerSecure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.7,
  },
  footerSecureText: { fontSize: 12, fontFamily: FontFamilies.regular },
});
