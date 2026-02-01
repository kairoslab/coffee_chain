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

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { LotTimelineScreen } from '../screens/LotTimelineScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { CuppingScreen } from '../screens/CuppingScreen';
import { Blob } from '../components/Blob';
import { useLots } from '../data';
import { colors, typography, spacing } from '../theme';
import { CuppingScores } from '../models/mark2Types';

// Navigation layers
type NavigationLayer = 'lot' | 'inventory' | 'global' | 'cupping';

export function AppNavigator() {
  // Get lot data from context
  const {
    lotSummaries,
    getLotById,
    getTimelineLot,
    saveCuppingSession,
    isLoading,
    error,
  } = useLots();

  // Navigation state
  const [currentLayer, setCurrentLayer] = useState<NavigationLayer>('inventory');
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  // Get selected lot data
  const selectedLot = selectedLotId ? getLotById(selectedLotId) : null;
  const timelineLot = selectedLotId ? getTimelineLot(selectedLotId) : null;

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
    async (scores: CuppingScores, total: number) => {
      if (selectedLotId) {
        await saveCuppingSession(selectedLotId, scores, total);
      }
      setCurrentLayer('lot');
    },
    [selectedLotId, saveCuppingSession]
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
  // Loading and Error States
  // ==========================================================================

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Blob size={64} variant="outlined" />
        <ActivityIndicator
          size="small"
          color={colors.black}
          style={styles.loadingIndicator}
        />
        <Text style={styles.loadingText}>Loading lots...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Blob size={64} variant="outlined" label="!" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  const renderContent = () => {
    switch (currentLayer) {
      case 'inventory':
        return (
          <InventoryScreen
            lots={lotSummaries}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing[4],
  },
  loadingIndicator: {
    marginTop: spacing[4],
  },
  loadingText: {
    marginTop: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  errorTitle: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  errorText: {
    marginTop: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
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
