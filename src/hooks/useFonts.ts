/**
 * useFonts Hook
 *
 * Placeholder for custom font loading.
 *
 * To enable Bitcount Single fonts:
 * 1. Add font files to src/assets/fonts/:
 *    - BitcountSingleCircle-Regular.otf
 *    - BitcountSingleCircle-Bold.otf
 * 2. Uncomment the Font.loadAsync call below
 * 3. Restart the Expo dev server
 *
 * Until fonts are added, the app uses system fonts as fallback.
 */

import { useEffect, useState } from 'react';
// import * as Font from 'expo-font';

/**
 * Hook to load custom fonts
 * Returns [fontsLoaded, error]
 *
 * Currently returns [true, null] immediately since font files
 * are not yet added. The app uses system font fallback.
 */
export function useFonts(): [boolean, Error | null] {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Font files not yet added - skip loading and use system fonts
    // When you add the font files, uncomment the code below:
    //
    // async function loadFonts() {
    //   try {
    //     await Font.loadAsync({
    //       'BitcountSingle': require('../assets/fonts/BitcountSingleCircle-Regular.otf'),
    //       'BitcountSingle-Bold': require('../assets/fonts/BitcountSingleCircle-Bold.otf'),
    //     });
    //     setLoaded(true);
    //   } catch (e) {
    //     console.warn('Failed to load custom fonts:', e);
    //     setLoaded(true); // Continue with system fonts
    //   }
    // }
    // loadFonts();

    // For now, immediately mark as loaded (using system fonts)
    setLoaded(true);
  }, []);

  return [loaded, null];
}

export default useFonts;
