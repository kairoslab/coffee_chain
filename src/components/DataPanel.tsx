/**
 * DataPanel Component
 *
 * A slide-up panel showing stage-specific data fields.
 * Pragmatic alternative to the spec's split/merge blob animation.
 *
 * Per spec Section 4.2, tapping a blob should reveal individual data points.
 * Instead of animating many small blobs (complex in React Native), this panel
 * slides up to show the data in a clear, accessible format.
 *
 * Interaction:
 * - Swipe down or press outside to dismiss
 * - Maintains the "one feature per screen" principle by overlaying, not replacing
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
  PanResponder,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.5;

interface DataField {
  label: string;
  value: string;
  verified?: boolean;
}

interface DataPanelProps {
  visible: boolean;
  title: string;
  fields: DataField[];
  onDismiss: () => void;
}

export function DataPanel({ visible, title, fields, onDismiss }: DataPanelProps) {
  const translateY = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Animate in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 12,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: PANEL_HEIGHT,
          useNativeDriver: true,
          tension: 100,
          friction: 12,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  // Pan responder for swipe-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          onDismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable style={styles.backdropPress} onPress={onDismiss} />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={[
          styles.panel,
          { transform: [{ translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Data Fields */}
        <View style={styles.fieldsContainer}>
          {fields.map((field, index) => (
            <View key={index} style={styles.field}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <View style={styles.fieldValueContainer}>
                <Text style={styles.fieldValue}>{field.value}</Text>
                {field.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>VERIFIED</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Dismiss hint */}
        <Text style={styles.hint}>Swipe down to dismiss</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backdropPress: {
    flex: 1,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray300,
    borderRadius: 2,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  fieldsContainer: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  field: {
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
    marginBottom: spacing[1],
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: colors.black,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing[2],
  },
  verifiedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    paddingBottom: spacing[6],
  },
});

export default DataPanel;
