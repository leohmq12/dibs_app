import type { RefObject } from 'react';
import { createContext, useContext } from 'react';
import type { View } from 'react-native';

/**
 * On web, overlay content (e.g. SideMenu) is portaled into this host so it renders
 * above the tab bar. The host is a sibling of the tab navigator with high zIndex.
 * Consumer uses findDOMNode(ref.current) to get the container element for createPortal.
 */
export const OverlayPortalContext = createContext<RefObject<View | null> | null>(null);

export function useOverlayPortal(): RefObject<View | null> | null {
  return useContext(OverlayPortalContext);
}
