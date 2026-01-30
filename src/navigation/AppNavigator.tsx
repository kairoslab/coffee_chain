/**
 * AppNavigator
 *
 * Main navigation container for the CoffeeChain app.
 * Implements lot-centric, swipe-based navigation:
 *
 * Navigation Layers:
 * - Lot Timeline: Primary view showing single lot stages (horizontal swipe)
 * - Inventory: User's tracked lots (swipe up from lot)
 * - Global View: Network visualization (swipe down from lot)
 * - Cupping Suite: Quality scoring (swipe left past final stage)
 *
 * Per spec: "The core premise: serious data presented through joyful, tactile
 * interaction" and the primary view is lot-centric.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable } from 'react-native';
import { LotTimelineScreen } from '../screens/LotTimelineScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { CuppingScreen } from '../screens/CuppingScreen';
import { Blob } from '../components/Blob';
import { colors, typography, spacing } from '../theme';
import {
  Lot,
  CuppingScores,
  calculateGrowthUnits,
  calculateVisibilityScore,
  getStageDisplayData,
} from '../models/mark2Types';

// Navigation layers
type NavigationLayer = 'lot' | 'inventory' | 'global' | 'cupping';

// Mock data for development - in production, this comes from database
const MOCK_LOTS: Lot[] = [
  {
    id: '1',
    externalId: 'ETH-YRG-2024-0847',
    origin: {
      country: 'Ethiopia',
      region: 'Yirgacheffe',
      subregion: 'Gedeb',
      farm: 'Worka Cooperative',
      producer: 'Worka Cooperative',
      coordinates: { lat: 6.1543, lng: 38.2041 },
      altitude: { min: 1900, max: 2200, unit: 'masl' },
    },
    coffee: {
      varietal: ['Heirloom'],
      processing: 'Washed',
      dryingMethod: 'Raised beds',
      harvestStart: '2024-10-15',
      harvestEnd: '2024-12-20',
    },
    quality: {
      officialScore: 88.5,
      flavorNotes: ['Bergamot', 'Jasmine', 'Lemon'],
      certifications: ['Organic', 'Fair Trade'],
    },
    supplyChain: {
      stages: [
        {
          id: 's1',
          type: 'harvest',
          participant: { id: 'p1', name: 'Worka Cooperative', type: 'producer' },
          timestamp: '2024-11-15T00:00:00Z',
          data: { harvestDate: 'Nov 2024', method: 'Hand-picked' },
          documents: [],
          verified: true,
          verifiedBy: 'certification_body',
        },
        {
          id: 's2',
          type: 'processing',
          participant: { id: 'p2', name: 'Dumerso Station', type: 'processor' },
          timestamp: '2024-11-20T00:00:00Z',
          data: { method: 'Washed', duration: '72 hours fermentation' },
          documents: [],
          verified: true,
        },
        {
          id: 's3',
          type: 'drying',
          participant: { id: 'p2', name: 'Dumerso Station', type: 'processor' },
          timestamp: '2024-11-25T00:00:00Z',
          data: { method: 'Raised Beds', duration: '12-14 days' },
          documents: [],
          verified: false,
        },
        {
          id: 's4',
          type: 'export',
          participant: { id: 'p3', name: 'Trabocca', type: 'exporter' },
          timestamp: '2024-12-10T00:00:00Z',
          data: { destination: 'Rotterdam' },
          documents: [],
          verified: true,
        },
        {
          id: 's5',
          type: 'roasting',
          participant: { id: 'p4', name: 'Ritual Coffee', type: 'roaster' },
          timestamp: '2025-01-20T00:00:00Z',
          data: { roastLevel: 'Light', roastDate: 'Jan 20, 2025' },
          documents: [],
          verified: true,
        },
      ],
    },
    visibility: {
      score: 78,
      lastUpdated: '2025-01-20T00:00:00Z',
      contributors: ['p1', 'p2', 'p3', 'p4'],
    },
    metadata: {
      createdAt: '2024-11-15T00:00:00Z',
      updatedAt: '2025-01-20T00:00:00Z',
      createdBy: 'user1',
    },
  },
  {
    id: '2',
    externalId: 'COL-HUI-2024-0123',
    origin: {
      country: 'Colombia',
      region: 'Huila',
      farm: 'El Paraiso',
      producer: 'Diego Bermudez',
      altitude: { min: 1800, max: 1900, unit: 'masl' },
    },
    coffee: {
      varietal: ['Gesha'],
      processing: 'Anaerobic',
      harvestStart: '2024-09-01',
      harvestEnd: '2024-10-30',
    },
    quality: {
      officialScore: 92,
      flavorNotes: ['Tropical Fruit', 'Fermented', 'Complex'],
      certifications: [],
    },
    supplyChain: {
      stages: [
        {
          id: 's1',
          type: 'harvest',
          participant: { id: 'p5', name: 'Diego Bermudez', type: 'producer' },
          timestamp: '2024-09-15T00:00:00Z',
          data: { harvestDate: 'Sep 2024', method: 'Selective picking' },
          documents: [],
          verified: true,
        },
        {
          id: 's2',
          type: 'processing',
          participant: { id: 'p5', name: 'El Paraiso', type: 'processor' },
          timestamp: '2024-09-20T00:00:00Z',
          data: { method: 'Anaerobic', duration: '120 hours' },
          documents: [],
          verified: true,
        },
        {
          id: 's3',
          type: 'roasting',
          participant: { id: 'p6', name: 'Onyx Coffee', type: 'roaster' },
          timestamp: '2025-01-15T00:00:00Z',
          data: { roastLevel: 'Light-Medium', roastDate: 'Jan 15, 2025' },
          documents: [],
          verified: true,
        },
      ],
    },
    visibility: {
      score: 52,
      lastUpdated: '2025-01-15T00:00:00Z',
      contributors: ['p5', 'p6'],
    },
    metadata: {
      createdAt: '2024-09-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z',
      createdBy: 'user1',
    },
  },
  {
    id: '3',
    externalId: 'KEN-NYR-2024-0456',
    origin: {
      country: 'Kenya',
      region: 'Nyeri',
      producer: 'Karindundu Factory',
    },
    coffee: {
      varietal: ['SL28', 'SL34'],
      processing: 'Washed',
      harvestStart: '2024-10-01',
      harvestEnd: '2024-11-30',
    },
    quality: {
      flavorNotes: ['Blackcurrant', 'Tomato', 'Bright'],
      certifications: [],
    },
    supplyChain: {
      stages: [
        {
          id: 's1',
          type: 'harvest',
          participant: { id: 'p7', name: 'Karindundu', type: 'producer' },
          timestamp: '2024-10-20T00:00:00Z',
          data: { harvestDate: 'Oct 2024' },
          documents: [],
          verified: false,
        },
      ],
    },
    visibility: {
      score: 18,
      lastUpdated: '2024-10-20T00:00:00Z',
      contributors: ['p7'],
    },
    metadata: {
      createdAt: '2024-10-20T00:00:00Z',
      updatedAt: '2024-10-20T00:00:00Z',
      createdBy: 'user1',
    },
  },
];

export function AppNavigator() {
  // Navigation state
  const [currentLayer, setCurrentLayer] = useState<NavigationLayer>('inventory');
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [lots] = useState<Lot[]>(MOCK_LOTS);

  // Get selected lot
  const selectedLot = useMemo(() => {
    if (!selectedLotId) return null;
    return lots.find(l => l.id === selectedLotId) || null;
  }, [selectedLotId, lots]);

  // Transform lot for timeline view
  const timelineLot = useMemo(() => {
    if (!selectedLot) return null;

    const growthUnits = calculateGrowthUnits(selectedLot);
    const visibilityScore = calculateVisibilityScore(selectedLot);

    const stages = selectedLot.supplyChain.stages.map(stage => ({
      stage: stage.type,
      ...getStageDisplayData(stage),
      hasData: true,
    }));

    return {
      id: selectedLot.id,
      externalId: selectedLot.externalId,
      growthUnits,
      visibilityScore,
      stages,
    };
  }, [selectedLot]);

  // Transform lots for inventory view
  const inventoryLots = useMemo(() => {
    return lots.map(lot => ({
      id: lot.id,
      externalId: lot.externalId,
      name: lot.origin.farm || lot.origin.producer,
      origin: `${lot.origin.region}, ${lot.origin.country}`,
      growthUnits: calculateGrowthUnits(lot),
      visibilityScore: calculateVisibilityScore(lot),
      roastDate: lot.supplyChain.stages.find(s => s.type === 'roasting')
        ?.timestamp,
    }));
  }, [lots]);

  // ==========================================================================
  // Navigation Handlers
  // ==========================================================================

  // From lot timeline: swipe up to inventory
  const handleNavigateToInventory = useCallback(() => {
    setCurrentLayer('inventory');
  }, []);

  // From lot timeline: swipe down to global view
  const handleNavigateToGlobal = useCallback(() => {
    setCurrentLayer('global');
  }, []);

  // From inventory: select a lot to view its timeline
  const handleSelectLot = useCallback((lotId: string) => {
    setSelectedLotId(lotId);
    setCurrentLayer('lot');
  }, []);

  // From lot timeline: swipe left past final stage to cupping
  const handleNavigateToCupping = useCallback(() => {
    if (selectedLotId) {
      setCurrentLayer('cupping');
    }
  }, [selectedLotId]);

  // From lot timeline: swipe right at first stage to return to inventory
  const handleNavigateBack = useCallback(() => {
    setCurrentLayer('inventory');
  }, []);

  // From cupping: complete session
  const handleCuppingComplete = useCallback(
    (scores: CuppingScores, total: number) => {
      // TODO: Save cupping session to database
      console.log('Cupping complete:', { lotId: selectedLotId, scores, total });
      setCurrentLayer('lot');
    },
    [selectedLotId]
  );

  // From cupping: cancel/discard session
  const handleCuppingCancel = useCallback(() => {
    setCurrentLayer('lot');
  }, []);

  // From global view: return to lot
  const handleReturnFromGlobal = useCallback(() => {
    if (selectedLotId) {
      setCurrentLayer('lot');
    } else {
      setCurrentLayer('inventory');
    }
  }, [selectedLotId]);

  // ==========================================================================
  // Render
  // ==========================================================================

  const renderContent = () => {
    switch (currentLayer) {
      case 'inventory':
        return (
          <InventoryScreen
            lots={inventoryLots}
            onSelectLot={handleSelectLot}
            onNavigateToProfile={() => console.log('Navigate to profile')}
          />
        );

      case 'lot':
        if (!timelineLot) {
          // No lot selected - return to inventory
          setCurrentLayer('inventory');
          return null;
        }
        return (
          <LotTimelineScreen
            lot={timelineLot}
            onNavigateToInventory={handleNavigateToInventory}
            onNavigateToGlobal={handleNavigateToGlobal}
            onNavigateToCupping={handleNavigateToCupping}
            onNavigateBack={handleNavigateBack}
          />
        );

      case 'cupping':
        if (!selectedLot) {
          setCurrentLayer('inventory');
          return null;
        }
        return (
          <CuppingScreen
            lotId={selectedLot.id}
            lotName={selectedLot.origin.farm || selectedLot.origin.producer}
            onComplete={handleCuppingComplete}
            onCancel={handleCuppingCancel}
          />
        );

      case 'global':
        // Global view placeholder - per spec section 8.3
        return (
          <View style={styles.globalPlaceholder}>
            <View style={styles.globalContent}>
              <Text style={styles.globalTitle}>GLOBAL VIEW</Text>
              <Blob size={80} variant="outlined" />
              <Text style={styles.globalSubtitle}>
                Network visualization coming soon
              </Text>
              <Text style={styles.globalHint}>
                This will show lot relationships and supply chain connections
              </Text>
              <Pressable
                style={styles.returnButton}
                onPress={handleReturnFromGlobal}
              >
                <Text style={styles.returnButtonText}>Return</Text>
              </Pressable>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  globalPlaceholder: {
    flex: 1,
    backgroundColor: colors.white,
  },
  globalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  globalTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: spacing[8],
  },
  globalSubtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing[4],
  },
  globalHint: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing[2],
    maxWidth: 280,
  },
  returnButton: {
    marginTop: spacing[8],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.black,
    borderRadius: 8,
  },
  returnButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});

export default AppNavigator;
