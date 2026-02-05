/**
 * useFonts Hook
 *
 * Loads custom fonts for the app.
 *
 * To enable Bitcount Single fonts:
 * 1. Add font files to src/assets/fonts/:
 *    - BitcountSingle-Regular.ttf
 *    - BitcountSingle-Bold.ttf
 * 2. Uncomment the Font.loadAsync block below
 * 3. Update tokens.ts fontFamily values to use custom font names
 */

import { useEffect, useState } from 'react';
// import * as Font from 'expo-font';

/**
 * Font configuration - set to true when font files are available
 */
const CUSTOM_FONTS_AVAILABLE = false;

/**
 * Hook to load custom fonts
 * Returns [fontsLoaded, error]
 *
 * Currently returns immediately since custom fonts are not yet installed.
 * The app uses platform-specific system fonts as fallback.
 */
export function useFonts(): [boolean, Error | null] {
  const [loaded, setLoaded] = useState(!CUSTOM_FONTS_AVAILABLE);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!CUSTOM_FONTS_AVAILABLE) {
      // No custom fonts to load - use system fonts
      return;
    }

    // Uncomment when font files are added to src/assets/fonts/
    // async function loadFonts() {
    //   try {
    //     const Font = await import('expo-font');
    //     await Font.loadAsync({
    //       'BitcountSingle': require('../assets/fonts/BitcountSingle-Regular.ttf'),
    //       'BitcountSingle-Bold': require('../assets/fonts/BitcountSingle-Bold.ttf'),
    //     });
    //     setLoaded(true);
    //   } catch (e) {
    //     console.warn('Failed to load custom fonts:', e);
    //     setError(e instanceof Error ? e : new Error('Font loading failed'));
    //     setLoaded(true); // Allow app to continue with system fonts
    //   }
    // }
    // loadFonts();
  }, []);

  return [loaded, error];
}

export default useFonts;
