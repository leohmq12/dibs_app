/**
 * On web inside WebShell we want the app to think it's always 375x812 (mobile).
 * This hook returns context dimensions when provided (web), else useWindowDimensions().
 */
import { createContext, useContext } from 'react';
import { useWindowDimensions } from 'react-native';
import { Platform } from 'react-native';

export const MOBILE_VIEWPORT = { width: 375, height: 812 } as const;

export const WebViewportContext = createContext<{ width: number; height: number } | null>(null);

export function useViewportDimensions(): { width: number; height: number } {
  const context = useContext(WebViewportContext);
  const window = useWindowDimensions();
  if (Platform.OS === 'web' && context) return context;
  return window;
}
