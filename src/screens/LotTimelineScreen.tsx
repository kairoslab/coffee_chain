/**
 * LotTimelineScreen
 *
 * The primary lot-centric view showing a single lot with swipe navigation
 * through supply chain stages. This is the core experience of CoffeeChain.
 *
 * Navigation:
 * - Swipe left: Next stage (or enter Cupping Suite past final stage)
 * - Swipe right: Previous stage (or return to inventory at first stage)
 * - Swipe up: Inventory view
 * - Swipe down: Global view (placeholder)
 *
 * Per spec: "The primary view shows a single lot with one feature/stage
 * visible at a time."
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { StageView } from '../components/StageView';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { colors } from '../theme';
import { StageType } from '../models/mark2Types';

// Stage data structure for display
interface StageData {
  stage: StageType;
  primaryValue: string;
  secondaryContext?: string;
  tertiaryDetail?: string;
  hasData: boolean;
}

// Lot data structure for the timeline
interface TimelineLot {
  id: string;
  externalId: string;
  growthUnits: number;
  visibilityScore: number;
  stages: StageData[];
}

interface LotTimelineScreenProps {
  lot: TimelineLot;
  onNavigateToInventory?: () => void;
  onNavigateToGlobal?: () => void;
  onNavigateToCupping?: () => void;
  onNavigateBack?: () => void; // Return to inventory from first stage
}

export function LotTimelineScreen({
  lot,
  onNavigateToInventory,
  onNavigateToGlobal,
  onNavigateToCupping,
  onNavigateBack,
}: LotTimelineScreenProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Get available stages (only those with data)
  const availableStages = useMemo(() => {
    return lot.stages.filter(s => s.hasData);
  }, [lot.stages]);

  const currentStage = availableStages[currentStageIndex];
  const isFirstStage = currentStageIndex === 0;
  const isLastStage = currentStageIndex === availableStages.length - 1;

  // Navigation: swipe left to next stage or cupping
  const handleSwipeLeft = useCallback(() => {
    if (isLastStage) {
      // Past final stage -> enter Cupping Suite (per spec section 7.1)
      onNavigateToCupping?.();
    } else {
      setCurrentStageIndex(prev => prev + 1);
    }
  }, [isLastStage, onNavigateToCupping]);

  // Navigation: swipe right to previous stage or back to inventory
  const handleSwipeRight = useCallback(() => {
    if (isFirstStage) {
      // At first stage, swipe right returns to inventory
      onNavigateBack?.();
    } else {
      setCurrentStageIndex(prev => prev - 1);
    }
  }, [isFirstStage, onNavigateBack]);

  // Set up swipe navigation
  const { panHandlers, translateX, translateY } = useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeUp: onNavigateToInventory,
    onSwipeDown: onNavigateToGlobal,
    // Don't disable any direction - all have valid handlers
    disableLeft: false,
    disableRight: false,
    elasticBoundaries: true,
  });

  // Blob press handler (split to show data details)
  const handleBlobPress = useCallback(() => {
    // TODO: Implement split view to show individual data points
    // Per spec section 4.2: "Single tap on a lot blob splits it into
    // individual data points"
    console.log('Blob pressed - would split into data points');
  }, []);

  // Blob long press handler (merge back)
  const handleBlobLongPress = useCallback(() => {
    // TODO: Implement merge from split view
    // Per spec section 4.2: "Press and hold on split view...
    // Returns to default lot view"
    console.log('Blob long pressed - would merge data points');
  }, []);

  if (!currentStage) {
    // No stages available - this shouldn't happen for a valid lot
    return <View style={styles.emptyContainer} />;
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
        shape="circle" // Supply chain stages use circle (cupping uses square)
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
