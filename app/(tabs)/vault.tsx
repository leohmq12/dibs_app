import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useMemo, useState, useEffect } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { decode } from 'base64-arraybuffer';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FontFamilies } from '@/constants/theme';
import { useDemoSession } from '@/hooks/demo-session';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

type VaultCategory = 'all' | 'images' | 'videos' | 'docs' | 'ids';
type VaultItemCategory = Exclude<VaultCategory, 'all'>;

type VaultItem = {
  id: string;
  type: 'image' | 'video';
  category: VaultItemCategory;
  name: string;
  source: { uri: string };
};

const CATEGORY_CARDS: { id: VaultCategory; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'all', label: 'All', icon: 'grid-view' },
  { id: 'images', label: 'Images', icon: 'image' },
  { id: 'videos', label: 'Videos', icon: 'videocam' },
  { id: 'docs', label: 'Documents', icon: 'description' },
  { id: 'ids', label: 'IDs', icon: 'credit-card' },
];

export default function VaultScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const { isVaultVerified } = useDemoSession();
  const { user } = useAuth();
  
  const [filter, setFilter] = useState<VaultCategory>('all');
  const [activeItem, setActiveItem] = useState<VaultItem | null>(null);
  const [contentWidth, setContentWidth] = useState<number>(0);

  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchVaultItems = async () => {
    if (!user) return;
    setIsLoadingItems(true);
    try {
      const { data, error } = await supabase.storage.from('vault').list(user.id + '/', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) {
        if (error.message.includes('The resource was not found')) {
            // Bucket or folder doesn't exist yet, that's fine.
            setItems([]);
            return;
        }
        throw error;
      }

      if (data) {
        const validFiles = data.filter((file) => file.name !== '.emptyFolderPlaceholder');
        
        const itemsMap: VaultItem[] = (await Promise.all(
          validFiles.map(async (file): Promise<VaultItem | null> => {
            const { data, error } = await supabase.storage
              .from('vault')
              .createSignedUrl(`${user.id}/${file.name}`, 3600);
            
            if (error || !data) {
              console.error('Error creating signed URL for', file.name, error);
              return null;
            }
            
            const signedUrl = data.signedUrl;
            
            const mimetype = file.metadata?.mimetype || '';
            const isVideo = mimetype.includes('video') || file.name.match(/\.(mp4|mov)$/i);
            const isImage = mimetype.includes('image') || file.name.match(/\.(jpg|jpeg|png|gif)$/i);
            
            let category: VaultItemCategory = 'docs';
            if (isVideo) category = 'videos';
            else if (isImage) category = 'images';
            
            return {
              id: file.id || file.name,
              name: file.name,
              type: isVideo ? 'video' : 'image',
              category,
              source: { uri: signedUrl },
            };
          })
        )).filter((item): item is VaultItem => item !== null);
        
        setItems(itemsMap);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    if (isVaultVerified && user) {
      fetchVaultItems();
    }
  }, [isVaultVerified, user]);

  const uploadMedia = async () => {
    if (!user) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        const asset = result.assets[0];
        const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
        const ext = asset.uri.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `${user.id}/${fileName}`;
        
        const contentType = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');

        const { error } = await supabase.storage
          .from('vault')
          .upload(filePath, decode(base64), { contentType });

        if (error) {
          throw error;
        }
        
        fetchVaultItems();
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Upload Failed', error.message || 'Check if "vault" bucket exists with required RLS.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadMedia = async (item: VaultItem) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${item.name}`;
      const downloadResult = await FileSystem.downloadAsync(item.source.uri, fileUri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        Alert.alert('Sharing not available', `File downloaded to ${downloadResult.uri}`);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Download Failed', error.message);
    }
  };

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.category === filter);
  }, [filter, items]);

  const categoryCounts = useMemo(() => {
    const counts: Record<VaultCategory, number> = {
      all: items.length,
      images: 0,
      videos: 0,
      docs: 0,
      ids: 0,
    };
    items.forEach((item) => {
      counts[item.category] += 1;
    });
    return counts;
  }, [items]);

  const layoutWidth = contentWidth || width;
  const horizontalPadding = 12;
  const gap = 4;
  const availableWidth = Math.max(0, layoutWidth - horizontalPadding * 2);
  const columns = availableWidth < 330 ? 3 : availableWidth < 420 ? 4 : 5;
  const tileSize = Math.max(56, Math.floor((availableWidth - gap * (columns - 1)) / columns));
  const chipGap = 8;

  if (!isVaultVerified) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.lockedWrap}>
            <View style={[styles.lockedIcon, { backgroundColor: theme.surface }]}>
              <MaterialIcons name="lock" size={24} color={theme.primary} />
            </View>
            <ThemedText type="title" style={styles.lockedTitle}>
              Verify to view content
            </ThemedText>
            <ThemedText style={[styles.lockedSubtitle, { color: theme.mutedText }]}>
              Your vault stays hidden until identity verification is complete.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/modal')}
              style={({ pressed }) => [
                styles.verifyButton,
                {
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}>
              <ThemedText style={{ color: '#FFFFFF', fontFamily: FontFamilies.semiBold }}>
                Verify to View Content
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.content} onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}>
          <FlatList
            data={filteredItems}
            key={String(columns)}
            numColumns={columns}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: horizontalPadding,
              paddingBottom: 80,
            }}
            columnWrapperStyle={{ gap }}
            ItemSeparatorComponent={() => <View style={{ height: gap }} />}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                {isLoadingItems ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <>
                    <MaterialIcons name="folder-open" size={48} color={theme.surface2} style={{marginBottom: 8}}/>
                    <ThemedText style={{ color: theme.mutedText }}>No items found in Vault</ThemedText>
                  </>
                )}
              </View>
            }
            ListHeaderComponent={
              <View>
                <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
                  <View style={styles.headerRow}>
                    <View>
                      <ThemedText type="title">Vault</ThemedText>
                      <ThemedText style={{ color: theme.mutedText, fontFamily: FontFamilies.medium }}>
                        {filteredItems.length} items
                      </ThemedText>
                    </View>
                    <Pressable
                      onPress={uploadMedia}
                      disabled={isUploading}
                      style={({ pressed }) => [
                        styles.uploadButton,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                          opacity: pressed || isUploading ? 0.7 : 1,
                        },
                      ]}>
                      {isUploading ? (
                         <ActivityIndicator size="small" color={theme.primary} />
                      ) : (
                         <>
                           <MaterialIcons name="upload" size={18} color={theme.primary} />
                           <ThemedText style={{fontFamily: FontFamilies.semiBold, fontSize: 13, color: theme.primary}}>Upload</ThemedText>
                         </>
                      )}
                    </Pressable>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.categoryRow,
                    { paddingHorizontal: horizontalPadding, paddingRight: horizontalPadding + 6, gap: chipGap },
                  ]}>
                  {CATEGORY_CARDS.map((category) => {
                    const isActive = filter === category.id;
                    return (
                      <Pressable
                        key={category.id}
                        onPress={() => setFilter(category.id)}
                        style={({ pressed }) => [
                          styles.categoryChip,
                          {
                            borderColor: isActive ? theme.primary : theme.border,
                            backgroundColor: isActive ? theme.primary : theme.surface,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}>
                        <MaterialIcons
                          name={category.icon}
                          size={14}
                          color={isActive ? '#FFFFFF' : theme.icon}
                        />
                        <ThemedText
                          style={{
                            fontFamily: FontFamilies.semiBold,
                            fontSize: 12,
                            color: isActive ? '#FFFFFF' : theme.text,
                          }}>
                          {category.label}
                        </ThemedText>
                        <View
                          style={[
                            styles.countPill,
                            {
                              backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : theme.surface2,
                            },
                          ]}>
                          <ThemedText
                            style={{
                              fontSize: 10,
                              color: isActive ? '#FFFFFF' : theme.mutedText,
                              fontFamily: FontFamilies.medium,
                            }}>
                            {categoryCounts[category.id]}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={[styles.mediaHeader, { paddingHorizontal: horizontalPadding }]}>
                  <ThemedText type="subtitle">Media</ThemedText>
                  <ThemedText style={{ color: theme.mutedText, fontFamily: FontFamilies.medium }}>
                    {filter === 'all' ? 'All items' : `Filtered by ${filter}`}
                  </ThemedText>
                </View>
              </View>
            }
            renderItem={({ item }) => {
              return (
                <Pressable
                  onPress={() => setActiveItem(item)}
                  style={({ pressed }) => [
                    styles.tile,
                    {
                      width: tileSize,
                      height: tileSize,
                      borderColor: theme.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}>
                  <Image source={item.source} style={StyleSheet.absoluteFill} contentFit="cover" transition={100} />
                  <View style={[styles.badge, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                    <MaterialIcons name={item.type === 'video' ? 'videocam' : 'image'} size={12} color={theme.icon} />
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
        <Modal visible={!!activeItem} transparent animationType="fade">
          <View style={styles.viewerBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setActiveItem(null)} />
            <View style={styles.viewerCard}>
              <Image
                source={activeItem?.source}
                style={styles.viewerImage}
                contentFit="contain"
                transition={100}
              />
              <View style={styles.viewerControls}>
                <Pressable
                  onPress={() => {
                    if (activeItem) downloadMedia(activeItem);
                  }}
                  style={({ pressed }) => [
                    styles.viewerActionButton,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}>
                  <MaterialIcons name="download" size={18} color={theme.icon} />
                </Pressable>

                <Pressable
                  onPress={() => setActiveItem(null)}
                  style={({ pressed }) => [
                    styles.viewerActionButton,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}>
                  <MaterialIcons name="close" size={18} color={theme.icon} />
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    paddingTop: 4,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  categoryRow: {
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  mediaHeader: {
    marginTop: 6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyWrap: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    right: 6,
    top: 6,
    borderRadius: 10,
    borderWidth: 1,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  lockedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  lockedIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockedTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: FontFamilies.medium,
    marginBottom: 18,
  },
  verifyButton: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  viewerCard: {
    width: '100%',
    maxWidth: 420,
    aspectRatio: 3 / 4,
    borderRadius: 18,
    overflow: 'hidden',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerControls: {
    position: 'absolute',
    right: 10,
    top: 10,
    flexDirection: 'row',
    gap: 8,
  },
  viewerActionButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
