/**
 * useFonts Hook
 *
 * Loads custom fonts for the app using expo-font.
 * Uses Bitcount Single - a pixel font that complements the
 * LocoRoco-inspired playful aesthetic.
 */

import { useFonts as useExpoFonts } from 'expo-font';

/**
 * Font file paths
 * Add your Bitcount Single font files to src/assets/fonts/
 */
const fontAssets = {
  'BitcountSingle': require('../assets/fonts/BitcountSingleCircle-Regular.otf'),
  'BitcountSingle-Bold': require('../assets/fonts/BitcountSingleCircle-Bold.otf'),
};

/**
 * Hook to load custom fonts
 * Returns [fontsLoaded, error]
 */
export function useFonts(): [boolean, Error | null] {
  const [fontsLoaded, error] = useExpoFonts(fontAssets);
  return [fontsLoaded, error];
}

export default useFonts;
