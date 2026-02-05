/**
 * CuppingScreen
 *
 * SCA-style cupping protocol interface accessed by swiping left
 * past the final supply chain stage.
 *
 * Features:
 * - One attribute per screen (maintains single-feature principle)
 * - Swipe left/right to navigate between attributes
 * - Blob transforms to square (structured data context)
 * - Score entry via tap increment or slider
 * - Final summary with total score
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Blob } from '../components/Blob';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { colors, typography, spacing } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// SCA Cupping Attributes
const CUPPING_ATTRIBUTES = [
  { key: 'fragrance', label: 'Fragrance / Aroma', maxScore: 10 },
  { key: 'flavor', label: 'Flavor', maxScore: 10 },
  { key: 'aftertaste', label: 'Aftertaste', maxScore: 10 },
  { key: 'acidity', label: 'Acidity', maxScore: 10 },
  { key: 'body', label: 'Body', maxScore: 10 },
  { key: 'balance', label: 'Balance', maxScore: 10 },
  { key: 'uniformity', label: 'Uniformity', maxScore: 10 },
  { key: 'cleanCup', label: 'Clean Cup', maxScore: 10 },
  { key: 'sweetness', label: 'Sweetness', maxScore: 10 },
  { key: 'overall', label: 'Overall', maxScore: 10 },
] as const;

type AttributeKey = typeof CUPPING_ATTRIBUTES[number]['key'];

interface CuppingScores {
  fragrance: number;
  flavor: number;
  aftertaste: number;
  acidity: number;
  body: number;
  balance: number;
  uniformity: number;
  cleanCup: number;
  sweetness: number;
  overall: number;
}

interface CuppingScreenProps {
  lotId: string;
  lotName: string;
  onComplete: (scores: CuppingScores, total: number) => void;
  onCancel: () => void;
}

export function CuppingScreen({
  lotId,
  lotName,
  onComplete,
  onCancel,
}: CuppingScreenProps) {
  const [currentAttributeIndex, setCurrentAttributeIndex] = useState(0);
  const [scores, setScores] = useState<CuppingScores>({
    fragrance: 6,
    flavor: 6,
    aftertaste: 6,
    acidity: 6,
    body: 6,
    balance: 6,
    uniformity: 6,
    cleanCup: 6,
    sweetness: 6,
    overall: 6,
  });
  const [showSummary, setShowSummary] = useState(false);

  const currentAttribute = CUPPING_ATTRIBUTES[currentAttributeIndex];
  const currentScore = scores[currentAttribute.key];

  // Calculate total score
  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  }, [scores]);

  // Navigation handlers
  const handleSwipeLeft = useCallback(() => {
    if (currentAttributeIndex < CUPPING_ATTRIBUTES.length - 1) {
      setCurrentAttributeIndex(prev => prev + 1);
    } else {
      // Show summary after last attribute
      setShowSummary(true);
    }
  }, [currentAttributeIndex]);

  const handleSwipeRight = useCallback(() => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentAttributeIndex > 0) {
      setCurrentAttributeIndex(prev => prev - 1);
    } else {
      // Exit cupping at first attribute
      onCancel();
    }
  }, [currentAttributeIndex, showSummary, onCancel]);

  // Set up swipe navigation
  const { panHandlers, translateX, translateY } = useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    elasticBoundaries: true,
  });

  // Score adjustment handlers
  const handleTap = useCallback(() => {
    // Increment by 0.25
    setScores(prev => ({
      ...prev,
      [currentAttribute.key]: Math.min(10, prev[currentAttribute.key] + 0.25),
    }));
  }, [currentAttribute.key]);

  const handleLongPress = useCallback(() => {
    // Decrement by 0.5 (per demo notes: decrease should change by steps of 0.5)
    setScores(prev => ({
      ...prev,
      [currentAttribute.key]: Math.max(0, prev[currentAttribute.key] - 0.5),
    }));
  }, [currentAttribute.key]);

  // Complete cupping session
  const handleComplete = useCallback(() => {
    onComplete(scores, totalScore);
  }, [scores, totalScore, onComplete]);

  // Calculate blob size based on score (6 is baseline, score affects size)
  // Per demo notes: size differences should be more pronounced
  const blobSize = 120 + (currentScore - 6) * 20;

  if (showSummary) {
    return (
      <View style={styles.container} {...panHandlers}>
        <Animated.View
          style={[
            styles.summaryContent,
            {
              transform: [{ translateX }, { translateY }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>CUPPING SUMMARY</Text>
            <Text style={styles.lotName}>{lotName}</Text>
          </View>

          {/* Total Score */}
          <View style={styles.totalScoreContainer}>
            <Blob
              size={120}
              shape="square"
              variant="filled"
              label={totalScore.toFixed(1)}
            />
            <Text style={styles.totalLabel}>Total Score</Text>
          </View>

          {/* Score Breakdown */}
          <View style={styles.breakdown}>
            {CUPPING_ATTRIBUTES.map(attr => (
              <View key={attr.key} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{attr.label}</Text>
                <Text style={styles.breakdownScore}>
                  {scores[attr.key].toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Discard</Text>
            </Pressable>
            <Pressable
              style={styles.saveButton}
              onPress={handleComplete}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panHandlers}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX }, { translateY }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stageLabel}>CUPPING</Text>
          <Text style={styles.attributeLabel}>{currentAttribute.label}</Text>
        </View>

        {/* Scoring Area */}
        <View style={styles.scoringArea}>
          <Blob
            size={blobSize}
            shape="square"
            variant="filled"
            label={currentScore.toFixed(2)}
            onPress={handleTap}
            onLongPress={handleLongPress}
          />

          <View style={styles.scoreHints}>
            <Text style={styles.hintText}>Tap to increase (+0.25)</Text>
            <Text style={styles.hintText}>Hold to decrease (-0.5)</Text>
          </View>

          {/* Score Scale */}
          <View style={styles.scaleContainer}>
            <View style={styles.scale}>
              {[0, 2, 4, 6, 8, 10].map(mark => (
                <Text key={mark} style={styles.scaleMark}>
                  {mark}
                </Text>
              ))}
            </View>
            <View style={styles.scaleBar}>
              <View
                style={[
                  styles.scaleFill,
                  { width: `${(currentScore / 10) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressIndicator}>
          {CUPPING_ATTRIBUTES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentAttributeIndex && styles.progressDotActive,
                index < currentAttributeIndex && styles.progressDotComplete,
              ]}
            />
          ))}
        </View>

        {/* Navigation Hint */}
        <Text style={styles.navHint}>
          {currentAttributeIndex === 0
            ? 'Swipe right to cancel'
            : currentAttributeIndex === CUPPING_ATTRIBUTES.length - 1
            ? 'Swipe left for summary'
            : 'Swipe to navigate'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  header: {
    paddingTop: spacing[12],
    alignItems: 'center',
  },
  stageLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  attributeLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    color: colors.textPrimary,
    marginTop: spacing[2],
  },
  scoringArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  scoreHints: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  hintText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[1],
  },
  scaleContainer: {
    width: '100%',
    maxWidth: 280,
    marginTop: spacing[8],
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  scaleMark: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  scaleBar: {
    height: 8,
    backgroundColor: colors.gray100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scaleFill: {
    height: '100%',
    backgroundColor: colors.black,
    borderRadius: 4,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    paddingBottom: spacing[4],
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  progressDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.black,
  },
  progressDotComplete: {
    backgroundColor: colors.gray700,
  },
  navHint: {
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    paddingBottom: spacing[10],
  },
  // Summary styles
  summaryContent: {
    flex: 1,
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing[4],
  },
  summaryHeader: {
    paddingTop: spacing[12],
    alignItems: 'center',
  },
  summaryTitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  lotName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    marginTop: spacing[2],
  },
  totalScoreContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  totalLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    marginTop: spacing[3],
  },
  breakdown: {
    flex: 1,
    paddingTop: spacing[4],
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  breakdownLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  breakdownScore: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[4],
    paddingVertical: spacing[6],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.black,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: colors.black,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: 8,
    backgroundColor: colors.black,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: colors.white,
  },
});

export default CuppingScreen;
