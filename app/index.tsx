/**
 * CoffeeChain Main Screen
 *
 * Entry point for the LocoRoco-inspired swipe navigation interface.
 * Wraps app with providers for data, accessibility, and custom fonts.
 */

import React from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { AppNavigator } from '../src/navigation/AppNavigator';
import { LotProvider } from '../src/data';
import { AccessibilityProvider } from '../src/contexts';
import { useFonts } from '../src/hooks';
import { colors, typography } from '../src/theme';

export default function IndexScreen() {
  // Load custom fonts (Bitcount Single)
  const [fontsLoaded, fontError] = useFonts();

  // Show loading state while fonts load
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  // Show error if fonts failed to load (app still works with system fonts)
  if (fontError) {
    console.warn('Failed to load custom fonts, using system fonts:', fontError);
  }

  return (
    <AccessibilityProvider>
      <LotProvider useMockData={true}>
        <SafeAreaView style={styles.container}>
          <AppNavigator />
        </SafeAreaView>
      </LotProvider>
    </AccessibilityProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});
