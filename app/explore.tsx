// Explore screen - discover and search coffee lots

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LotCard } from '../src/components/LotCard';
import { getAllLots, getLotWithChain } from '../src/database/operations';
import type { LotWithChain } from '../src/models/types';

export default function ExploreScreen() {
  const router = useRouter();
  const [lots, setLots] = useState<LotWithChain[]>([]);
  const [filteredLots, setFilteredLots] = useState<LotWithChain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLots() {
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
    }
    loadLots();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLots(lots);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = lots.filter(
      lot =>
        lot.name.toLowerCase().includes(query) ||
        lot.variety.toLowerCase().includes(query) ||
        lot.origin.country.toLowerCase().includes(query) ||
        lot.origin.region.toLowerCase().includes(query) ||
        (lot.origin.farm && lot.origin.farm.toLowerCase().includes(query))
    );
    setFilteredLots(filtered);
  }, [searchQuery, lots]);

  const handleLotPress = (lotId: string) => {
    router.push(`/lot/${lotId}`);
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, variety, origin..."
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : filteredLots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No results found' : 'No lots yet'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Try a different search term'
              : 'Add your first coffee lot to get started'}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    marginLeft: 8,
    padding: 8,
  },
  clearButtonText: {
    color: '#9ca3af',
    fontSize: 16,
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
  resultCount: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#6b7280',
    fontSize: 13,
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
