/**
 * useFonts Hook
 *
 * Loads Bitcount Single custom fonts for the app.
 */

import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

/**
 * Hook to load custom fonts
 * Returns [fontsLoaded, error]
 */
export function useFonts(): [boolean, Error | null] {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'BitcountSingle': require('../assets/fonts/BitcountSingle-Regular.ttf'),
          'BitcountSingle-Bold': require('../assets/fonts/BitcountSingle-Bold.ttf'),
        });
        setLoaded(true);
      } catch (e) {
        console.warn('Failed to load custom fonts:', e);
        setError(e instanceof Error ? e : new Error('Font loading failed'));
        setLoaded(true); // Allow app to continue with system fonts
      }
    }

    loadFonts();
  }, []);

  return [loaded, error];
}

export default useFonts;
