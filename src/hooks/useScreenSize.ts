import { useState, useEffect } from 'react';

// Breakpoints as constants
export const SCREEN_SIZE = {
  MOBILE: 'mobile' as const,     // < 640px
  TABLET: 'tablet' as const,     // 640px - 1023px
  DESKTOP: 'desktop' as const,   // >= 1024px
};

export type ScreenSize = typeof SCREEN_SIZE[keyof typeof SCREEN_SIZE];

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    // Default to desktop for SSR
    if (typeof window === 'undefined') return SCREEN_SIZE.DESKTOP;

    // Initial check
    if (window.innerWidth < 640) return SCREEN_SIZE.MOBILE;
    if (window.innerWidth < 1024) return SCREEN_SIZE.TABLET;
    return SCREEN_SIZE.DESKTOP;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setScreenSize(SCREEN_SIZE.MOBILE);
      } else if (window.innerWidth < 1024) {
        setScreenSize(SCREEN_SIZE.TABLET);
      } else {
        setScreenSize(SCREEN_SIZE.DESKTOP);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

export function isMobile(screenSize: ScreenSize): boolean {
  return screenSize === SCREEN_SIZE.MOBILE;
}

export function isDesktopOrTablet(screenSize: ScreenSize): boolean {
  return screenSize === SCREEN_SIZE.DESKTOP || screenSize === SCREEN_SIZE.TABLET;
}
