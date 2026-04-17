import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useViewportDimensions } from '@/hooks/use-viewport-dimensions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResponsiveWrapper } from '@/components/responsive-wrapper';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FontFamilies } from '@/constants/theme';
import { useDemoSession } from '@/hooks/demo-session';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

type Filter = 'all' | 'photos' | 'videos';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'photos', label: 'Photos' },
  { id: 'videos', label: 'Videos' },
];

export default function VaultScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { width, isMobile, isTablet } = useViewportDimensions();
  const insets = useSafeAreaInsets();
  const { isVaultVerified } = useDemoSession();
  const [filter, setFilter] = useState<Filter>('all');

  const { user } = useAuth();

  const padding = 16;
  const gap = 12;
  
  // Responsive columns
  const cols = isMobile ? 2 : isTablet ? 3 : 4;
  
  // Actual container width (limited on large screens)
  const containerWidth = isMobile ? width : Math.min(width, 1000);
  const tileWidth = (containerWidth - padding * 2 - gap * (cols - 1)) / cols;

  const [items, setItems] = useState<{ id: string; uri: string; type: 'image' | 'video' }[]>([]);

  const loadVault = useCallback(async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase.storage.from('vault').list(user.id);
    if (error || !data) return;

    const fileNames = data.filter((f) => f.name !== '.emptyFolderPlaceholder').map((f) => `${user.id}/${f.name}`);
    if (fileNames.length === 0) {
      setItems([]);
      return;
    }

    const { data: signedUrls } = await supabase.storage.from('vault').createSignedUrls(fileNames, 60 * 60);

    if (signedUrls) {
      const out = signedUrls.map((s, i) => {
        const fileName = fileNames[i];
        const isVid = /\.(mp4|mov|avi)$/i.test(fileName);
        return {
          id: fileName,
          uri: s.signedUrl || '',
          type: (isVid ? 'video' : 'image') as 'image' | 'video',
        };
      });
      setItems(out);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadVault();
    }, [loadVault])
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.type === (filter === 'photos' ? 'image' : 'video'));
  }, [filter, items]);

  if (!isVaultVerified) {
    return (
      <ThemedView style={styles.screen}>
        <View style={styles.lockedOverlay} />
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.lockedWrap}>
            <LinearGradient
              colors={theme.blueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.lockedCard, !isMobile && { width: 400, paddingVertical: 40 }]}
            >
              <View style={styles.lockedIconWrap}>
                <MaterialIcons name="lock" size={32} color="#FFF" />
              </View>
              <ThemedText style={[styles.lockedTitle, !isMobile && { fontSize: 24 }]}>Verify to view content</ThemedText>
              <ThemedText style={[styles.lockedSubtitle, !isMobile && { fontSize: 16 }]}>
                Your vault stays hidden until identity verification is complete.
              </ThemedText>
              <Pressable
                onPress={() => router.push('/modal')}
                style={({ pressed }) => [
                  styles.verifyButton,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
                  !isMobile && { width: 300, height: 54 }
                ]}>
                <ThemedText style={[styles.verifyButtonText, !isMobile && { fontSize: 16 }]}>Verify Identity</ThemedText>
              </Pressable>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ResponsiveWrapper maxWidth={1000} style={styles.headerWrapper}>
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: theme.cardTint }]}>
              <MaterialIcons name="lock" size={24} color={theme.accent} />
            </View>
            <View style={styles.headerText}>
              <ThemedText style={[styles.headerTitle, { color: theme.text, fontSize: isMobile ? 18 : 24 }]}>Media Vault</ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: theme.mutedText }]}>{filtered.length} items</ThemedText>
            </View>
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map((f) => {
              const isActive = filter === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => setFilter(f.id)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? (colorScheme === 'dark' ? theme.cardTint : theme.surface2) : 'transparent',
                      borderColor: isActive ? theme.accent : theme.cardTintBorder,
                      opacity: pressed ? 0.9 : 1,
                    },
                    !isMobile && { paddingHorizontal: 20, paddingVertical: 10 }
                  ]}>
                  {f.id === 'photos' && <MaterialIcons name="image" size={16} color={isActive ? theme.accent : theme.mutedText} />}
                  {f.id === 'videos' && <MaterialIcons name="videocam" size={16} color={isActive ? theme.accent : theme.mutedText} />}
                  <ThemedText style={[styles.filterLabel, { color: isActive ? theme.text : theme.mutedText, fontFamily: isActive ? FontFamilies.medium : FontFamilies.regular, fontSize: isMobile ? 12 : 14 }]}>
                    {f.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ResponsiveWrapper>

        <FlatList
          data={filtered}
          numColumns={cols}
          key={cols} // Force re-render when cols change
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.gridContent, { alignSelf: isMobile ? 'stretch' : 'center', width: containerWidth }]}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/viewer', params: { url: item.uri, type: item.type } })}
              style={({ pressed }) => [styles.tile, { width: tileWidth, opacity: pressed ? 0.9 : 1 }]}>
              <Image source={{ uri: item.uri }} style={styles.tileImage} contentFit="cover" />
              {item.type === 'video' && (
                <View style={[styles.videoBadge, !isMobile && { padding: 8, borderRadius: 8 }]}>
                  <MaterialIcons name="videocam" size={isMobile ? 14 : 20} color="#FFF" />
                </View>
              )}
            </Pressable>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 10, 18, 0.85)',
  },
  lockedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  lockedCard: {
    borderRadius: 18,
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  lockedIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  lockedTitle: {
    fontFamily: FontFamilies.semiBold,
    textAlign: 'center',
    color: '#FFF',
    marginBottom: 12,
  },
  lockedSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
  },
  verifyButton: {
    width: 230,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: { color: '#FFF', fontFamily: FontFamilies.semiBold },
  headerWrapper: {
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { fontFamily: FontFamilies.semiBold },
  headerSubtitle: { fontSize: 14, opacity: 0.7 },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 40,
    borderWidth: 1,
  },
  filterLabel: { },
  gridContent: { paddingHorizontal: 16, paddingBottom: 100 },
  gridRow: { gap: 12, marginBottom: 12 },
  tile: { borderRadius: 12, overflow: 'hidden', aspectRatio: 1 },
  tileImage: { width: '100%', height: '100%' },
  videoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
});
