// Freshness indicator component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { FreshnessLevel } from '../models/types';
import { FRESHNESS_CONFIG } from '../utils/formatting';

interface FreshnessIndicatorProps {
  freshness: FreshnessLevel;
  daysSinceRoast: number;
  compact?: boolean;
}

export function FreshnessIndicator({ 
  freshness, 
  daysSinceRoast, 
  compact = false 
}: FreshnessIndicatorProps) {
  const config = FRESHNESS_CONFIG[freshness];

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: config.color + '20' }]}>
        <View style={[styles.compactDot, { backgroundColor: config.color }]} />
        <Text style={[styles.compactText, { color: config.color }]}>
          {daysSinceRoast}d
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.bar, { backgroundColor: '#e5e7eb' }]}>
        <View 
          style={[
            styles.barFill, 
            { 
              backgroundColor: config.color,
              width: `${Math.max(10, 100 - (daysSinceRoast / 60) * 100)}%`
            }
          ]} 
        />
      </View>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: config.color }]}>
          {config.emoji} {config.label}
        </Text>
        <Text style={styles.days}>
          {daysSinceRoast} days since roast
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  bar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  days: {
    fontSize: 12,
    color: '#6b7280',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default FreshnessIndicator;
