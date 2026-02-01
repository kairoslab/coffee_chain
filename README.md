# CoffeeChain

A mobile app for coffee supply chain transparency featuring a playful, tactile interface inspired by LocoRoco. Track coffee lots from farm to cup through intuitive swipe-based navigation.

## Design Philosophy

CoffeeChain follows the "mark2" specification: **serious data presented through joyful, tactile interaction**.

### Core Principles

1. **Lot-Centric Model**: The lot is the universe. Unlike apps that track botanical varieties, CoffeeChain tracks specific batches from specific farms, harvested at specific times.

2. **One Feature Per Screen**: Each view shows a single piece of information prominently. Navigate by swiping, not scrolling through crowded interfaces.

3. **Grayscale Aesthetic**: Black, white, and grays only. No color distractions - clarity through simplicity.

4. **Physicality Through Animation**: Blobs squish on touch, bounce on navigation. The interface feels alive and responsive.

5. **Transparency as Growth**: More documented data = larger blob. Visual feedback for supply chain completeness.

## Visual Language

### The Blob

The core visual element - a soft, responsive shape representing a coffee lot.

- **Size**: Reflects data richness (0-20 growth units)
- **Shape**: Circle (default), Square (cupping/structured data), Triangle (alerts)
- **Fill**: Filled (verified data) or Outlined (unverified/pending)
- **Opacity**: Visibility score affects visual prominence (0-100)

### Navigation

- **Swipe Left**: Next stage / Enter cupping
- **Swipe Right**: Previous stage / Return to inventory
- **Swipe Up**: Open inventory
- **Swipe Down**: Global network view
- **Tap Blob**: Expand data details

## Screens

### Inventory (Default)
Grid of tracked lots, each represented by a blob. Tap to enter timeline.

### Lot Timeline (Primary)
Horizontal swipe through supply chain stages:
```
Harvest -> Processing -> Drying -> Milling -> Export -> Shipping -> Import -> Warehousing -> Roasting -> Retail
```

### Cupping Suite
SCA-style scoring interface accessed by swiping left past the final stage. Ten attributes, one per screen, with tap-to-increment scoring.

### Global View (Placeholder)
Network visualization showing lot relationships and supply chain connections.

## Project Structure

```
coffee-chain/
├── app/                          # Expo Router entry points
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Main screen with providers
├── src/
│   ├── components/              # UI components
│   │   ├── Blob.tsx            # Core blob element
│   │   ├── StageView.tsx       # Stage display
│   │   └── DataPanel.tsx       # Expandable data details
│   ├── contexts/                # React contexts
│   │   └── AccessibilityContext.tsx  # Reduced motion support
│   ├── data/                    # Data layer
│   │   ├── LotProvider.tsx     # Lot state management
│   │   └── mockData.ts         # Demo data
│   ├── database/                # SQLite persistence
│   │   ├── schema.ts
│   │   └── operations.ts
│   ├── hooks/                   # Custom hooks
│   │   └── useSwipeNavigation.ts
│   ├── models/                  # TypeScript types
│   │   └── mark2Types.ts       # Core data models
│   ├── navigation/              # Navigation logic
│   │   └── AppNavigator.tsx
│   ├── screens/                 # Screen components
│   │   ├── InventoryScreen.tsx
│   │   ├── LotTimelineScreen.tsx
│   │   └── CuppingScreen.tsx
│   └── theme/                   # Design tokens
│       └── index.ts
├── SPEC_ANALYSIS.md             # Spec vs implementation analysis
├── REMEDIATION_PLAN.md          # Technical roadmap
└── coffee-chain-mark2           # Design specification
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Expo Go app on your mobile device (for testing on device)

### Installation

```bash
# Navigate to project directory
cd coffee-chain

# Install dependencies
npm install
```

### Running the App

```bash
# Start Expo development server
npx expo start
```

Then:
- **On Phone**: Scan QR code with Expo Go (Android) or Camera (iOS)
- **Web**: Press `w` to open in browser
- **iOS Simulator**: Press `i` (requires Xcode)
- **Android Emulator**: Press `a` (requires Android Studio)

### Demo Experience

The app loads with three sample lots demonstrating different stages of the supply chain:

1. **Ethiopia Yirgacheffe** - High visibility, multiple verified stages
2. **Colombia Huila** - Medium visibility, recent cupping data
3. **Kenya Nyeri** - Lower visibility, fewer documented stages

Try:
- Tapping a lot in Inventory to enter its timeline
- Swiping left/right to navigate stages
- Tapping the blob to see detailed data
- Swiping left past the final stage to enter Cupping

## Accessibility

CoffeeChain respects system accessibility settings:

- **Reduced Motion**: Animations are disabled when system preference is set
- **High Contrast**: Grayscale design provides inherent contrast
- **Screen Reader**: Semantic labels on interactive elements

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native with Expo |
| Navigation | Expo Router + Custom swipe |
| State | React Context |
| Database | SQLite (expo-sqlite) |
| Animations | React Native Animated |
| Language | TypeScript |

## Data Model

### Core Types

| Type | Description |
|------|-------------|
| **Lot** | A traceable batch of coffee with origin, processing, and supply chain data |
| **Stage** | A step in the supply chain with participant, timestamp, and verification |
| **CuppingSession** | SCA-style quality scoring with 10 attributes |

### Visibility Score

Lots earn visibility points through documented data:

| Component | Max Points |
|-----------|------------|
| Base (stages + producer) | 60 |
| Verification bonus | 20 |
| Recency bonus | 10 |
| Participant diversity | 10 |
| **Total** | **100** |

### Growth Units

Blob size scales with data completeness (0-20 units):
- Producer identification
- Geographic coordinates
- Altitude documentation
- Varietal specification
- Processing details
- Export/import documentation
- Quality scores
- And more...

## Development Status

### Implemented
- Core blob component with squish animations
- Swipe navigation (all 4 directions)
- Lot timeline view
- Inventory grid
- Cupping suite with SCA scoring
- Data panel for stage details
- Reduced motion support
- Mock data layer

### Planned
- Database persistence
- Split/merge blob animation
- Growth outline visualization
- Triangle shape via SVG
- Settings screen with motion toggle

## Contributing

This is an open project for coffee transparency. Contributions are welcome.

## License

MIT

---

*Serious data. Joyful interaction. Coffee transparency.*
