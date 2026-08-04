export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const prefersReducedMotion = (): boolean => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
