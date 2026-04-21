import { useWindowDimensions } from 'react-native';

/**
 * Single source of truth for breakpoint logic.
 * desktop ≥ 1024 — anything below renders the existing mobile home.
 */
export const BREAKPOINTS = {
  desktop: 1024,
} as const;

export interface Responsive {
  isDesktop: boolean;
  width: number;
  height: number;
}

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isDesktop: width >= BREAKPOINTS.desktop,
  };
}
