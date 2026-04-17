import { useViewportDimensions } from './use-viewport-dimensions';

export type Breakpoints = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
};

export function useResponsive(): Breakpoints {
  const { width, height } = useViewportDimensions();
  
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    width,
    height,
  };
}
