/**
 * CoffeeChain Root Layout
 *
 * LocoRoco-inspired coffee supply chain transparency app.
 * Black and white interface with swipe-based navigation.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { initDatabase } from '../src/database/schema';
import { colors, typography } from '../src/theme';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      }
    }
    init();
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorBlob}>
          <Text style={styles.errorBlobText}>!</Text>
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingBlob}>
          <ActivityIndicator size="small" color={colors.white} />
        </View>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
        animation: 'none',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="lot/[id]"
        options={{
          presentation: 'card',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 24,
  },
  loadingBlob: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loading: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  errorBlob: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorBlobText: {
    color: colors.white,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 8,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
});
