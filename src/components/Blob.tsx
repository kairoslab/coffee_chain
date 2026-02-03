/**
 * Blob Component
 *
 * The core visual element of CoffeeChain. A soft, responsive shape
 * that squishes on touch and can morph between circle, square, and triangle.
 *
 * Inspired by LocoRoco's playful, physics-based characters.
 */

import React, { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, blobSize, animations, squishParams, getVisibilityStyle, ShapeType, typography } from '../theme';
import { useReducedMotion } from '../contexts';

interface BlobProps {
  // Size based on growth units (0-20) or explicit size
  size?: number;
  growthUnits?: number;

  // Shape: circle (default), square, or triangle
  shape?: ShapeType;

  // Visibility score affects opacity and edge treatment
  visibilityScore?: number;

  // Content inside the blob
  label?: string;
  sublabel?: string;

  // Filled (black) or outlined (white with black border)
  variant?: 'filled' | 'outlined';

  // Interaction handlers
  onPress?: () => void;
  onLongPress?: () => void;

  // Disable squish animation
  disabled?: boolean;

  // Custom styles
  style?: ViewStyle;

  // Test ID
  testID?: string;
}

export function Blob({
  size,
  growthUnits = 0,
  shape = 'circle',
  visibilityScore = 100,
  label,
  sublabel,
  variant = 'filled',
  onPress,
  onLongPress,
  disabled = false,
  style,
  testID,
}: BlobProps) {
  // Per spec Section 9.6: respect reduced motion preference
  const reducedMotion = useReducedMotion();

  // Animation values
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;

  // Calculate actual size
  const actualSize = size ?? blobSize.fromGrowth(growthUnits);

  // Get visibility-based styling
  const visibilityStyle = getVisibilityStyle(visibilityScore);

  // Squish animation on press
  // Per spec Section 9.6: skip animation if reducedMotion is enabled
  const handlePressIn = useCallback(() => {
    if (disabled || reducedMotion) return;

    Animated.parallel([
      Animated.spring(scaleX, {
        toValue: squishParams.onPress.scaleX,
        stiffness: animations.squish.stiffness,
        damping: animations.squish.damping,
        mass: animations.squish.mass,
        useNativeDriver: true,
      }),
      Animated.spring(scaleY, {
        toValue: squishParams.onPress.scaleY,
        stiffness: animations.squish.stiffness,
        damping: animations.squish.damping,
        mass: animations.squish.mass,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, reducedMotion, scaleX, scaleY]);

  // Release animation
  const handlePressOut = useCallback(() => {
    if (disabled || reducedMotion) return;

    Animated.parallel([
      Animated.spring(scaleX, {
        toValue: squishParams.onRelease.scaleX,
        stiffness: animations.squish.stiffness,
        damping: animations.squish.damping,
        mass: animations.squish.mass,
        useNativeDriver: true,
      }),
      Animated.spring(scaleY, {
        toValue: squishParams.onRelease.scaleY,
        stiffness: animations.squish.stiffness,
        damping: animations.squish.damping,
        mass: animations.squish.mass,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, reducedMotion, scaleX, scaleY]);

  // Compute shape-specific styles
  const getShapeStyle = (): ViewStyle => {
    switch (shape) {
      case 'circle':
        return { borderRadius: actualSize / 2 };
      case 'square':
        return { borderRadius: actualSize * 0.1 };
      case 'triangle':
        // Triangle requires special handling - we'll use a rotated square
        // for basic implementation, or could use SVG for true triangle
        return {
          borderRadius: 0,
          transform: [{ rotate: '45deg' }],
        };
      default:
        return { borderRadius: actualSize / 2 };
    }
  };

  // Compute variant styles
  const getVariantStyle = (): ViewStyle => {
    if (variant === 'outlined') {
      return {
        backgroundColor: colors.white,
        borderWidth: visibilityStyle.borderWidth,
        borderColor: colors.black,
      };
    }
    return {
      backgroundColor: colors.black,
      borderWidth: 0,
    };
  };

  // Text color based on variant
  const textColor = variant === 'filled' ? colors.white : colors.black;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled && !onPress && !onLongPress}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: actualSize,
            height: actualSize,
            opacity: visibilityStyle.opacity,
            transform: [{ scaleX }, { scaleY }],
          },
          getShapeStyle(),
          getVariantStyle(),
          style,
        ]}
      >
        {shape === 'triangle' ? (
          // Triangle content needs to be counter-rotated
          <View style={styles.triangleContent}>
            {label && (
              <Text
                style={[
                  styles.label,
                  { color: textColor, fontSize: actualSize * 0.25 },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.content}>
            {label && (
              <Text
                style={[
                  styles.label,
                  { color: textColor, fontSize: actualSize * 0.2 },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            )}
            {sublabel && (
              <Text
                style={[
                  styles.sublabel,
                  { color: textColor, fontSize: actualSize * 0.12 },
                ]}
                numberOfLines={1}
              >
                {sublabel}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  triangleContent: {
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  label: {
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
  sublabel: {
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default Blob;
