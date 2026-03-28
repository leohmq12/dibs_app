import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useViewportDimensions } from '@/hooks/use-viewport-dimensions';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const { width } = useViewportDimensions();
  const { isVaultVerified } = useDemoSession();
  const [filter, setFilter] = useState<Filter>('all');

  const { user } = useAuth();

  const padding = 16;
  const gap = 8;
  const cols = 2;
  const tileWidth = (width - padding * 2 - gap) / cols;

  const [items, setItems] = useState<{ id: string; uri: string; type: 'image' | 'video' }[]>([]);

  useEffect(() => {
    async function loadVault() {
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
    }
    loadVault();
  }, [user]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.type === (filter === 'photos' ? 'image' : 'video'));
  }, [filter, items]);

  if (!isVaultVerified) {
    return (
      <ThemedView style={styles.screen}>
        {/* Dark overlay — Pencil 2kqIm (blur + #070a121a) */}
        <View style={styles.lockedOverlay} />
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.lockedWrap}>
            {/* Single blue card — Pencil k9oFo / HpbgN: 280×256, radius 18, gradient */}
            <LinearGradient
              colors={theme.blueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.lockedCard}
            >
              <View style={styles.lockedIconWrap}>
                <MaterialIcons name="lock" size={26} color="#FFF" />
              </View>
              <ThemedText style={styles.lockedTitle}>Verify to view content</ThemedText>
              <ThemedText style={styles.lockedSubtitle}>
                Your vault stays hidden until identity verification is complete.
              </ThemedText>
              <Pressable
                onPress={() => router.push('/modal')}
                style={({ pressed }) => [
                  styles.verifyButton,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
                ]}>
                <ThemedText style={styles.verifyButtonText}>Verify to view content</ThemedText>
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
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: theme.cardTint }]}>
            <MaterialIcons name="lock" size={24} color={theme.accent} />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Media Vault</ThemedText>
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
                ]}>
                {f.id === 'photos' && <MaterialIcons name="image" size={14} color={isActive ? theme.accent : theme.mutedText} />}
                {f.id === 'videos' && <MaterialIcons name="videocam" size={14} color={isActive ? theme.accent : theme.mutedText} />}
                <ThemedText style={[styles.filterLabel, { color: isActive ? theme.text : theme.mutedText, fontFamily: isActive ? FontFamilies.medium : FontFamilies.regular }]}>
                  {f.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.tile, { width: tileWidth - gap / 2, opacity: pressed ? 0.9 : 1 }]}>
              <Image source={{ uri: item.uri }} style={styles.tileImage} contentFit="cover" />
              {item.type === 'video' && (
                <View style={styles.videoBadge}>
                  <MaterialIcons name="videocam" size={14} color="#FFF" />
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
    paddingHorizontal: 48,
  },
  lockedCard: {
    width: 280,
    borderRadius: 18,
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  lockedIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  lockedTitle: {
    fontSize: 18,
    fontFamily: FontFamilies.semiBold,
    textAlign: 'center',
    color: '#FFF',
    marginBottom: 12,
  },
  lockedSubtitle: {
    fontSize: 14,
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
  verifyButtonText: { color: '#FFF', fontSize: 14, fontFamily: FontFamilies.semiBold },
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
  headerTitle: { fontSize: 18, fontFamily: FontFamilies.semiBold },
  headerSubtitle: { fontSize: 14, opacity: 0.7 },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 40,
    borderWidth: 1,
  },
  filterLabel: { fontSize: 12 },
  gridContent: { paddingHorizontal: 16, paddingBottom: 100 },
  gridRow: { gap: 8, marginBottom: 8 },
  tile: { borderRadius: 8, overflow: 'hidden', aspectRatio: 1 },
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
