# CoffeeChain Remediation Plan

Based on the analysis in SPEC_ANALYSIS.md, this plan addresses identified issues
with minimal technical debt while honoring both technical viability and philosophical
intent.

---

## Design Principles for Remediation

1. **Use existing infrastructure** - The database layer exists; connect to it
2. **Avoid over-engineering** - Simple solutions for simple problems
3. **Honor the lot-centric model** - Lot is the primary entity
4. **Pragmatic purity** - Apply spec principles where they add value, adapt where they don't
5. **Incremental improvement** - Each change should leave codebase better, not worse

---

## Phase 1: Data Layer Foundation

**Goal**: Connect mark2 implementation to existing database layer

### 1.1 Extract Mock Data to Data Provider

**Problem**: 200 lines of mock data in AppNavigator.tsx

**Solution**: Create a lightweight data context that can serve mock data now and
database data later.

```
src/data/
├── LotProvider.tsx      # React context providing lots
├── useLots.ts           # Hook for accessing lots
├── mockData.ts          # Mock lots (extracted from AppNavigator)
└── index.ts
```

**Approach**:
- LotProvider wraps app, provides lot state
- In development: loads mock data
- In production: loads from database via operations.ts
- Single source of truth for lot data

**Technical Debt Avoided**: Not creating a new ORM, state management library,
or complex caching layer. Just a context that bridges mock → database.

### 1.2 Connect Cupping Persistence

**Problem**: Cupping sessions logged to console, then lost

**Solution**: Use existing `createInteraction()` from operations.ts

The database schema already has an `interactions` table with type field.
Cupping sessions fit as `type: 'cupping'` interactions.

```typescript
// In handleCuppingComplete
await createInteraction({
  lotId: selectedLotId,
  type: 'cupping',
  data: JSON.stringify({ scores, total, defects: { taint: 0, fault: 0 } }),
  createdAt: new Date().toISOString(),
});
```

**Technical Debt Avoided**: Not creating new tables, new models, or new
persistence patterns. Using what exists.

---

## Phase 2: Visibility Score Alignment

**Goal**: Make visibility calculation match spec intent

### 2.1 Reconcile Stage Points with Spec

**Problem**: Spec has "Farm/Producer" as 8 points; implementation doesn't

**Analysis**: The spec's intent is that *documenting the producer* adds value
independent of documenting the *harvest event*. These are different things:
- Producer documentation: name, location, certifications
- Harvest stage: when picking occurred, method used

**Solution**: Add producer documentation as a factor in visibility calculation:

```typescript
// In calculateVisibilityScore
let baseScore = 0;

// Producer documentation (spec: 8 points for Farm/Producer)
if (lot.origin.producer && lot.origin.country) {
  baseScore += 8;
}

// Stage documentation
for (const stage of lot.supplyChain.stages) {
  baseScore += STAGE_POINTS[stage.type] || 0;
}

// Cap at 60 as per spec
baseScore = Math.min(baseScore, 60);
```

**Technical Debt Avoided**: Not restructuring the data model. Simple conditional
check on existing fields.

---

## Phase 3: Visual Language Corrections

**Goal**: Align visual output with spec intent

### 3.1 Shape Semantic Defaults

**Problem**: Spec says default circles are white (unreviewed); implementation fills them black

**Analysis**: The spec distinguishes:
- Unreviewed/neutral: white circle, black text
- Complete/reviewed: black circle, white text

**Solution**: Change Blob default variant based on context:

```typescript
// In StageView, determine variant by verification status
const blobVariant = stage.verified ? 'filled' : 'outlined';
```

This makes unverified stages appear as white outlined circles (per spec) and
verified stages as filled black circles.

**Alternative Considered**: Make 'outlined' the default variant globally.
Rejected because: inventory view benefits from filled blobs for visual weight.

**Decision**: Context-aware defaults. StageView uses verification status.
Inventory uses filled for scanability.

### 3.2 Growth Outline (Deferred)

**Problem**: No visual indicator of "maximum potential size"

**Analysis**: This is pure visual polish. The spec says "suggesting the space
that can be filled" but implementing an animated outline behind every blob adds
rendering complexity for minimal UX gain.

**Recommendation**: Defer. The size differential between small and large blobs
already communicates data richness. An outline adds visual noise.

If implemented later:
```typescript
// Add to Blob component
{showGrowthOutline && (
  <View style={[styles.growthOutline, { width: maxSize, height: maxSize }]} />
)}
```

### 3.3 Triangle Shape via SVG

**Problem**: Current implementation uses rotated square (diamond)

**Analysis**: True triangles require SVG in React Native. The `react-native-svg`
package is not currently installed.

**Options**:
1. Add react-native-svg dependency → renders true triangles
2. Use Unicode triangle character (▲) → text-based, simple
3. Keep diamond → works, but wrong semantic shape

**Recommendation**: Option 2 for now. The triangle's purpose is to draw attention
to alerts. A text-based indicator serves this purpose without new dependencies.

```typescript
// For alert states, show triangle indicator
{hasAlert && <Text style={styles.alertIndicator}>▲</Text>}
```

**Future**: When SVG is needed for other features (network graph in Global View),
revisit triangle implementation.

---

## Phase 4: Interaction Patterns

**Goal**: Implement split/merge in a sustainable way

### 4.1 Split/Merge - Pragmatic Interpretation

**Problem**: Spec envisions tapping blob to explode into mini-blobs

