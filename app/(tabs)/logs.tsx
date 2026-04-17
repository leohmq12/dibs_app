import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FontFamilies } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useResponsive } from '@/hooks/use-responsive';
import { supabase } from '@/lib/supabase';

type LogItem = {
  id: string;
  name: string;
  details: string;
  device: string;
  status: 'verified' | 'blocked';
  type: 'success' | 'danger';
  created_at: string;
};

// Floating download FAB sits above tab bar — Pencil VxSUD (teal 46px) + RrBHK (download icon)
const DOWNLOAD_FAB_SIZE = 46;
const TAB_BAR_HEIGHT = 76;

function formatLogDetails(details?: string) {
  if (!details) return 'No details provided';
  if (details.includes('Downloaded secured media')) return 'Downloaded media';
  if (details.includes('Device Passcode / Fallback Verified')) return 'PIN Verified Fallback';
  if (details.includes('Device Passcode Verification Failed')) return 'Verification Failed';
  return details;
}

export default function LogsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const [search, setSearch] = useState('');
  const [logsList, setLogsList] = useState<LogItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            setLogsList(data as LogItem[]);
          }
        });
    }, [])
  );

  useEffect(() => {
    const channel = supabase
      .channel('realtime_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'logs' },
        (payload) => {
          setLogsList((prev) => [payload.new as LogItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const exportLogs = async () => {
    try {
      if (logsList.length === 0) {
        Alert.alert('No Logs', 'There are no logs to export.');
        return;
      }
      
      const header = 'ID,Name,Details,Device,Status,Type,Date\n';
      const rows = logsList.map(log => {
        const safeName = `"${(log.name || '').replace(/"/g, '""')}"`;
        const safeDetails = `"${(log.details || '').replace(/"/g, '""')}"`;
        const safeDevice = `"${(log.device || '').replace(/"/g, '""')}"`;
        const safeDate = `"${new Date(log.created_at || '').toLocaleString().replace(/"/g, '""')}"`;
        
        return `${log.id},${safeName},${safeDetails},${safeDevice},${log.status},${log.type},${safeDate}`;
      }).join('\n');
      
      const csvData = header + rows;
      const fileName = `dibs_audit_logs_${Date.now()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvData, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64Data = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'text/csv');
          await FileSystem.writeAsStringAsync(uri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
          Alert.alert('Download Complete', 'Logs successfully saved to your device.');
          
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from('logs').insert({
            user_id: user?.id,
            name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'System',
            details: 'Exported audit logs archive',
            device: Platform.OS,
            status: 'verified',
            type: 'success',
          });
        }
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Save Audit Logs',
            UTI: 'public.comma-separated-values-text'
          });
          
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from('logs').insert({
            user_id: user?.id,
            name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'System',
            details: 'Exported audit logs archive',
            device: Platform.OS,
            status: 'verified',
            type: 'success',
          });
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Export Error', 'Failed to generate the `.csv` payload securely.');
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header — Pencil: Ma4qu (icon), 667xr (title), pN3cI + tMduy (filter) */}
        <View style={[styles.header, !isMobile && styles.tabletCont]}>
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
        <View style={[styles.searchWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }, !isMobile && styles.tabletCont]}>
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
        <View style={[styles.sectionRow, !isMobile && styles.tabletCont]}>
          <ThemedText style={[styles.sectionLabel, { color: theme.text }]}>TODAY</ThemedText>
          <View style={[styles.eventPill, { backgroundColor: theme.cardTint, borderColor: theme.cardTintBorder }]}>
            <ThemedText style={[styles.eventPillText, { color: theme.accent }]}>{logsList.length} Events</ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }, !isMobile && styles.tabletCont]} />

        <ScrollView contentContainerStyle={[styles.list, !isMobile && styles.listTablet]} showsVerticalScrollIndicator={false}>
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
              <ThemedText style={[styles.logDetails, { color: theme.mutedText }]}>
                {formatLogDetails(item.details)}
              </ThemedText>
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
  safeArea: { flex: 1, alignItems: 'center' },
  tabletCont: { maxWidth: 800, width: '100%' },
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
  list: { paddingHorizontal: 16, paddingBottom: 140, gap: 12, width: '100%' },
  listTablet: { maxWidth: 800 },
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
