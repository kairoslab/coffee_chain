/**
 * LotTimelineScreen
 *
 * The primary view showing a single lot with swipe navigation
 * through supply chain stages.
 *
 * Navigation:
 * - Swipe left: Next stage
 * - Swipe right: Previous stage
 * - Swipe up: Inventory view
 * - Swipe down: Global view (placeholder)
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { StageView, StageType } from '../components/StageView';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { colors } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define the supply chain stage order
const STAGE_ORDER: StageType[] = [
  'harvest',
  'processing',
  'drying',
  'milling',
  'export',
  'shipping',
  'import',
  'warehousing',
  'roasting',
  'retail',
  'cupping',
];

// Mock stage data - in real app this comes from the lot data
interface StageData {
  stage: StageType;
  primaryValue: string;
  secondaryContext?: string;
  tertiaryDetail?: string;
  hasData: boolean;
}

interface LotTimelineScreenProps {
  lot: {
    id: string;
    externalId: string;
    growthUnits: number;
    visibilityScore: number;
    stages: StageData[];
  };
  onNavigateToInventory?: () => void;
  onNavigateToGlobal?: () => void;
}

export function LotTimelineScreen({
  lot,
  onNavigateToInventory,
  onNavigateToGlobal,
}: LotTimelineScreenProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Get current and available stages
  const availableStages = useMemo(() => {
    return lot.stages.filter(s => s.hasData);
  }, [lot.stages]);

  const currentStage = availableStages[currentStageIndex];

  // Navigation handlers
  const handleSwipeLeft = useCallback(() => {
    if (currentStageIndex < availableStages.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    }
  }, [currentStageIndex, availableStages.length]);

  const handleSwipeRight = useCallback(() => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1);
    }
  }, [currentStageIndex]);

  // Set up swipe navigation
  const {
    panHandlers,
    translateX,
    translateY,
  } = useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeUp: onNavigateToInventory,
    onSwipeDown: onNavigateToGlobal,
    disableLeft: currentStageIndex >= availableStages.length - 1,
    disableRight: currentStageIndex <= 0,
    elasticBoundaries: true,
  });

  // Blob press handler (split to show data details)
  const handleBlobPress = useCallback(() => {
    // TODO: Implement split view to show individual data points
    console.log('Blob pressed - would split into data points');
  }, []);

  // Blob long press handler (merge back)
  const handleBlobLongPress = useCallback(() => {
    // TODO: Implement merge from split view
    console.log('Blob long pressed - would merge data points');
  }, []);

  // Determine shape based on stage
  const getShapeForStage = (stage: StageType) => {
    if (stage === 'cupping') return 'square' as const;
    return 'circle' as const;
  };

  if (!currentStage) {
    return (
      <View style={styles.emptyContainer}>
        {/* Empty state handled by parent */}
      </View>
    );
  }

  return (
    <View style={styles.container} {...panHandlers}>
      <StageView
        stage={currentStage.stage}
        stageIndex={currentStageIndex}
        totalStages={availableStages.length}
        lotId={lot.id}
        growthUnits={lot.growthUnits}
        visibilityScore={lot.visibilityScore}
        primaryValue={currentStage.primaryValue}
        secondaryContext={currentStage.secondaryContext}
        tertiaryDetail={currentStage.tertiaryDetail}
        shape={getShapeForStage(currentStage.stage)}
        blobLabel={lot.externalId.slice(-4)}
        onBlobPress={handleBlobPress}
        onBlobLongPress={handleBlobLongPress}
        translateX={translateX}
        translateY={translateY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default LotTimelineScreen;
