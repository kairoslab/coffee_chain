# CoffeeChain Mark2 Spec vs Implementation Analysis

## Executive Summary

This document identifies logical conflicts and technical inconsistencies between the
mark2 specification and the current codebase implementation. Issues are categorized
by severity and impact on the lot-centric model.

---

## 1. LOGICAL CONFLICTS

### 1.1 Visibility Score Calculation Mismatch

**Severity: Medium | Impact: Data Accuracy**

**Spec (Section 5.2)** lists base score components:
| Stage | Points |
|-------|--------|
| Farm/Producer | 8 |
| Harvest | 6 |
| Processing | 8 |
| ... | ... |
| **Total** | **60** |

**Implementation (`STAGE_POINTS` in mark2Types.ts:231-242)**:
```typescript
harvest: 6,      // ✓ matches
processing: 8,   // ✓ matches
retail: 8,       // ✗ NOT in spec
```

**Conflicts**:
1. Spec lists "Farm/Producer" as 8 points - implementation has no equivalent
2. Implementation includes "retail" (8 pts) - not in spec's base score table
3. Philosophical issue: Spec treats producer documentation as valuable;
   implementation only rewards supply chain *events*

**Root Cause**: Spec conflates "documentation" with "stages" but they're different
concepts. A lot can have complete producer data with no harvest stage recorded yet.

---

### 1.2 Growth Outline Background - Missing

**Severity: Low | Impact: Visual Feedback**

**Spec (Section 4)**:
> "A circular outline rests in the background when lot is in its standard
> representation, suggesting the space that can be filled with further data input"

**Implementation**: No growth outline exists. Blobs show only their current size
with no visual indicator of maximum potential.

**Impact**: Users cannot perceive at-a-glance how much more data a lot could contain.
This undermines the "transparency as texture" design pillar.

---

### 1.3 Triangle Shape - Incorrect Implementation

**Severity: Medium | Impact: Semantic Meaning**

**Spec (Section 3.3)**:
```css
triangle: clip-path: polygon(50% 0%, 0% 100%, 100% 100%)
```

**Implementation (Blob.tsx:128-134)**:
```typescript
case 'triangle':
  return {
    borderRadius: 0,
    transform: [{ rotate: '45deg' }],
  };
```

**Conflict**: Implementation uses a rotated square (diamond shape), not a triangle.
React Native doesn't support `clip-path`. The semantic meaning of "triangle = alert"
is lost when the shape is actually a diamond.

---

### 1.4 Wobble Animation - Missing

**Severity: Low | Impact: Physicality Pillar**

**Spec (Section 9.3)**:
```json
Blob wobble (idle): {
  stiffness: 100,
  damping: 10,
  mass: 1
}
```

**Implementation**: Only squish on press/release. No idle wobble animation.

**Impact**: Blobs feel static rather than "alive" per the physicality design pillar.

---

### 1.5 Split/Merge Interactions - Placeholder Only

**Severity: High | Impact: Core Interaction**

**Spec (Section 4.2)**:
> "Single tap on a lot blob splits it into individual data points"
> "Press and hold on split view... Returns to default lot view"

**Implementation (LotTimelineScreen.tsx:101-114)**:
```typescript
const handleBlobPress = useCallback(() => {
  console.log('Blob pressed - would split into data points');
}, []);
```

**Impact**: A core interaction pattern from the spec is missing entirely.

---

### 1.6 Edge Treatment for Low Visibility - Missing

**Severity: Low | Impact: Visual Feedback**

**Spec (Section 5.3)**:
> "Decreasing visibility: increasingly wobbly/unstable border animation"

**Implementation**: Only changes opacity. No animated border wobble.

---

### 1.7 Shape Semantic Defaults Inverted

**Severity: Medium | Impact: Visual Language**

**Spec (Section 3.3)**:
- CIRCLE default: "Neutral/unreviewed status (White Circle / Type is black)"
- SQUARE: "Reading Square is White / Type is black"

**Implementation (Blob.tsx)**:
- Default `variant='filled'` = black background, white text
- Only `variant='outlined'` = white background, black text

**Conflict**: Spec implies default circles should be white (hollow) for "unreviewed"
status. Implementation defaults to filled black, which spec reserves for "complete"
data sets.

---

### 1.8 Cupping Defects UI - Missing

**Severity: Low | Impact: Feature Completeness**

**Spec (Section 7.4)**:
```json
defects: {
  taint: integer,
  fault: integer
}
```

**Implementation**: CuppingScreen has no UI for recording defects. Data model
includes it (CuppingSession.defects) but no way to input.

---

