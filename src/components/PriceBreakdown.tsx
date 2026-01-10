// Price breakdown component showing value distribution across supply chain

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PriceNode } from '../models/types';
import { ROLE_LABELS, ROLE_ICONS, formatPrice } from '../utils/formatting';

interface PriceBreakdownProps {
  nodes: PriceNode[];
  showPercentages?: boolean;
}

export function PriceBreakdown({ nodes, showPercentages = true }: PriceBreakdownProps) {
  if (nodes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No price data available</Text>
      </View>
    );
  }

  const totalMargin = nodes.reduce((sum, n) => sum + (n.margin || 0), 0);
  const finalPrice = nodes[nodes.length - 1]?.priceOut || 0;
  const currency = nodes[0]?.currency || 'USD';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Value Distribution</Text>
      
      {/* Visual bar */}
      <View style={styles.barContainer}>
        {nodes.map((node, index) => {
          const width = node.marginPercent || (node.margin ? (node.margin / finalPrice) * 100 : 0);
          if (width <= 0) return null;
          
          return (
            <View
              key={node.actorId}
              style={[
                styles.barSegment,
                { 
                  width: `${Math.max(width, 5)}%`,
                  backgroundColor: getColorForRole(node.actorRole, index),
                }
              ]}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {nodes.map((node, index) => (
          <View key={node.actorId} style={styles.legendItem}>
            <View style={styles.legendHeader}>
              <View 
                style={[
                  styles.legendDot, 
                  { backgroundColor: getColorForRole(node.actorRole, index) }
                ]} 
              />
              <Text style={styles.legendIcon}>{ROLE_ICONS[node.actorRole]}</Text>
              <Text style={styles.legendRole}>{ROLE_LABELS[node.actorRole]}</Text>
            </View>
            
            <View style={styles.legendValues}>
              {node.priceIn !== undefined && (
                <Text style={styles.priceIn}>
                  In: {formatPrice(node.priceIn, currency)}
                </Text>
              )}
              <Text style={styles.priceOut}>
                Out: {formatPrice(node.priceOut || 0, currency)}
              </Text>
              {node.margin !== undefined && node.margin > 0 && (
                <Text style={styles.margin}>
                  +{formatPrice(node.margin, currency)}
                  {showPercentages && node.marginPercent !== undefined && (
                    <Text style={styles.percent}> ({node.marginPercent.toFixed(0)}%)</Text>
                  )}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Final retail price:</Text>
        <Text style={styles.summaryValue}>{formatPrice(finalPrice, currency)}</Text>
      </View>
    </View>
  );
}

function getColorForRole(role: string, index: number): string {
  const colors: Record<string, string> = {
    producer: '#22c55e',
    processor: '#84cc16',
    exporter: '#eab308',
    importer: '#f97316',
    roaster: '#ef4444',
    retailer: '#8b5cf6',
    consumer: '#3b82f6',
  };
  return colors[role] || `hsl(${index * 45}, 70%, 50%)`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  barContainer: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  legendRole: {
    fontSize: 14,
    color: '#374151',
  },
  legendValues: {
    alignItems: 'flex-end',
  },
  priceIn: {
    fontSize: 11,
    color: '#9ca3af',
  },
  priceOut: {
    fontSize: 12,
    color: '#6b7280',
  },
  margin: {
    fontSize: 13,
    fontWeight: '500',
    color: '#059669',
  },
  percent: {
    fontWeight: '400',
    color: '#6b7280',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default PriceBreakdown;
