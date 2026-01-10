// Timeline component for displaying chain of custody

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TimelineEntry } from '../models/types';
import {
  formatDate,
  formatPrice,
  STATE_LABELS,
  VERIFICATION_CONFIG,
  ROLE_ICONS,
} from '../utils/formatting';

interface TimelineProps {
  entries: TimelineEntry[];
}

export function Timeline({ entries }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No chain of custody data yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {entries.map((entry, index) => (
        <TimelineNode
          key={entry.id}
          entry={entry}
          isFirst={index === 0}
          isLast={index === entries.length - 1}
        />
      ))}
    </View>
  );
}

interface TimelineNodeProps {
  entry: TimelineEntry;
  isFirst: boolean;
  isLast: boolean;
}

function TimelineNode({ entry, isFirst, isLast }: TimelineNodeProps) {
  const verificationConfig = VERIFICATION_CONFIG[entry.verification];
  const roleIcon = ROLE_ICONS[entry.actor.role];

  return (
    <View style={styles.nodeContainer}>
      {/* Timeline line */}
      <View style={styles.lineContainer}>
        {!isFirst && <View style={styles.lineTop} />}
        <View style={[
          styles.dot,
          entry.isCurrentState && styles.dotActive
        ]}>
          {entry.isCurrentState && <View style={styles.dotInner} />}
        </View>
        {!isLast && <View style={styles.lineBottom} />}
      </View>

      {/* Content */}
      <View style={[
        styles.contentContainer,
        entry.isCurrentState && styles.contentActive
      ]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.state}>{STATE_LABELS[entry.state]}</Text>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
        </View>

        {/* Actor info */}
        <View style={styles.actorRow}>
          <Text style={styles.actorIcon}>{roleIcon}</Text>
          <Text style={styles.actorName}>{entry.actor.name}</Text>
          <Text style={styles.verification}>{verificationConfig.icon}</Text>
        </View>

        {/* Location */}
        {entry.location && (
          <Text style={styles.location}>{entry.location}</Text>
        )}

        {/* Price */}
        {entry.price && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>{entry.price.priceType}:</Text>
            <Text style={styles.priceValue}>
              {formatPrice(entry.price.amount, entry.price.currency, entry.price.unit)}
            </Text>
          </View>
        )}

        {/* Notes */}
        {entry.notes && (
          <Text style={styles.notes}>{entry.notes}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  nodeContainer: {
    flexDirection: 'row',
    minHeight: 80,
  },
  lineContainer: {
    width: 32,
    alignItems: 'center',
  },
  lineTop: {
    width: 2,
    flex: 1,
    backgroundColor: '#d1d5db',
  },
  lineBottom: {
    width: 2,
    flex: 1,
    backgroundColor: '#d1d5db',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    backgroundColor: '#2C1810',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginLeft: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contentActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  state: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actorIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  actorName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  verification: {
    fontSize: 12,
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 4,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  notes: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default Timeline;
