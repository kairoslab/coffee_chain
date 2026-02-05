/**
 * CoffeeChain Design Tokens
 * LocoRoco-inspired grayscale design system
 *
 * Design Pillars:
 * 1. Radical simplicity - one piece of information per screen
 * 2. Physicality - every element feels soft, alive, responsive
 * 3. Transparency as texture - data completeness visible at a glance
 * 4. Black and white - no color, no emoji, clarity through form and motion
 */

// =============================================================================
// COLOR PALETTE (Grayscale only)
// =============================================================================

export const colors = {
  // Primary
  black: '#000000',
  white: '#FFFFFF',

  // Grays for depth
  gray900: '#333333',
  gray700: '#666666',
  gray500: '#999999',
  gray300: '#CCCCCC',
  gray100: '#E5E5E5',
  gray50: '#F5F5F5',

  // Semantic mappings
  primary: '#000000',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#E5E5E5',
  textPrimary: '#000000',
  textSecondary: '#666666',
  textMuted: '#999999',
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

/**
 * Typography Configuration
 *
 * Currently uses system fonts (San Francisco on iOS, Roboto on Android).
 *
 * To enable Bitcount Single custom fonts:
 * 1. Add font files to src/assets/fonts/
 * 2. Enable loading in src/hooks/useFonts.ts
 * 3. Update fontFamily values below:
 *    - regular: 'BitcountSingle'
 *    - bold: 'BitcountSingle-Bold'
 */
export const typography = {
  // Font family names - using system fonts until custom fonts are added
  fontFamily: {
    regular: 'System',
    bold: 'System',
    system: 'System',
  },

  // Font weights (for fallback system fonts)
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Font sizes - slightly larger for pixel font legibility
  fontSize: {
    xs: 14,
    sm: 16,
    base: 18,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 42,
    '5xl': 56,
  },

  // Line heights - more generous for pixel font
  lineHeight: {
    tight: 1.3,
    normal: 1.6,
    relaxed: 1.8,
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// =============================================================================
// BLOB SIZES
// =============================================================================

export const blobSize = {
  // Based on growth mechanic: 48px min to 96px max
  min: 48,
  max: 96,

  // Standard sizes for different contexts
  xs: 32,
  sm: 48,
  md: 64,
  lg: 80,
  xl: 96,

  // Calculate size from growth units (0-20)
  fromGrowth: (units: number): number => {
    const clamped = Math.max(0, Math.min(20, units));
    const scale = 1 + (clamped * 0.05); // ranges from 1.0 to 2.0
    return Math.round(48 * scale);
  },
} as const;

// =============================================================================
// SHAPE CONFIGURATIONS
// =============================================================================

export const shapes = {
  // Circle (default) - complete, neutral, organic
  // Note: borderRadius is calculated as size/2 in components
  circle: {
    borderRadiusRatio: 0.5, // 50% of size
  },

  // Square - structured data, verified, processed
  square: {
    borderRadiusRatio: 0.1, // 10% of size for rounded corners
  },

  // Triangle - alerts, flags, incomplete data
  // Implemented via SVG in components for proper rendering
  triangle: {
    borderRadiusRatio: 0,
  },
} as const;

export type ShapeType = keyof typeof shapes;

// =============================================================================
// ANIMATION CONFIGURATIONS (Spring physics)
// =============================================================================

export const animations = {
  // Default squish (button press)
  squish: {
    stiffness: 400,
    damping: 17,
    mass: 1,
  },

  // Blob wobble (idle)
  wobble: {
    stiffness: 100,
    damping: 10,
    mass: 1,
  },

  // Page transition
  pageTransition: {
    stiffness: 300,
    damping: 30,
    mass: 1,
  },

  // Split animation (expanding data points)
  split: {
    stiffness: 200,
    damping: 20,
    mass: 1,
    staggerDelay: 50, // ms between each item
  },

  // Merge animation (coalescing data points)
  merge: {
    stiffness: 150,
    damping: 25,
    mass: 1,
  },

  // Shape morphing
  morph: {
    duration: 350,
    easing: 'ease-in-out',
  },

  // Timings
  timing: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    split: 400,
    merge: 600,
  },
} as const;

// =============================================================================
// SQUISH PARAMETERS
// =============================================================================

export const squishParams = {
  onPress: {
    scaleX: 1.1,
    scaleY: 0.9,
  },
  onRelease: {
    scaleX: 1.0,
    scaleY: 1.0,
  },
} as const;

// =============================================================================
// VISIBILITY SCORE THRESHOLDS
// =============================================================================

export const visibilityThresholds = {
  fullyVisible: { min: 76, max: 100, opacity: 1.0, borderWidth: 2 },
  transparent: { min: 51, max: 75, opacity: 0.9, borderWidth: 2 },
  partial: { min: 26, max: 50, opacity: 0.7, borderWidth: 1.5 },
  opaque: { min: 0, max: 25, opacity: 0.4, borderWidth: 1 },
} as const;

export const getVisibilityStyle = (score: number) => {
  if (score >= 76) return visibilityThresholds.fullyVisible;
  if (score >= 51) return visibilityThresholds.transparent;
  if (score >= 26) return visibilityThresholds.partial;
  return visibilityThresholds.opaque;
};

// =============================================================================
// GESTURE THRESHOLDS
// =============================================================================

export const gestures = {
  swipe: {
    minDistance: 50,
    maxDuration: 300,
    angleTolerance: 30, // degrees from cardinal direction
    snapThreshold: 0.3, // 30% of screen width/height
  },
  tap: {
    maxDuration: 200,
    maxDistance: 10,
  },
  hold: {
    minDuration: 500,
  },
} as const;

// =============================================================================
// TOUCH TARGETS (Accessibility)
// =============================================================================

export const touchTargets = {
  minSize: 44,
  minSpacing: 8,
} as const;

// =============================================================================
// LAYOUT
// =============================================================================

export const layout = {
  screenPadding: spacing[4],
  cardPadding: spacing[4],
  sectionGap: spacing[6],
  itemGap: spacing[3],
} as const;

// =============================================================================
// EXPORT THEME OBJECT
// =============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  blobSize,
  shapes,
  animations,
  squishParams,
  visibilityThresholds,
  gestures,
  touchTargets,
  layout,
  getVisibilityStyle,
} as const;

export default theme;
