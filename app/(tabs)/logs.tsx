import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FontFamilies } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { supabase } from '@/lib/supabase';

type LogItem = {
  id: string;
  name: string;
  details: string;
  device: string;
  status: 'verified' | 'blocked';
  type: 'success' | 'danger';
};

// Floating download FAB sits above tab bar — Pencil VxSUD (teal 46px) + RrBHK (download icon)
const DOWNLOAD_FAB_SIZE = 46;
const TAB_BAR_HEIGHT = 76;

export default function LogsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [logsList, setLogsList] = useState<LogItem[]>([]);

  useEffect(() => {
    supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setLogsList(data as LogItem[]);
        }
      });
  }, []);

  const exportLogs = () => {
    // TODO: wire to real export (share file, save to storage)
    Alert.alert('Export Logs', 'Log export will be available here.');
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header — Pencil: Ma4qu (icon), 667xr (title), pN3cI + tMduy (filter) */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: theme.cardTint }]}>
            <MaterialIcons name="access-time" size={24} color={theme.accent} />
          </View>
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Audit & Access Logs</ThemedText>
          <Pressable
            style={[styles.filterButton, { backgroundColor: theme.cardTint, borderColor: theme.cardTintBorder }]}
            onPress={() => {}}
            hitSlop={8}
          >
            <MaterialIcons name="filter-list" size={18} color={theme.text} />
          </Pressable>
        </View>

        {/* Search — Pencil MeZcF (343x36, radius 6) */}
        <View style={[styles.searchWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <MaterialIcons name="search" size={18} color={theme.mutedText} />
          <TextInput
            placeholder="Search logs..."
            placeholderTextColor={theme.mutedText}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        {/* Section — TODAY + Events pill */}
        <View style={styles.sectionRow}>
          <ThemedText style={[styles.sectionLabel, { color: theme.text }]}>TODAY</ThemedText>
          <View style={[styles.eventPill, { backgroundColor: theme.cardTint, borderColor: theme.cardTintBorder }]}>
            <ThemedText style={[styles.eventPillText, { color: theme.accent }]}>{logsList.length} Events</ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {logsList.map((item) => (
            <View
              key={item.id}
              style={[styles.logCard, { backgroundColor: theme.cardTint, borderColor: theme.cardTintBorder }]}>
              <View style={styles.logTopRow}>
                <View
                  style={[
                    styles.logIcon,
                    { backgroundColor: item.type === 'success' ? 'rgba(57, 198, 149, 0.2)' : 'rgba(239, 68, 68, 0.2)' },
                  ]}>
                  <MaterialIcons
                    name={item.type === 'success' ? 'check-circle' : 'block'}
                    size={20}
                    color={item.type === 'success' ? theme.success : theme.danger}
                  />
                </View>
                <ThemedText style={[styles.logName, { color: theme.text }]}>{item.name}</ThemedText>
                <View
                  style={[
                    styles.statusButton,
                    item.status === 'verified'
                      ? { backgroundColor: theme.surface, borderColor: theme.border }
                      : { backgroundColor: theme.danger },
                  ]}>
                  <ThemedText
                    style={[
                      styles.statusButtonText,
                      { color: item.status === 'verified' ? theme.text : '#FFF' },
                    ]}>
                    {item.status === 'verified' ? 'Verified' : 'Blocked'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.logDetails, { color: theme.mutedText }]}>{item.details || 'No details provided'}</ThemedText>
              <View style={[styles.deviceTag, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                <MaterialIcons name="smartphone" size={14} color={theme.mutedText} />
                <ThemedText style={[styles.deviceText, { color: theme.mutedText }]}>{item.device || 'Unknown Device'}</ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Floating download FAB — Pencil VxSUD (teal circle) + RrBHK (download icon) */}
        <Pressable
          onPress={exportLogs}
          style={({ pressed }) => [
            styles.downloadFab,
            {
              backgroundColor: theme.accent,
              bottom: TAB_BAR_HEIGHT + insets.bottom + 12,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <MaterialIcons name="download" size={24} color="#FFF" />
        </Pressable>
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
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: FontFamilies.semiBold, lineHeight: 30, flex: 1 },
  filterButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: FontFamilies.regular, paddingVertical: 0 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionLabel: { fontSize: 14, fontFamily: FontFamilies.medium, letterSpacing: 1 },
  eventPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 40,
    borderWidth: 1,
  },
  eventPillText: { fontSize: 10, fontFamily: FontFamilies.medium },
  divider: { height: 1, marginHorizontal: 16, marginBottom: 12, opacity: 0.1 },
  list: { paddingHorizontal: 16, paddingBottom: 140, gap: 12 },
  logCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
  },
  logTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logName: { fontSize: 16, fontFamily: FontFamilies.medium, flex: 1 },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
  },
  statusButtonText: { fontSize: 12, fontFamily: FontFamilies.medium },
  logDetails: { fontSize: 13, marginLeft: 50, marginBottom: 8 },
  deviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deviceText: { fontSize: 12 },
  downloadFab: {
    position: 'absolute',
    right: 16,
    width: DOWNLOAD_FAB_SIZE,
    height: DOWNLOAD_FAB_SIZE,
    borderRadius: DOWNLOAD_FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
