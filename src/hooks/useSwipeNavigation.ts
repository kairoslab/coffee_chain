/**
 * Swipe Navigation Hook
 *
 * Handles swipe gestures in four cardinal directions for navigating
 * between stages (horizontal) and layers (vertical).
 *
 * Navigation model:
 * - Left/Right: Move through lot timeline stages
 * - Up: Access inventory/user layer
 * - Down: Access global view/network layer
 *
 * Uses refs for callbacks to avoid stale closure issues in PanResponder.
 */

import { useRef, useCallback, useEffect } from 'react';
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  Dimensions,
} from 'react-native';
import { gestures } from '../theme';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

interface UseSwipeNavigationOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;

  // Disable specific directions
  disableLeft?: boolean;
  disableRight?: boolean;
  disableUp?: boolean;
  disableDown?: boolean;

  // Enable elastic resistance at boundaries
  elasticBoundaries?: boolean;
}

interface UseSwipeNavigationReturn {
  panHandlers: ReturnType<typeof PanResponder.create>['panHandlers'];
  translateX: Animated.Value;
  translateY: Animated.Value;
  resetPosition: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function useSwipeNavigation(
  options: UseSwipeNavigationOptions = {}
): UseSwipeNavigationReturn {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    disableLeft = false,
    disableRight = false,
    disableUp = false,
    disableDown = false,
    elasticBoundaries = true,
  } = options;

  // Store callbacks in refs to avoid stale closures in PanResponder
  const callbacksRef = useRef({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  });

  const optionsRef = useRef({
    disableLeft,
    disableRight,
    disableUp,
    disableDown,
    elasticBoundaries,
  });

  // Update refs when options change
  useEffect(() => {
    callbacksRef.current = {
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
    };
    optionsRef.current = {
      disableLeft,
      disableRight,
      disableUp,
      disableDown,
      elasticBoundaries,
    };
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    disableLeft,
    disableRight,
    disableUp,
    disableDown,
    elasticBoundaries,
  ]);

  // Animation values for gesture tracking
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Track gesture start time for velocity calculation
  const gestureStartTime = useRef<number>(0);

  // Reset position with spring animation
  const resetPosition = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        stiffness: 300,
        damping: 30,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        stiffness: 300,
        damping: 30,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, translateY]);

  // Determine swipe direction from gesture
  const getSwipeDirection = useCallback(
    (gestureState: PanResponderGestureState): SwipeDirection => {
      const { dx, dy } = gestureState;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Check minimum distance
      if (
        absDx < gestures.swipe.minDistance &&
        absDy < gestures.swipe.minDistance
      ) {
        return null;
      }

      // Check angle tolerance - ensure gesture is primarily in one direction
      const angle = Math.atan2(absDy, absDx) * (180 / Math.PI);
      const isHorizontal = angle < gestures.swipe.angleTolerance;
      const isVertical = angle > 90 - gestures.swipe.angleTolerance;

      if (!isHorizontal && !isVertical) {
        return null; // Diagonal swipe, ignore
      }

      if (isHorizontal) {
        return dx > 0 ? 'right' : 'left';
      } else {
        return dy > 0 ? 'down' : 'up';
      }
    },
    []
  );

  // Check if direction is allowed (using refs for current values)
  const isDirectionAllowed = useCallback(
    (direction: SwipeDirection): boolean => {
      const opts = optionsRef.current;
      const cbs = callbacksRef.current;

      switch (direction) {
        case 'left':
          return !opts.disableLeft && !!cbs.onSwipeLeft;
        case 'right':
          return !opts.disableRight && !!cbs.onSwipeRight;
        case 'up':
          return !opts.disableUp && !!cbs.onSwipeUp;
        case 'down':
          return !opts.disableDown && !!cbs.onSwipeDown;
        default:
          return false;
      }
    },
    []
  );

  // Create pan responder (using refs to get current callback values)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 || Math.abs(dy) > 10;
      },

      onPanResponderGrant: () => {
        gestureStartTime.current = Date.now();
      },

      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const opts = optionsRef.current;

        // Apply elastic resistance if direction is disabled
        let adjustedDx = dx;
        let adjustedDy = dy;

        if (opts.elasticBoundaries) {
          if ((dx > 0 && opts.disableRight) || (dx < 0 && opts.disableLeft)) {
            adjustedDx = dx * 0.3; // Elastic resistance
          }
          if ((dy > 0 && opts.disableDown) || (dy < 0 && opts.disableUp)) {
            adjustedDy = dy * 0.3;
          }
        } else {
          if ((dx > 0 && opts.disableRight) || (dx < 0 && opts.disableLeft)) {
            adjustedDx = 0;
          }
          if ((dy > 0 && opts.disableDown) || (dy < 0 && opts.disableUp)) {
            adjustedDy = 0;
          }
        }

        // Update position
        translateX.setValue(adjustedDx);
        translateY.setValue(adjustedDy);
      },

      onPanResponderRelease: (_, gestureState) => {
        const duration = Date.now() - gestureStartTime.current;
        const direction = getSwipeDirection(gestureState);
        const cbs = callbacksRef.current;

        // Check if swipe meets criteria
        const meetsDistanceThreshold =
          Math.abs(gestureState.dx) >
            SCREEN_WIDTH * gestures.swipe.snapThreshold ||
          Math.abs(gestureState.dy) >
            SCREEN_HEIGHT * gestures.swipe.snapThreshold;

        const meetsTimeThreshold = duration < gestures.swipe.maxDuration;

        if (
          direction &&
          isDirectionAllowed(direction) &&
          (meetsDistanceThreshold || meetsTimeThreshold)
        ) {
          // Execute swipe action using current callback refs
          switch (direction) {
            case 'left':
              cbs.onSwipeLeft?.();
              break;
            case 'right':
              cbs.onSwipeRight?.();
              break;
            case 'up':
              cbs.onSwipeUp?.();
              break;
            case 'down':
              cbs.onSwipeDown?.();
              break;
          }
        }

        // Reset position
        resetPosition();
      },

      onPanResponderTerminate: () => {
        resetPosition();
      },
    })
  ).current;

  return {
    panHandlers: panResponder.panHandlers,
    translateX,
    translateY,
    resetPosition,
  };
}

export default useSwipeNavigation;
