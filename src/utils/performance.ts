/**
 * Performance optimization utilities
 */
import React from 'react';

// Lazy loading utilities
export const lazyLoading = {
  /**
   * Create intersection observer for lazy loading
   */
  createObserver: (
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver => {
    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
  },

  /**
   * Lazy load images
   */
  lazyLoadImages: (selector = '[data-lazy]') => {
    const images = document.querySelectorAll<HTMLImageElement>(selector);
    
    const imageObserver = lazyLoading.createObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.lazy;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
    return imageObserver;
  },

  /**
   * Lazy load components
   */
  lazyLoadComponent: <T extends React.ComponentType<unknown>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    return React.lazy(importFn);
  }
};

// Debouncing and throttling
export const timing = {
  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle: <T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Request animation frame wrapper
   */
  raf: (callback: () => void): number => {
    return requestAnimationFrame(callback);
  },

  /**
   * Cancel animation frame
   */
  cancelRaf: (id: number): void => {
    cancelAnimationFrame(id);
  }
};

// Memory management
export const memory = {
  /**
   * Cleanup event listeners
   */
  cleanupListeners: (
    element: HTMLElement | Window | Document,
    listeners: Array<{ event: string; handler: EventListener }>
  ) => {
    listeners.forEach(({ event, handler }) => {
      element.removeEventListener(event, handler);
    });
  },

  /**
   * Weak map for storing component data
   */
  createWeakMap: <K extends object, V>(): WeakMap<K, V> => {
    return new WeakMap<K, V>();
  },

  /**
   * Object pool for reusing objects
   */
  createObjectPool: <T>(
    createFn: () => T,
    resetFn: (obj: T) => void,
    maxSize = 10
  ) => {
    const pool: T[] = [];
    
    return {
      get: (): T => {
        return pool.pop() || createFn();
      },
      
      release: (obj: T): void => {
        if (pool.length < maxSize) {
          resetFn(obj);
          pool.push(obj);
        }
      },
      
      clear: (): void => {
        pool.length = 0;
      }
    };
  }
};

// Bundle splitting utilities
export const bundleSplitting = {
  /**
   * Dynamic import with error handling
   */
  dynamicImport: async <T>(
    importFn: () => Promise<T>,
    fallback?: T
  ): Promise<T> => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Dynamic import failed:', error);
      if (fallback) {
        return fallback;
      }
      throw error;
    }
  },

  /**
   * Preload critical resources
   */
  preloadResource: (href: string, as: string, crossorigin?: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }
    document.head.appendChild(link);
  },

  /**
   * Prefetch non-critical resources
   */
  prefetchResource: (href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
};

// Performance monitoring
export const monitoring = {
  /**
   * Measure function execution time
   */
  measureTime: <T extends (...args: unknown[]) => unknown>(
    name: string,
    func: T
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = func(...args);
      const end = performance.now();
      
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    }) as T;
  },

  /**
   * Measure async function execution time
   */
  measureAsyncTime: <T extends (...args: unknown[]) => Promise<unknown>>(
    name: string,
    func: T
  ): T => {
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      const result = await func(...args);
      const end = performance.now();
      
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    }) as T;
  },

  /**
   * Monitor Core Web Vitals
   */
  monitorWebVitals: () => {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        const eventEntry = entry as PerformanceEventTiming;
        console.log('FID:', eventEntry.processingStart - eventEntry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        const layoutEntry = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value;
        }
      });
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  },

  /**
   * Get performance metrics
   */
  getPerformanceMetrics: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      // Time to First Byte
      ttfb: navigation.responseStart - navigation.requestStart,
      
      // DOM Content Loaded
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      
      // Load Complete
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      
      // Total Load Time (from navigation start to load complete)
      totalLoadTime: navigation.loadEventEnd
    };
  }
};

// Image optimization
export const imageOptimization = {
  /**
   * Create responsive image srcset
   */
  createSrcSet: (baseUrl: string, sizes: number[]): string => {
    return sizes
      .map(size => `${baseUrl}?w=${size} ${size}w`)
      .join(', ');
  },

  /**
   * Get optimal image format
   */
  getOptimalFormat: (): 'webp' | 'avif' | 'jpg' => {
    const canvas = document.createElement('canvas');
    
    // Check for AVIF support
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif';
    }
    
    // Check for WebP support
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp';
    }
    
    return 'jpg';
  },

  /**
   * Compress image client-side
   */
  compressImage: (
    file: File,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8
  ): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve as BlobCallback, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
};

// React performance hooks
export const reactPerformance = {
  /**
   * Memoize expensive computations
   */
  useMemoizedValue: <T>(
    factory: () => T,
    deps: React.DependencyList
  ): T => {
    return React.useMemo(factory, [factory, ...deps]);
  },

  /**
   * Memoize callback functions
   */
  useMemoizedCallback: <T extends (...args: unknown[]) => unknown>(
    callback: T,
    deps: React.DependencyList
  ): T => {
    return React.useCallback(callback, [callback, ...deps]);
  },

  /**
   * Virtualized list hook for large datasets
   */
  useVirtualizedList: <T>(
    items: T[],
    itemHeight: number,
    containerHeight: number
  ) => {
    const [scrollTop, setScrollTop] = React.useState(0);
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length - 1
    );
    
    const visibleItems = items.slice(startIndex, endIndex + 1);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;
    
    return {
      visibleItems,
      totalHeight,
      offsetY,
      onScroll: (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
      }
    };
  }
};
