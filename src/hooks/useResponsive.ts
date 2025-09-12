import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const breakpoints: BreakpointConfig = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof BreakpointConfig>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // Déterminer le breakpoint actuel
      if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('xs');
      }
    };

    // Écouter les changements de taille
    window.addEventListener('resize', handleResize);
    handleResize(); // Appel initial

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md';
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl';

  return {
    screenSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  };
};

export default useResponsive;
