/**
 * StageView Component
 *
 * Displays a single supply chain stage following the "one feature per screen"
 * principle. Shows stage label, lot blob, and data hierarchy.
 *
 * Layout:
 * 1. Stage identification (top)
 * 2. Lot blob (center, interactive)
 * 3. Primary data value (large, prominent)
 * 4. Secondary context (medium)
 * 5. Tertiary details (smaller, optional)
 * 6. Timeline position (bottom)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Blob } from './Blob';
import { colors, typography, spacing, ShapeType } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Stage types matching the supply chain
export type StageType =
  | 'harvest'
  | 'processing'
  | 'drying'
  | 'milling'
  | 'export'
  | 'shipping'
  | 'import'
  | 'warehousing'
  | 'roasting'
  | 'retail'
  | 'cupping';

interface StageViewProps {
  // Stage information
  stage: StageType;
  stageIndex: number;
  totalStages: number;

  // Lot data
  lotId?: string;
  growthUnits?: number;
  visibilityScore?: number;

  // Display data
  primaryValue: string;
  secondaryContext?: string;
  tertiaryDetail?: string;

  // Shape override (default is circle, cupping uses square)
  shape?: ShapeType;

  // Blob label (e.g., lot ID abbreviation)
  blobLabel?: string;

  // Interactions
  onBlobPress?: () => void;
  onBlobLongPress?: () => void;

  // Animation values from swipe
  translateX?: Animated.Value;
  translateY?: Animated.Value;
}

// Human-readable stage labels
const STAGE_LABELS: Record<StageType, string> = {
  harvest: 'HARVEST',
  processing: 'PROCESSING',
  drying: 'DRYING',
  milling: 'MILLING',
  export: 'EXPORT',
  shipping: 'SHIPPING',
  import: 'IMPORT',
  warehousing: 'WAREHOUSING',
  roasting: 'ROASTING',
  retail: 'RETAIL',
  cupping: 'CUPPING',
};

export function StageView({
  stage,
  stageIndex,
  totalStages,
  lotId,
  growthUnits = 10,
  visibilityScore = 100,
  primaryValue,
  secondaryContext,
  tertiaryDetail,
  shape = 'circle',
  blobLabel,
  onBlobPress,
  onBlobLongPress,
  translateX,
  translateY,
}: StageViewProps) {
  // Create animated style if translation values are provided
  const animatedStyle = translateX && translateY
    ? {
        transform: [
          { translateX },
          { translateY },
        ],
      }
    : {};

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Stage Label */}
      <View style={styles.stageHeader}>
        <Text style={styles.stageLabel}>{STAGE_LABELS[stage]}</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Lot Blob */}
        <View style={styles.blobContainer}>
          <Blob
            growthUnits={growthUnits}
            visibilityScore={visibilityScore}
            shape={shape}
            label={blobLabel}
            variant="filled"
            onPress={onBlobPress}
            onLongPress={onBlobLongPress}
          />
        </View>

        {/* Primary Value */}
        <Text style={styles.primaryValue}>{primaryValue}</Text>

        {/* Secondary Context */}
        {secondaryContext && (
          <Text style={styles.secondaryContext}>{secondaryContext}</Text>
        )}

        {/* Tertiary Detail */}
        {tertiaryDetail && (
          <Text style={styles.tertiaryDetail}>{tertiaryDetail}</Text>
        )}
      </View>

      {/* Timeline Indicator */}
      <View style={styles.timelineIndicator}>
        {Array.from({ length: totalStages }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.timelineDot,
              index === stageIndex && styles.timelineDotActive,
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    width: SCREEN_WIDTH,
  },
  stageHeader: {
    paddingTop: spacing[12],
    paddingHorizontal: spacing[4],
    alignItems: 'center',
  },
  stageLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  blobContainer: {
    marginBottom: spacing[8],
  },
  primaryValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  secondaryContext: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  tertiaryDetail: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
  timelineIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing[10],
    gap: spacing[2],
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  timelineDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.black,
  },
});

export default StageView;
