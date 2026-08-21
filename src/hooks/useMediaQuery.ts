import { useEffect, useState } from 'react';

/**
 * Simple hook for evaluating a CSS media query.
 * Returns true when the query matches, false otherwise.
 *
 * Example: const isDesktop = useMediaQuery('(min-width: 768px)');
 */
export const useMediaQuery = (query: string): boolean => {
  const getMatches = () => window.matchMedia(query).matches;
  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = () => setMatches(media.matches);
    media.addEventListener('change', handler);
    // In case the query matches initially after a re‑render
    setMatches(media.matches);
    return () => media.removeEventListener('change', handler);
  }, [query]);

  return matches;
};
