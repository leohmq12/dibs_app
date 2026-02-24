import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FontFamilies } from '@/constants/theme';
import { useDemoSession } from '@/hooks/demo-session';
import { useColorScheme, useSetColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const setColorScheme = useSetColorScheme();
  const { signOut } = useDemoSession();
  const insets = useSafeAreaInsets();

  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [offlineAccess, setOfflineAccess] = useState(true);
  const [requireFaceScan, setRequireFaceScan] = useState(true);

  const handleDarkMode = (value: boolean) => {
    setDarkMode(value);
    setColorScheme(value ? 'dark' : 'light');
  };

  const cardBg = theme.cardTint;
  const cardBorder = theme.cardTintBorder;
  const dividerColor = colorScheme === 'dark' ? 'rgba(34, 198, 217, 0.08)' : 'rgba(34, 198, 217, 0.12)';
  const sectionTitleColor = theme.mutedText;
  const toggleTrackOn = '#2563EB';

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header: gear icon + Settings title */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: cardBg }]}>
            <MaterialIcons name="settings" size={24} color={theme.accent} />
          </View>
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Settings</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}>
          {/* Rounded-bottom container (design: Frame 25) */}
          <View style={[styles.contentCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {/* --- Account --- */}
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>Account</ThemedText>
            <View style={[styles.block, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Pressable style={({ pressed }) => [styles.profileRow, { opacity: pressed ? 0.9 : 1 }]}>
                <Image
                  source={require('../../assets/images/face.png')}
                  style={styles.avatar}
                />
                <View style={styles.profileText}>
                  <ThemedText style={[styles.profileName, { color: theme.text }]}>Roger Smith</ThemedText>
                  <ThemedText style={[styles.profileEmail, { color: theme.mutedText }]}>roger.smith@email.com</ThemedText>
                  <ThemedText style={[styles.profileId, { color: theme.accent }]}>ID: 8829-DIBS-SEC</ThemedText>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={theme.mutedText} style={{ opacity: 0.6 }} />
              </Pressable>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              <Pressable style={({ pressed }) => [styles.row, { opacity: pressed ? 0.9 : 1 }]}>
                <View style={[styles.iconCircle, { backgroundColor: colorScheme === 'dark' ? 'rgba(119, 126, 137, 0.3)' : 'rgba(99, 106, 117, 0.25)' }]}>
                  <MaterialIcons name="lock" size={12} color={theme.mutedText} />
                </View>
                <ThemedText style={[styles.rowLabel, { color: theme.text }]}>Reset Face ID</ThemedText>
                <MaterialIcons name="chevron-right" size={20} color={theme.mutedText} style={{ opacity: 0.6 }} />
              </Pressable>
            </View>

            {/* --- Appearance --- */}
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>Appearance</ThemedText>
            <View style={[styles.block, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.row}>
                <LinearGradient
                  colors={['#F2EA1B', '#C0B800']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}>
                  <MaterialIcons name="dark-mode" size={12} color="#FFF" />
                </LinearGradient>
                <ThemedText style={[styles.rowLabel, { color: theme.text }]}>Dark Mode</ThemedText>
                <Switch
                  value={darkMode}
                  onValueChange={handleDarkMode}
                  trackColor={{ false: theme.border, true: toggleTrackOn }}
                  thumbColor="#D9D9D9"
                />
              </View>
            </View>

            {/* --- Security --- */}
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>Security</ThemedText>
            <View style={[styles.block, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.row}>
                <LinearGradient colors={theme.blueGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconCircle}>
                  <MaterialIcons name="cloud-off" size={12} color="#FFF" />
                </LinearGradient>
                <ThemedText style={[styles.rowLabel, { color: theme.text }]}>Offline Access</ThemedText>
                <Switch
                  value={offlineAccess}
                  onValueChange={setOfflineAccess}
                  trackColor={{ false: theme.border, true: toggleTrackOn }}
                  thumbColor="#D9D9D9"
                />
              </View>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              <View style={styles.row}>
                <LinearGradient colors={theme.dangerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconCircle}>
                  <MaterialIcons name="lock" size={12} color="#FFF" />
                </LinearGradient>
                <ThemedText style={[styles.rowLabel, { color: theme.text }]}>Require Face Scan</ThemedText>
                <Switch
                  value={requireFaceScan}
                  onValueChange={setRequireFaceScan}
                  trackColor={{ false: theme.border, true: toggleTrackOn }}
                  thumbColor="#D9D9D9"
                />
              </View>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              <Pressable style={({ pressed }) => [styles.row, { opacity: pressed ? 0.9 : 1 }]}>
                <LinearGradient colors={['#F2EA1B', '#C0B800']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconCircle}>
                  <MaterialIcons name="fingerprint" size={12} color="#FFF" />
                </LinearGradient>
                <ThemedText style={[styles.rowLabel, { color: theme.text }]}>Biometric Logs</ThemedText>
                <MaterialIcons name="chevron-right" size={20} color={theme.mutedText} style={{ opacity: 0.6 }} />
              </Pressable>
            </View>

            {/* --- Privacy & Compliance --- */}
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>Privacy & Compliance</ThemedText>
            <View style={[styles.block, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Pressable style={({ pressed }) => [styles.row, { opacity: pressed ? 0.9 : 1 }]}>
                <LinearGradient colors={theme.blueGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconCircle}>
                  <MaterialIcons name="shield" size={12} color="#FFF" />
                </LinearGradient>
                <ThemedText style={[styles.rowLabel, { color: theme.text }]}>Data Retention Policy</ThemedText>
                <MaterialIcons name="chevron-right" size={20} color={theme.mutedText} style={{ opacity: 0.6 }} />
              </Pressable>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              <Pressable style={({ pressed }) => [styles.row, { opacity: pressed ? 0.9 : 1 }]}>
                <LinearGradient colors={theme.dangerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconCircle}>
                  <MaterialIcons name="file-download" size={12} color="#FFF" />
                </LinearGradient>
                <ThemedText style={[styles.rowLabel, { color: theme.text }]}>Export User Data</ThemedText>
                <MaterialIcons name="chevron-right" size={20} color={theme.mutedText} style={{ opacity: 0.6 }} />
              </Pressable>
            </View>

            {/* Log Out */}
            <Pressable
              onPress={() => {
                signOut();
                router.replace('/(auth)/login');
              }}
              style={({ pressed }) => [
                styles.logoutButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
              ]}>
              <ThemedText style={styles.logoutText}>Log Out</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FontFamilies.semiBold,
    lineHeight: 30,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  contentCard: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 1,
    borderTopWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FontFamilies.medium,
    lineHeight: 30,
    marginBottom: 0,
  },
  block: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 24,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    gap: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  profileText: { flex: 1, minWidth: 0 },
  profileName: { fontSize: 16, fontFamily: FontFamilies.medium, lineHeight: 30 },
  profileEmail: { fontSize: 12, lineHeight: 19, opacity: 0.8 },
  profileId: { fontSize: 12, lineHeight: 19 },
  divider: {
    height: 1,
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 0,
    gap: 14,
    minWidth: 0,
  },
  iconCircle: {
    width: 24,
    height: 24,
    minWidth: 24,
    minHeight: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    lineHeight: 19,
  },
  logoutButton: {
    marginTop: 32,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FontFamilies.semiBold,
  },
});
