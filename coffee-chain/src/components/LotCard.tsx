// Lot card component for displaying coffee lots in lists

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Lot, FreshnessLevel } from '../models/types';
import { FreshnessIndicator } from './FreshnessIndicator';
import {
  STATE_LABELS,
  PROCESSING_LABELS,
  formatAltitude,
} from '../utils/formatting';

interface LotCardProps {
  lot: Lot;
  freshness?: FreshnessLevel;
  daysSinceRoast?: number;
  onPress?: () => void;
}

export function LotCard({ lot, freshness, daysSinceRoast, onPress }: LotCardProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name} numberOfLines={1}>{lot.name}</Text>
          <Text style={styles.variety}>{lot.variety}</Text>
        </View>
        {freshness && daysSinceRoast !== undefined && (
          <FreshnessIndicator 
            freshness={freshness} 
            daysSinceRoast={daysSinceRoast}
            compact 
          />
        )}
      </View>

      {/* Origin */}
      <View style={styles.originRow}>
        <Text style={styles.origin}>
          {lot.origin.farm ? `${lot.origin.farm}, ` : ''}
          {lot.origin.region}, {lot.origin.country}
        </Text>
        {lot.origin.altitude && (
          <Text style={styles.altitude}>{formatAltitude(lot.origin.altitude)}</Text>
        )}
      </View>

      {/* Processing */}
      <Text style={styles.processing}>
        {PROCESSING_LABELS[lot.processingMethod]}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.stateBadge}>
          <View style={[styles.stateDot, getStateDotStyle(lot.currentState)]} />
          <Text style={styles.stateText}>{STATE_LABELS[lot.currentState]}</Text>
        </View>
        {lot.lotCode && (
          <Text style={styles.lotCode}>#{lot.lotCode}</Text>
        )}
      </View>
    </Pressable>
  );
}

function getStateDotStyle(state: string) {
  const colors: Record<string, string> = {
    harvested: '#22c55e',
    processed: '#84cc16',
    exported: '#eab308',
    imported: '#f97316',
    roasted: '#ef4444',
    retailed: '#8b5cf6',
    consumed: '#6b7280',
  };
  return { backgroundColor: colors[state] || '#9ca3af' };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pressed: {
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  variety: {
    fontSize: 14,
    color: '#2C1810',
    fontWeight: '500',
  },
  originRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  origin: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  altitude: {
    fontSize: 12,
    color: '#9ca3af',
  },
  processing: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  stateText: {
    fontSize: 13,
    color: '#374151',
  },
  lotCode: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
});

export default LotCard;
