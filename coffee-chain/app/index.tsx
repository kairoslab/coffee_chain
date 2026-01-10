// Collection screen - displays user's coffee lots

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { LotCard } from '../src/components/LotCard';
import { getCollection, getLotWithChain } from '../src/database/operations';
import type { Lot, LotWithChain } from '../src/models/types';

export default function CollectionScreen() {
  const router = useRouter();
  const [lots, setLots] = useState<LotWithChain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCollection = useCallback(async () => {
    try {
      const collectionLots = await getCollection();
      const lotsWithChain = await Promise.all(
        collectionLots.map(lot => getLotWithChain(lot.id))
      );
      setLots(lotsWithChain.filter((l): l is LotWithChain => l !== null));
    } catch (err) {
      console.error('Failed to load collection:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCollection();
    }, [loadCollection])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCollection();
  }, [loadCollection]);

  const handleLotPress = (lotId: string) => {
    router.push(`/lot/${lotId}`);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading collection...</Text>
      </View>
    );
  }

  if (lots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>☕</Text>
        <Text style={styles.emptyTitle}>Your collection is empty</Text>
        <Text style={styles.emptyText}>
          Add coffee lots to track their journey from farm to cup
        </Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/add')}
        >
          <Text style={styles.addButtonText}>Add Your First Lot</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lots}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <LotCard
            lot={item}
            freshness={item.freshness}
            daysSinceRoast={item.daysSinceRoast}
            onPress={() => handleLotPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2C1810"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Collection</Text>
            <Text style={styles.headerCount}>{lots.length} lots</Text>
          </View>
        }
      />
    </View>
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
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2C1810',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
