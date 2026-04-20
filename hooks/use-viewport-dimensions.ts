/**
 * On web inside WebShell we want the app to think it's always 375x812 (mobile).
 * This hook returns context dimensions when provided (web), else useWindowDimensions().
 */
import { createContext, useContext, useMemo } from 'react';
import { useWindowDimensions, Platform } from 'react-native';

export const MOBILE_VIEWPORT = { width: 375, height: 812 } as const;
export const TABLET_BREAKPOINT = 768;
export const DESKTOP_BREAKPOINT = 1024;

export const WebViewportContext = createContext<{ width: number; height: number } | null>(null);

export interface ViewportDimensions {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useViewportDimensions(): ViewportDimensions {
  const context = useContext(WebViewportContext);
  const window = useWindowDimensions();
  
  const dims = useMemo(() => {
    if (Platform.OS === 'web' && context) return context;
    return window;
  }, [context, window]);

  return {
    ...dims,
    isMobile: dims.width < TABLET_BREAKPOINT,
    isTablet: dims.width >= TABLET_BREAKPOINT && dims.width < DESKTOP_BREAKPOINT,
    isDesktop: dims.width >= DESKTOP_BREAKPOINT,
  };
}
