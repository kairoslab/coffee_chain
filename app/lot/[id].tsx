// Lot detail screen - shows full chain of custody and interactions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Timeline } from '../../src/components/Timeline';
import { FreshnessIndicator } from '../../src/components/FreshnessIndicator';
import { PriceBreakdown } from '../../src/components/PriceBreakdown';
import { getLotWithChain, getTimelineForLot } from '../../src/database/operations';
import {
  PROCESSING_LABELS,
  formatAltitude,
  formatDateFull,
} from '../../src/utils/formatting';
import type { LotWithChain, TimelineEntry } from '../../src/models/types';

export default function LotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [lot, setLot] = useState<LotWithChain | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'price' | 'interactions'>('timeline');

  useEffect(() => {
    async function loadLot() {
      if (!id) return;
      try {
        const lotData = await getLotWithChain(id);
        setLot(lotData);
        if (lotData) {
          const timelineData = await getTimelineForLot(id);
          setTimeline(timelineData);
        }
      } catch (err) {
        console.error('Failed to load lot:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLot();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2C1810" />
      </View>
    );
  }

  if (!lot) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Lot not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: lot.name,
          headerStyle: { backgroundColor: '#2C1810' },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container}>
        {/* Hero section */}
        <View style={styles.hero}>
          <Text style={styles.variety}>{lot.variety}</Text>
          <Text style={styles.name}>{lot.name}</Text>
          
          <View style={styles.originContainer}>
            <Text style={styles.origin}>
              {lot.origin.farm && `${lot.origin.farm}, `}
              {lot.origin.region}, {lot.origin.country}
            </Text>
            {lot.origin.altitude && (
              <Text style={styles.altitude}>{formatAltitude(lot.origin.altitude)}</Text>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Process</Text>
              <Text style={styles.metaValue}>{PROCESSING_LABELS[lot.processingMethod]}</Text>
            </View>
            {lot.harvestDate && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Harvest</Text>
                <Text style={styles.metaValue}>{formatDateFull(lot.harvestDate)}</Text>
              </View>
            )}
            {lot.lotCode && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Lot Code</Text>
                <Text style={styles.metaValue}>#{lot.lotCode}</Text>
              </View>
            )}
          </View>

          {/* Freshness indicator (if roasted) */}
          {lot.freshness && lot.daysSinceRoast !== undefined && (
            <View style={styles.freshnessContainer}>
              <FreshnessIndicator
                freshness={lot.freshness}
                daysSinceRoast={lot.daysSinceRoast}
              />
            </View>
          )}
        </View>

        {/* Tab navigation */}
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'timeline' && styles.tabActive]}
            onPress={() => setActiveTab('timeline')}
          >
            <Text style={[styles.tabText, activeTab === 'timeline' && styles.tabTextActive]}>
              Chain of Custody
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'price' && styles.tabActive]}
            onPress={() => setActiveTab('price')}
          >
            <Text style={[styles.tabText, activeTab === 'price' && styles.tabTextActive]}>
              Price Breakdown
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'interactions' && styles.tabActive]}
            onPress={() => setActiveTab('interactions')}
          >
            <Text style={[styles.tabText, activeTab === 'interactions' && styles.tabTextActive]}>
              Notes
            </Text>
          </Pressable>
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 'timeline' && (
            <Timeline entries={timeline} />
          )}
          
          {activeTab === 'price' && (
            <PriceBreakdown nodes={lot.priceBreakdown || []} />
          )}
          
          {activeTab === 'interactions' && (
            <View style={styles.interactionsContainer}>
              {lot.interactions.length === 0 ? (
                <View style={styles.emptyInteractions}>
                  <Text style={styles.emptyText}>No notes yet</Text>
                  <Pressable style={styles.addNoteButton}>
                    <Text style={styles.addNoteButtonText}>Add Cupping Note</Text>
                  </Pressable>
                </View>
              ) : (
                lot.interactions.map(interaction => (
                  <View key={interaction.id} style={styles.interactionCard}>
                    <Text style={styles.interactionType}>{interaction.type}</Text>
                    <Text style={styles.interactionDate}>
                      {formatDateFull(interaction.createdAt)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* Spacer for bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2C1810',
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  hero: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  variety: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C1810',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  originContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  origin: {
    fontSize: 15,
    color: '#6b7280',
    flex: 1,
  },
  altitude: {
    fontSize: 13,
    color: '#9ca3af',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    minWidth: 80,
  },
  metaLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  freshnessContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2C1810',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#2C1810',
  },
  tabContent: {
    padding: 16,
  },
  interactionsContainer: {
    gap: 12,
  },
  emptyInteractions: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  addNoteButton: {
    backgroundColor: '#2C1810',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addNoteButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  interactionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  interactionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  interactionDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});
