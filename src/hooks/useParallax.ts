import { useCallback } from 'react';

/**
 * Simple parallax hook placeholder.
 * Returns a setMousePosition function that can be used by components
 * to react to mouse movement for visual effects.
 * Currently it does nothing but can be extended to set CSS variables.
 */
export const useParallax = () => {
  const setMousePosition = useCallback((x: number, y: number) => {
    // No-op placeholder – could set CSS vars like --parallax-x/y
  }, []);

  return { setMousePosition };
};
