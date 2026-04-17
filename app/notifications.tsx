import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FontFamilies } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useViewportDimensions } from '@/hooks/use-viewport-dimensions';
import { ResponsiveWrapper } from '@/components/responsive-wrapper';
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

function formatRelativeTime(dateString?: string) {
  if (!dateString) return 'Just now';
  const diffSec = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${Math.floor(diffHour / 24)}d ago`;
}

function formatLogDetails(details?: string) {
  if (!details) return 'No details provided';
  if (details.includes('Downloaded secured media')) return 'Downloaded media';
  if (details.includes('Device Passcode / Fallback Verified')) return 'PIN Verified Fallback';
  if (details.includes('Device Passcode Verification Failed')) return 'Verification Failed';
  return details;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { isMobile, isTablet } = useViewportDimensions();
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
      .channel('notifications_realtime_logs')
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

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ResponsiveWrapper maxWidth={isTablet ? 700 : 600} style={styles.content}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <ThemedText style={[styles.headerTitle, { color: theme.text, fontSize: isMobile ? 20 : 26 }]}>Notifications</ThemedText>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {logsList.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: theme.mutedText }]}>No notifications right now.</ThemedText>
            ) : (
              logsList.map((item) => (
                <View
                  key={item.id}
                  style={[styles.notificationCard, { backgroundColor: theme.cardTint, borderColor: theme.cardTintBorder }]}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: item.type === 'success' ? 'rgba(57, 198, 149, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
                    ]}>
                    <MaterialIcons
                      name={item.type === 'success' ? 'notifications-active' : 'notification-important'}
                      size={20}
                      color={item.type === 'success' ? theme.success : theme.danger}
                    />
                  </View>
                  <View style={styles.contentWrap}>
                    <ThemedText style={[styles.titleText, { color: theme.text, fontSize: isMobile ? 15 : 17 }]}>System Alert from {item.device}</ThemedText>
                    <ThemedText style={[styles.detailsText, { color: theme.mutedText, fontSize: isMobile ? 13 : 15 }]}>
                      {formatLogDetails(item.details)}
                    </ThemedText>
                    <ThemedText style={[styles.timeText, { color: theme.accent, fontSize: isMobile ? 11 : 13 }]}>
                      {formatRelativeTime(item.created_at)}
                    </ThemedText>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </ResponsiveWrapper>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: FontFamilies.semiBold, flex: 1 },
  divider: { height: 1, opacity: 0.1, marginBottom: 12 },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontFamily: FontFamilies.medium,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrap: { flex: 1, gap: 4 },
  titleText: { fontFamily: FontFamilies.medium },
  detailsText: { lineHeight: 18 },
  timeText: { fontFamily: FontFamilies.medium, marginTop: 4 },
});
