/**
 * Lot Detail Route
 *
 * This route exists for deep linking support.
 * The actual lot detail view is handled by the AppNavigator's
 * swipe-based LotTimeline screen.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Blob } from '../../src/components/Blob';
import { colors, typography, spacing } from '../../src/theme';

export default function LotDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // For now, redirect back to main screen
  // In production, this would load the lot and show it in the timeline
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <Blob
            size={80}
            variant="outlined"
            label={id?.slice(-4) || '?'}
          />
          <Text style={styles.title}>Lot {id}</Text>
          <Text style={styles.subtitle}>
            Swipe navigation coming from main screen
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.buttonText}>Go to Inventory</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing[4],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  button: {
    marginTop: spacing[6],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.black,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
