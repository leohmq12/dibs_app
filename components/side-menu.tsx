/**
 * Side menu overlay — Pencil 9xtrR (SideMenu).
 * 288px panel from left, dark overlay (#070a12cc), avatar + name, close chevron,
 * menu items with dividers, Log Out button at bottom.
 * Slides in from left on open, slides back left on close.
 */
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { useEffect, useRef } from 'react';
import {
  Animated as RNAnimated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, FontFamilies } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MENU_WIDTH = 288;
const ANIM_DURATION = 300;
const PANEL_TOP_MARGIN = 24;

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconGradient?: readonly [string, string];
  onPress?: () => void;
};

export type SideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

export function SideMenu({ visible, onClose }: SideMenuProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const panelX = useRef(new RNAnimated.Value(-MENU_WIDTH)).current;
  const backdropOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      panelX.setValue(-MENU_WIDTH);
      backdropOpacity.setValue(0);
      RNAnimated.parallel([
        RNAnimated.timing(panelX, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        RNAnimated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      panelX.setValue(-MENU_WIDTH);
      backdropOpacity.setValue(0);
    }
  }, [visible]);

  const closeMenu = () => {
    RNAnimated.parallel([
      RNAnimated.timing(panelX, {
        toValue: -MENU_WIDTH,
        duration: ANIM_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      RNAnimated.timing(backdropOpacity, {
        toValue: 0,
        duration: ANIM_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const menuItems: MenuItem[] = [
    {
      id: 'vault',
      label: 'Media Vault',
      icon: 'lock',
      iconGradient: ['#60A5FA', '#2469BE'],
      onPress: () => {
        closeMenu();
        router.push('/(tabs)/vault');
      },
    },
    {
      id: 'reset-face',
      label: 'Reset Face ID',
      icon: 'face-retouching-natural',
      iconColor: theme.mutedText,
      onPress: () => {
        closeMenu();
        // TODO: open reset face ID flow
      },
    },
    {
      id: 'logs',
      label: 'Biometric Logs',
      icon: 'fingerprint',
      iconColor: theme.brandYellow,
      onPress: () => {
        closeMenu();
        router.push('/(tabs)/logs');
      },
    },
    {
      id: 'retention',
      label: 'Data Retention Policy',
      icon: 'shield',
      iconGradient: ['#60A5FA', '#2469BE'],
      onPress: () => {
        closeMenu();
        router.push('/(tabs)/settings');
      },
    },
    {
      id: 'export',
      label: 'Export User Data',
      icon: 'download',
      iconColor: theme.danger,
      onPress: () => {
        closeMenu();
        // TODO: export flow
      },
    },
  ];

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
      {/* Dimmed/blurred area — tap to close */}
      <RNAnimated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(7, 10, 18, 0.75)' }]} />
          )}
        </Pressable>
      </RNAnimated.View>

      {/* Menu panel — Pencil rKfsm: 288px, slides in from left */}
      <RNAnimated.View
        style={[
          styles.panel,
          { backgroundColor: colorScheme === 'dark' ? '#070a12' : 'rgba(7, 10, 18, 0.98)' },
          { transform: [{ translateX: panelX }] },
        ]}
      >
        {/* Header: avatar + name + close — dgwqs, u9Hak, xmHUJ */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Image
              source={require('../assets/images/face.png')}
              style={styles.avatar}
            />
          </View>
          <ThemedText style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
            Roger Smith
          </ThemedText>
          <Pressable onPress={closeMenu} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]} hitSlop={12}>
            <MaterialIcons name="chevron-left" size={24} color={theme.text} style={{ opacity: 0.6 }} />
          </Pressable>
        </View>

        {/* Menu list — UKo05 */}
        <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
          {menuItems.map((item, index) => (
            <View key={item.id}>
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.8 }]}
              >
                <View style={styles.menuIconWrap}>
                  {item.iconGradient ? (
                    <LinearGradient
                      colors={item.iconGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.menuIconGradient}
                    >
                      <MaterialIcons name={item.icon} size={18} color="#FFF" />
                    </LinearGradient>
                  ) : (
                    <View style={[styles.menuIconGradient, { backgroundColor: theme.cardTint }]}>
                      <MaterialIcons name={item.icon} size={18} color={item.iconColor ?? theme.accent} />
                    </View>
                  )}
                </View>
                <ThemedText style={[styles.menuLabel, { color: theme.text }]}>{item.label}</ThemedText>
              </Pressable>
              {index < menuItems.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: theme.accent }]} />
              ) : null}
            </View>
          ))}
        </ScrollView>

        {/* Log Out — SDVmx */}
        <Pressable
          onPress={() => {
            closeMenu();
            router.replace('/(auth)/login');
          }}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}
        >
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </Pressable>
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 1000,
    elevation: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: PANEL_TOP_MARGIN,
    bottom: 0,
    width: MENU_WIDTH,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 20,
    gap: 14,
  },
  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 25 },
  userName: {
    flex: 1,
    fontSize: 16,
    fontFamily: FontFamilies.medium,
    lineHeight: 30,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuScroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  menuIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuIconGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 12,
    fontFamily: FontFamilies.regular,
  },
  divider: {
    height: 1,
    width: 244,
    opacity: 0.05,
  },
  logoutBtn: {
    marginHorizontal: 24,
    marginBottom: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E21D20',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FontFamilies.semiBold,
  },
});
