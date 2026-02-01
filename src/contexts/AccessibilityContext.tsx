/**
 * AccessibilityContext
 *
 * Provides accessibility preferences throughout the app.
 * Per spec Section 9.6: "Respect prefers-reduced-motion media query"
 *
 * Uses React Native's AccessibilityInfo to detect system-level
 * reduced motion preferences.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { AccessibilityInfo } from 'react-native';

interface AccessibilityContextValue {
  // True if user prefers reduced motion (system setting or user override)
  reducedMotion: boolean;
  // Override system preference (for in-app toggle)
  setReducedMotionOverride: (value: boolean | null) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [userOverride, setUserOverride] = useState<boolean | null>(null);

  // Subscribe to system reduced motion preference
  useEffect(() => {
    // Get initial value
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReducedMotion);

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setSystemReducedMotion
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Final reduced motion value (user override takes precedence)
  const reducedMotion = userOverride !== null ? userOverride : systemReducedMotion;

  const value: AccessibilityContextValue = {
    reducedMotion,
    setReducedMotionOverride: setUserOverride,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access reduced motion preference
 */
export function useReducedMotion(): boolean {
  const context = useContext(AccessibilityContext);
  if (!context) {
    // Return false if used outside provider (safe default)
    return false;
  }
  return context.reducedMotion;
}

/**
 * Hook to access full accessibility context
 */
export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

export default AccessibilityProvider;
