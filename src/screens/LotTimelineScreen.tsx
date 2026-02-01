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
import { DataPanel } from '../components/DataPanel';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { colors } from '../theme';
import { StageType, STAGE_LABELS } from '../models/mark2Types';

// Stage data structure for display
interface StageData {
  stage: StageType;
  primaryValue: string;
  secondaryContext?: string;
  tertiaryDetail?: string;
  hasData: boolean;
  verified: boolean; // Determines blob variant per spec Section 3.3
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
  const [showDataPanel, setShowDataPanel] = useState(false);

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

  // Blob press handler - show data panel (pragmatic split alternative)
  // Per spec section 4.2: "Single tap on a lot blob splits it into individual data points"
  const handleBlobPress = useCallback(() => {
    setShowDataPanel(true);
  }, []);

  // Dismiss data panel
  const handleDismissPanel = useCallback(() => {
    setShowDataPanel(false);
  }, []);

  // Blob long press handler (same as tap for now)
  const handleBlobLongPress = useCallback(() => {
    setShowDataPanel(true);
  }, []);

  // Build data fields for the current stage
  const dataPanelFields = useMemo(() => {
    if (!currentStage) return [];

    const fields = [
      { label: 'Primary', value: currentStage.primaryValue, verified: currentStage.verified },
    ];

    if (currentStage.secondaryContext) {
      fields.push({ label: 'Participant', value: currentStage.secondaryContext });
    }

    if (currentStage.tertiaryDetail) {
      fields.push({ label: 'Detail', value: currentStage.tertiaryDetail });
    }

    // Add lot-level context
    fields.push({ label: 'Lot ID', value: lot.externalId });
    fields.push({ label: 'Visibility Score', value: `${lot.visibilityScore}/100` });
    fields.push({ label: 'Data Richness', value: `${lot.growthUnits}/20 units` });

    return fields;
  }, [currentStage, lot]);

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
        verified={currentStage.verified}
        onBlobPress={handleBlobPress}
        onBlobLongPress={handleBlobLongPress}
        translateX={translateX}
        translateY={translateY}
      />

      {/* Data Panel - pragmatic alternative to spec's split/merge animation */}
      <DataPanel
        visible={showDataPanel}
        title={STAGE_LABELS[currentStage.stage] || currentStage.stage}
        fields={dataPanelFields}
        onDismiss={handleDismissPanel}
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
