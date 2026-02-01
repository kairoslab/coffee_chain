/**
 * CoffeeChain Main Screen
 *
 * Entry point for the LocoRoco-inspired swipe navigation interface.
 * Wraps app with providers for data and accessibility.
 */

import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AppNavigator } from '../src/navigation/AppNavigator';
import { LotProvider } from '../src/data';
import { AccessibilityProvider } from '../src/contexts';
import { colors } from '../src/theme';

export default function IndexScreen() {
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
});
