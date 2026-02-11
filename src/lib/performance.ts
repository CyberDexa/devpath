// ═══════════════════════════════════════════════════════════
// DevPath — Performance Utilities
// Phase 6: Lazy loading, resource hints, image optimization
// ═══════════════════════════════════════════════════════════

/**
 * Lazy component loader — wraps React.lazy with a loading skeleton
 */
export function lazyWithPreload<T extends React.ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  const Component = (await import('react')).lazy(factory);
  return Object.assign(Component, { preload: factory });
}

/**
 * Intersection Observer-based lazy loader for below-fold content
 * Defers rendering until the element enters the viewport
 */
export function onVisible(
  element: HTMLElement,
  callback: () => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
          break;
        }
      }
    },
    { rootMargin: '200px', threshold: 0.01, ...options }
  );
  observer.observe(element);
  return () => observer.disconnect();
}

/**
 * Debounce utility for scroll/resize event handlers
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as unknown as T;
}

/**
 * Throttle utility — fires at most once per interval
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  interval: number
): T {
  let lastTime = 0;
  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn(...args);
    }
  }) as unknown as T;
}

/**
 * Preload critical resources — fonts, key pages, images
 */
export function preloadResource(href: string, as: 'font' | 'image' | 'script' | 'style' | 'document'): void {
  if (typeof document === 'undefined') return;
  const existing = document.querySelector(`link[href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (as === 'font') link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * Prefetch pages on hover — makes navigations feel instant
 */
export function setupLinkPrefetch(): void {
  if (typeof document === 'undefined') return;
  const prefetched = new Set<string>();

  document.addEventListener('mouseover', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || prefetched.has(href)) return;

    prefetched.add(href);
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = href;
    document.head.appendChild(prefetchLink);
  }, { passive: true });
}

/**
 * Web Vitals tracking — CLS, LCP, FID, INP, TTFB
 */
export function trackWebVitals(onMetric: (metric: { name: string; value: number; rating: string }) => void): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  // LCP — Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const value = lastEntry.startTime;
      onMetric({ name: 'LCP', value, rating: value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor' });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}

  // CLS — Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput?: boolean; value?: number })[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value || 0;
        }
      }
      onMetric({ name: 'CLS', value: clsValue, rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor' });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {}

  // FID — First Input Delay
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0] as PerformanceEntry & { processingStart?: number };
      const value = (entry.processingStart || 0) - entry.startTime;
      onMetric({ name: 'FID', value, rating: value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor' });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {}

  // TTFB — Time to First Byte
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (nav) {
      const value = nav.responseStart - nav.requestStart;
      onMetric({ name: 'TTFB', value, rating: value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor' });
    }
  } catch {}
}

/**
 * Request idle callback polyfill + wrapper
 */
export function requestIdleWork(callback: () => void, timeout = 5000): void {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void })
      .requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Image loading optimization — native lazy loading + decoding async
 */
export function optimizeImages(): void {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('img:not([loading])').forEach((img) => {
    (img as HTMLImageElement).loading = 'lazy';
    (img as HTMLImageElement).decoding = 'async';
  });
}

/**
 * Reduce motion check — respect user preferences
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