**Analysis**: Full implementation requires:
- Dynamic blob creation (N blobs for N data points)
- Layout algorithm for positioning
- Staggered animation orchestration
- Gesture handling on each mini-blob
- Merge animation back to single blob

This is complex. But what's the *intent*?

**Spec Intent**: "Useful for examining specific stages or comparing components"

The goal is to let users see individual data points, not necessarily to have
animated blob explosions.

**Pragmatic Solution**: Tap blob → expand inline to show data breakdown

```
┌─────────────────────────┐
│      PROCESSING         │
│                         │
│         (●)             │  ← Blob (tappable)
│                         │
│        Washed           │
│    Dumerso Station      │
└─────────────────────────┘

         ↓ tap ↓

┌─────────────────────────┐
│      PROCESSING         │
│   ┌─────────────────┐   │
│   │ Method: Washed  │   │
│   │ Duration: 72hrs │   │  ← Expanded data panel
│   │ Ferment: Yes    │   │
│   │ Verified: ✓     │   │
│   └─────────────────┘   │
│         (●)             │  ← Blob (tap to collapse)
│        Washed           │
└─────────────────────────┘
```

**Benefits**:
- Achieves spec intent (see individual data points)
- Simpler implementation (show/hide panel)
- Maintains single-screen principle (panel is inline, not navigation)
- Touch target remains large and clear

**Technical Debt Avoided**: Not implementing complex animation orchestration,
layout algorithms, or gesture handling for dynamic blob counts.

### 4.2 Hold Gesture

**Spec**: Hold on split view to merge back

**Pragmatic Interpretation**: If split is a panel expansion, merge is simply
collapsing the panel. Tap toggles; no hold needed.

---

## Phase 5: Animation Polish (Optional)

**Goal**: Add life to the interface

### 5.1 Wobble Animation

**Priority**: Low

**If implemented**: Add subtle idle wobble using Animated.loop:

```typescript
useEffect(() => {
  if (!reducedMotion) {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1.02, duration: 2000 }),
        Animated.timing(wobble, { toValue: 0.98, duration: 2000 }),
      ])
    ).start();
  }
}, [reducedMotion]);
```

### 5.2 Reduced Motion Support

**Implementation**: Check system preference and user setting:

```typescript
import { AccessibilityInfo } from 'react-native';

const [reducedMotion, setReducedMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
}, []);
```

Apply to all animation configurations:

```typescript
const animationConfig = reducedMotion
  ? { duration: 0 }
  : { stiffness: 400, damping: 17 };
```

---

## Implementation Order

| Step | Task | Effort | Risk |
|------|------|--------|------|
| 1 | Extract mock data to LotProvider | Low | Low |
| 2 | Connect LotProvider to database | Medium | Low |
| 3 | Persist cupping via interactions table | Low | Low |
| 4 | Fix visibility score calculation | Low | Low |
| 5 | Add context-aware shape variants | Low | Low |
| 6 | Implement expanded data panel (split) | Medium | Medium |
| 7 | Add reduced motion support | Low | Low |
| 8 | Add wobble animation (optional) | Low | Low |

---

## What We're NOT Doing (And Why)

### Not Adding New State Management
The app is simple enough for React Context. Redux, Zustand, or MobX would add
complexity without proportional benefit.

### Not Creating a New Animation System
React Native's Animated API is sufficient. Reanimated would add performance but
also complexity. Current animations are simple squish/translate.

### Not Building Full Split/Merge Animation
The spec's vision is beautiful but implementation cost is high. The expanded
panel achieves the same goal (inspect data points) with 1/10th the code.

### Not Adding SVG Package Yet
True triangles via SVG require a new dependency. Unicode triangles work for
alerts. When Global View needs network graphs, SVG becomes justified.

### Not Restructuring Data Models
The existing models (Lot, Stage, etc.) work. Visibility score can be fixed
with calculation logic, not schema changes.

---

## Success Criteria

After implementation:

1. **Data persists** - Lots and cupping sessions survive app restart
2. **Visibility scores match spec** - Producer documentation counts
3. **Shapes communicate semantics** - Verified=filled, unverified=outlined
4. **Users can inspect data** - Tap blob to see details
5. **Accessibility respected** - Reduced motion preference honored
6. **Code is maintainable** - No complex animation orchestration
7. **Lot-centric model honored** - Lot is the primary entity throughout

---

## Reflection: Pros and Cons

### Pros of This Plan

1. **Incremental** - Each step is independently valuable
2. **Uses existing code** - Database layer, existing models
3. **Low risk** - No architectural rewrites
4. **Pragmatic** - Achieves spec intent without literal interpretation
5. **Maintainable** - Simple patterns, few dependencies

### Cons of This Plan

1. **Not pixel-perfect to spec** - Triangles, split animation differ
2. **Defers some features** - Growth outline, full split/merge
3. **Compromises visual vision** - Expanded panel vs. floating blobs
4. **Animation fidelity** - Spring params may not match spec exactly

### Trade-off Justification

The spec was written with web (Framer Motion) in mind. React Native has different
capabilities and constraints. Literal interpretation would require:
- SVG package for shapes
- Reanimated for complex orchestration
- Gesture Handler for multi-touch
- Layout animation libraries for split/merge

Each adds complexity and maintenance burden. The pragmatic approach achieves
80% of the spec's intent with 20% of the implementation cost.

The lot-centric model - the philosophical core - is preserved. Users still
experience lots as living, responsive entities that reveal their data richness
through size, respond to touch, and guide exploration of the supply chain.
