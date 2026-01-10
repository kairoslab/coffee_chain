// Explore screen - browse and search all lots

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { LotCard } from '../src/components/LotCard';
import { getAllLots, getLotWithChain } from '../src/database/operations';
import type { LotWithChain } from '../src/models/types';

export default function ExploreScreen() {
  const router = useRouter();
  const [lots, setLots] = useState<LotWithChain[]>([]);
  const [filteredLots, setFilteredLots] = useState<LotWithChain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLots = useCallback(async () => {
    try {
      const allLots = await getAllLots();
      const lotsWithChain = await Promise.all(
        allLots.map(lot => getLotWithChain(lot.id))
      );
      const validLots = lotsWithChain.filter((l): l is LotWithChain => l !== null);
      setLots(validLots);
      setFilteredLots(validLots);
    } catch (err) {
      console.error('Failed to load lots:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLots();
    }, [loadLots])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredLots(lots);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = lots.filter(lot =>
      lot.name.toLowerCase().includes(lowercaseQuery) ||
      lot.variety.toLowerCase().includes(lowercaseQuery) ||
      lot.origin.country.toLowerCase().includes(lowercaseQuery) ||
      lot.origin.region.toLowerCase().includes(lowercaseQuery) ||
      (lot.origin.farm?.toLowerCase().includes(lowercaseQuery))
    );
    setFilteredLots(filtered);
  };

  const handleLotPress = (lotId: string) => {
    router.push(`/lot/${lotId}`);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search by name, variety, origin..."
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={() => handleSearch('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Results */}
      {filteredLots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>
            {lots.length === 0 ? 'No lots yet' : 'No results found'}
          </Text>
          <Text style={styles.emptyText}>
            {lots.length === 0
              ? 'Add your first coffee lot to get started'
              : 'Try a different search term'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLots}
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
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {filteredLots.length} {filteredLots.length === 1 ? 'lot' : 'lots'} found
            </Text>
          }
        />
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  listContent: {
    paddingBottom: 24,
  },
  resultCount: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 13,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