### 1.9 Screen Transition Animation - Wrong Type

**Severity: Low | Impact: Polish**

**Spec (Section 6.1)**:
- Duration: 300ms ease-out
- Scale departing view to 0.95
- Scale arriving view from 0.95 to 1.0

**Implementation**: Uses spring physics with translateX/translateY only.
No scale animation, no ease-out timing.

---

## 2. TECHNICAL INCONSISTENCIES

### 2.1 Mock Data Embedded in Navigator

**Severity: High | Impact: Architecture**

**Location**: `AppNavigator.tsx` lines 36-227 (~200 lines of mock data)

**Issue**: Mock data should be in a data layer, not a navigation component.
This violates separation of concerns and makes the navigator hard to maintain.

---

### 2.2 Database Layer Unused

**Severity: High | Impact: Data Persistence**

**Existing files**:
- `src/database/schema.ts` - SQLite setup
- `src/database/operations.ts` - CRUD operations
- `src/database/seed.ts` - Demo data

**Issue**: The mark2 implementation completely ignores these. No connection between
the new screens and the existing database layer.

---

### 2.3 Cupping Sessions Not Persisted

**Severity: Medium | Impact: Data Loss**

**Location**: `AppNavigator.tsx:310-315`
```typescript
const handleCuppingComplete = useCallback(
  (scores: CuppingScores, total: number) => {
    console.log('Cupping complete:', { lotId: selectedLotId, scores, total });
    setCurrentLayer('lot');
  },
  [selectedLotId]
);
```

**Issue**: Cupping data is lost on completion. No persistence mechanism.

---

### 2.4 Reduced Motion Setting Unused

**Severity: Low | Impact: Accessibility**

**Spec (Section 9.6)**:
> "Respect prefers-reduced-motion media query"
> "Provide toggle in settings to disable animations"

**Implementation**: `User.settings.reducedMotion` exists in types but is never read
or applied to animation behavior.

---

### 2.5 Duplicate Visibility Calculations

**Severity: Low | Impact: Performance**

**Location**: `AppNavigator.tsx`

`calculateGrowthUnits` and `calculateVisibilityScore` are called repeatedly:
- Once in `timelineLot` useMemo
- Once for each lot in `inventoryLots` useMemo

For the same lot, calculations repeat on every render cycle.

---

## 3. PHILOSOPHICAL TENSIONS

### 3.1 Lot-Centric Model Adherence

The spec emphasizes lot-centricity, but current implementation:
- Starts on Inventory view (lots as items in a list)
- Lot becomes "selected" rather than being the primary entity

**Tension**: Is the lot the universe, or is the user's collection the universe?

### 3.2 "One Feature Per Screen" Strictness

The spec mandates one piece of information per screen, but:
- Inventory shows grid of lots (many items)
- Cupping summary shows all 10 scores at once

**Tension**: Practical usability vs. design pillar purity.

### 3.3 Animation Library Choice

**Spec**: Recommends Framer Motion or React Spring
**Reality**: React Native requires different libraries (Reanimated, Animated API)

**Tension**: Spec written for web; implementation is React Native. The spring
parameters don't translate 1:1.

---

## 4. SUMMARY TABLE

| Issue | Severity | Category | Spec Section |
|-------|----------|----------|--------------|
| Visibility score calculation | Medium | Logic | 5.2 |
| Growth outline missing | Low | Visual | 4.0 |
| Triangle shape wrong | Medium | Visual | 3.3 |
| Wobble animation missing | Low | Animation | 9.3 |
| Split/merge not implemented | High | Interaction | 4.2 |
| Edge wobble missing | Low | Visual | 5.3 |
| Shape defaults inverted | Medium | Visual | 3.3 |
| Cupping defects UI missing | Low | Feature | 7.4 |
| Transition animation wrong | Low | Animation | 6.1 |
| Mock data in navigator | High | Architecture | N/A |
| Database layer unused | High | Architecture | N/A |
| Cupping not persisted | Medium | Data | N/A |
| Reduced motion unused | Low | Accessibility | 9.6 |
| Duplicate calculations | Low | Performance | N/A |

---

## 5. RECOMMENDED PRIORITIES

### Must Fix (Blocks core functionality)
1. Database layer connection
2. Cupping persistence
3. Mock data extraction

### Should Fix (Undermines design intent)
4. Visibility score calculation alignment
5. Shape semantic defaults
6. Split/merge interactions

### Nice to Have (Polish)
7. Growth outline
8. Wobble animation
9. Edge treatment for visibility
10. Triangle via SVG
11. Transition scale animations
12. Reduced motion support
