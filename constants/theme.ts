/**
 * Design system from appUI.pen — DIBS mobile app.
 * Supports light and dark mode. Mobile-first.
 */

import { Platform } from 'react-native';

// Design tokens from approved UI
const primaryRed = '#E21D20';
const accentTeal = '#22C6D9';
const brandYellow = '#FCF425';

export const Colors = {
  light: {
    text: '#0F1A2B',
    mutedText: '#5E6B82',
    background: '#F7F8FB',
    surface: '#FFFFFF',
    surface2: '#FFFFFF',
    border: '#E2E7F0',
    primary: primaryRed,
    accent: accentTeal,
    brandYellow,
    success: '#27AE60',
    successGradient: ['#39C695', '#119E6D'] as const,
    danger: '#EB5757',
    dangerGradient: ['#EF4444', '#B30808'] as const,
    blueGradient: ['#60A5FA', '#2469BE'] as const,
    tint: accentTeal,
    icon: '#64708A',
    tabIconDefault: '#7C889E',
    tabIconSelected: accentTeal,
    inputBg: 'rgba(15, 26, 43, 0.06)',
    inputBorder: 'rgba(15, 26, 43, 0.12)',
    cardTint: 'rgba(34, 198, 217, 0.08)',
    cardTintBorder: 'rgba(34, 198, 217, 0.12)',
  },
  dark: {
    text: '#FFFFFF',
    mutedText: 'rgba(255, 255, 255, 0.7)',
    background: '#070A12',
    surface: 'rgba(34, 198, 217, 0.05)',
    surface2: 'rgba(34, 198, 217, 0.05)',
    border: 'rgba(255, 255, 255, 0.08)',
    primary: primaryRed,
    accent: accentTeal,
    brandYellow,
    success: '#27AE60',
    successGradient: ['#39C695', '#119E6D'] as const,
    danger: '#EB5757',
    dangerGradient: ['#EF4444', '#B30808'] as const,
    blueGradient: ['#60A5FA', '#2469BE'] as const,
    tint: accentTeal,
    icon: 'rgba(255, 255, 255, 0.7)',
    tabIconDefault: 'rgba(255, 255, 255, 0.5)',
    tabIconSelected: accentTeal,
    inputBg: 'rgba(7, 10, 18, 0.1)',
    inputBorder: 'rgba(255, 255, 255, 0.2)',
    cardTint: 'rgba(34, 198, 217, 0.05)',
    cardTintBorder: 'rgba(34, 198, 217, 0.1)',
  },
};

export const FontFamilies = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extraBold: 'Poppins_800ExtraBold',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
