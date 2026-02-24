import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Colors, FontFamilies } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TABS = [
  { name: 'index', label: 'Home', icon: 'home' as const },
  { name: 'vault', label: 'Vault', icon: 'lock' as const },
  { name: 'logs', label: 'Logs', icon: 'access-time' as const },
  { name: 'settings', label: 'Settings', icon: 'settings' as const },
];

// Pencil design: Prkcx (bar 375×64), aX8Lv (FAB 68, stroke 11), tab groups at x 16, 87, 262, 313
const DESIGN_WIDTH = 375;
const BAR_HEIGHT = 64;
const FAB_SIZE = 68;
const FAB_STROKE_WIDTH = 11;
const FAB_TOTAL_SIZE = FAB_SIZE + FAB_STROKE_WIDTH * 2; // 90
const NOTCH_WIDTH = 124;
const NOTCH_DEPTH = 36;

// Tab center X from Pencil (group x + width/2): 16+17.5, 87+15, 262+13.5, 313+23
const TAB_CENTER_RATIOS = [33.5 / DESIGN_WIDTH, 102 / DESIGN_WIDTH, 275.5 / DESIGN_WIDTH, 336 / DESIGN_WIDTH];

const FAB_SLOT_BOTTOM = BAR_HEIGHT - FAB_TOTAL_SIZE / 2;
const TAB_INACTIVE_OPACITY = 0.3;

/**
 * Nav bar shape from Pencil: U-type cutout at top center (semicircular notch).
 * Renders the bar with a smooth concave dip for the FAB.
 */
function NavBarShape({
  width,
  height,
  fill,
  strokeColor,
}: {
  width: number;
  height: number;
  fill: string;
  strokeColor: string;
}) {
  const centerX = width / 2;
  const left = centerX - NOTCH_WIDTH / 2;
  const right = centerX + NOTCH_WIDTH / 2;
  const path = [
    `M 0 0`,
    `L ${left} 0`,
    `Q ${centerX} ${NOTCH_DEPTH} ${right} 0`,
    `L ${width} 0`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    `Z`,
  ].join(' ');

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Path
        d={path}
        fill={fill}
        stroke={strokeColor}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const TAB_BUTTON_WIDTH = 52;
const TAB_BUTTON_WIDTH_SETTINGS = 58;

export function FloatingTabBar({ state, navigation }: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const bottomPadding = Math.max(insets.bottom, 12);

  const barFill = theme.background;
  const barStroke = theme.border;
  const tabColor = theme.tabIconSelected ?? theme.accent;
  const fabFill = theme.primary;
  const fabRing = theme.background;

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding, backgroundColor: barFill }]}>
      <View style={[styles.tabBarContainer, { width: screenWidth }]}>
        <NavBarShape
          width={screenWidth}
          height={BAR_HEIGHT}
          fill={barFill}
          strokeColor={barStroke}
        />
        <View style={styles.tabBarContent}>
          {TABS.map((tab, index) => {
            const route = state.routes[index];
            const isFocused = state.index === index;
            const btnWidth = index === 3 ? TAB_BUTTON_WIDTH_SETTINGS : TAB_BUTTON_WIDTH;
            const centerX = screenWidth * TAB_CENTER_RATIOS[index];
            const left = centerX - btnWidth / 2;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={[
                  styles.tabButton,
                  { left, width: btnWidth, opacity: isFocused ? 1 : TAB_INACTIVE_OPACITY },
                ]}
                accessibilityRole="tab"
                accessibilityState={isFocused ? { selected: true } : {}}>
                <MaterialIcons
                  name={tab.icon}
                  size={26}
                  color={tabColor}
                />
                <ThemedText
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    {
                      color: tabColor,
                      fontFamily: isFocused ? FontFamilies.medium : FontFamilies.regular,
                    },
                  ]}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
          <View style={[styles.fabSlot, { marginLeft: -FAB_TOTAL_SIZE / 2 }]}>
            <View style={[styles.fabRing, { backgroundColor: fabRing }]}>
              <Pressable
                onPress={() => router.push('/modal')}
                style={({ pressed }) => [
                  styles.fab,
                  { backgroundColor: fabFill, opacity: pressed ? 0.9 : 1 },
                ]}>
                <ThemedText style={styles.fabIcon}>+</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  tabBarContainer: {
    height: BAR_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  tabBarContent: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 8,
    paddingTop: 12,
  },
  tabButton: {
    position: 'absolute',
    width: TAB_BUTTON_WIDTH,
    bottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 12,
    overflow: 'hidden',
  },
  fabSlot: {
    position: 'absolute',
    bottom: FAB_SLOT_BOTTOM,
    left: '50%',
    width: FAB_TOTAL_SIZE,
    height: FAB_TOTAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabRing: {
    width: FAB_TOTAL_SIZE,
    height: FAB_TOTAL_SIZE,
    borderRadius: FAB_TOTAL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: FontFamilies.medium,
    lineHeight: 32,
  },
});
