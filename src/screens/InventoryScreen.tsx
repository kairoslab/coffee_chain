/**
 * InventoryScreen
 *
 * Displays user's tracked/saved lots as a grid of blobs.
 * Accessed by swiping up from the lot timeline view.
 *
 * Features:
 * - Blob grid showing all lots (size reflects data richness)
 * - Filtering by origin, date, visibility score
 * - Search functionality
 * - Profile/settings access
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Dimensions,
} from 'react-native';
import { Blob } from '../components/Blob';
import { colors, typography, spacing, touchTargets } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = spacing[4];
const BLOB_GAP = spacing[4];
const BLOBS_PER_ROW = 3;
const BLOB_SIZE = (SCREEN_WIDTH - (GRID_PADDING * 2) - (BLOB_GAP * (BLOBS_PER_ROW - 1))) / BLOBS_PER_ROW;

// Filter options
type SortOption = 'recent' | 'score' | 'origin' | 'name';
type FilterOption = 'all' | 'high_visibility' | 'low_visibility' | 'recent_roast';

interface LotSummary {
  id: string;
  externalId: string;
  name: string;
  origin: string;
  growthUnits: number;
  visibilityScore: number;
  roastDate?: string;
}

interface InventoryScreenProps {
  lots: LotSummary[];
  onSelectLot: (lotId: string) => void;
  onNavigateToProfile?: () => void;
  onSwipeDown?: () => void; // Return to lot view
}

export function InventoryScreen({
  lots,
  onSelectLot,
  onNavigateToProfile,
  onSwipeDown,
}: InventoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Filter and sort lots
  const filteredLots = useMemo(() => {
    let result = [...lots];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        lot =>
          lot.name.toLowerCase().includes(query) ||
          lot.origin.toLowerCase().includes(query) ||
          lot.externalId.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'high_visibility':
        result = result.filter(lot => lot.visibilityScore >= 75);
        break;
      case 'low_visibility':
        result = result.filter(lot => lot.visibilityScore < 50);
        break;
      case 'recent_roast':
        result = result.filter(lot => lot.roastDate);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'score':
        result.sort((a, b) => b.visibilityScore - a.visibilityScore);
        break;
      case 'origin':
        result.sort((a, b) => a.origin.localeCompare(b.origin));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
      default:
        // Assume lots are already sorted by recency
        break;
    }

    return result;
  }, [lots, searchQuery, sortBy, filterBy]);

  const handleLotPress = useCallback(
    (lotId: string) => {
      onSelectLot(lotId);
    },
    [onSelectLot]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <Pressable
          style={styles.profileButton}
          onPress={onNavigateToProfile}
          hitSlop={8}
        >
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>P</Text>
          </View>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search lots..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterChip
            label="All"
            active={filterBy === 'all'}
            onPress={() => setFilterBy('all')}
          />
          <FilterChip
            label="High Visibility"
            active={filterBy === 'high_visibility'}
            onPress={() => setFilterBy('high_visibility')}
          />
          <FilterChip
            label="Needs Data"
            active={filterBy === 'low_visibility'}
            onPress={() => setFilterBy('low_visibility')}
          />
          <FilterChip
            label="Recently Roasted"
            active={filterBy === 'recent_roast'}
            onPress={() => setFilterBy('recent_roast')}
          />
        </ScrollView>
      </View>

      {/* Sort */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroll}
        >
          <SortChip
            label="Recent"
            active={sortBy === 'recent'}
            onPress={() => setSortBy('recent')}
          />
          <SortChip
            label="Score"
            active={sortBy === 'score'}
            onPress={() => setSortBy('score')}
          />
          <SortChip
            label="Origin"
            active={sortBy === 'origin'}
            onPress={() => setSortBy('origin')}
          />
          <SortChip
            label="Name"
            active={sortBy === 'name'}
            onPress={() => setSortBy('name')}
          />
        </ScrollView>
      </View>

      {/* Lot Grid */}
      <ScrollView
        style={styles.gridContainer}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredLots.length === 0 ? (
          <View style={styles.emptyState}>
            <Blob size={80} variant="outlined" />
            <Text style={styles.emptyText}>No lots found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Add your first lot to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredLots.map(lot => (
              <View key={lot.id} style={styles.gridItem}>
                <Blob
                  size={BLOB_SIZE - 16}
                  growthUnits={lot.growthUnits}
                  visibilityScore={lot.visibilityScore}
                  label={lot.externalId.slice(-4)}
                  variant="filled"
                  onPress={() => handleLotPress(lot.id)}
                />
                <Text style={styles.lotName} numberOfLines={1}>
                  {lot.name}
                </Text>
                <Text style={styles.lotOrigin} numberOfLines={1}>
                  {lot.origin}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Swipe indicator */}
      <View style={styles.swipeIndicator}>
        <View style={styles.swipeBar} />
        <Text style={styles.swipeHint}>Swipe down to return</Text>
      </View>
    </View>
  );
}

// Filter chip component
function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

// Sort chip component
function SortChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.sortChip, active && styles.sortChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    color: colors.textPrimary,
  },
  profileButton: {
    width: touchTargets.minSize,
    height: touchTargets.minSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    fontSize: typography.fontSize.sm,
  },
  searchContainer: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: spacing[3],
  },
  searchInput: {
    fontFamily: typography.fontFamily.regular,
    backgroundColor: colors.gray50,
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersContainer: {
    paddingBottom: spacing[2],
  },
  filterScroll: {
    paddingHorizontal: GRID_PADDING,
    gap: spacing[2],
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
    paddingBottom: spacing[3],
  },
  sortLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginRight: spacing[2],
  },
  sortScroll: {
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  chipText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  sortChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 12,
  },
  sortChipActive: {
    backgroundColor: colors.gray100,
  },
  sortChipText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  sortChipTextActive: {
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  gridContainer: {
    flex: 1,
  },
  gridContent: {
    padding: GRID_PADDING,
    paddingBottom: spacing[20],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: BLOB_GAP,
  },
  gridItem: {
    width: BLOB_SIZE,
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  lotName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    marginTop: spacing[2],
    textAlign: 'center',
    width: '100%',
  },
  lotOrigin: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    width: '100%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing[20],
  },
  emptyText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    marginTop: spacing[4],
  },
  emptySubtext: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    marginTop: spacing[1],
  },
  swipeIndicator: {
    position: 'absolute',
    bottom: spacing[8],
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray300,
    borderRadius: 2,
    marginBottom: spacing[1],
  },
  swipeHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
});

export default InventoryScreen;
