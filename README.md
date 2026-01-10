# CoffeeChain ☕⛓️

A mobile app for coffee supply chain transparency. Track coffee lots from farm to cup, understand price distribution, and connect with every actor in the chain.

## Core Concepts

### Lot-Centric Model
Unlike apps that track "varieties" (botanical categories), CoffeeChain tracks **Lots** — specific batches from a specific farm, harvested at a specific time, processed a specific way. This enables true traceability.

### Lifecycle States
Every lot progresses through a defined lifecycle:
```
Harvested → Processed → Exported → Imported → Roasted → Retailed → Consumed
```

### Chain of Custody
Each handoff between actors is recorded with:
- Date and location
- Price (optional but encouraged for transparency)
- Verification status
- Supporting documents

### Actors
Users identify by their role in the supply chain:
- 🌱 **Producer** — Grows and harvests coffee
- 🏭 **Processor** — Processes cherry to green
- 📦 **Exporter** — Exports green coffee
- 🚢 **Importer** — Imports to destination country
- 🔥 **Roaster** — Roasts green to brown
- 🛒 **Retailer** — Sells to consumers
- ☕ **Consumer** — Enjoys the final cup

## Features

### For All Users
- **Collection**: Track lots you own or are interested in
- **Timeline View**: Visual chain-of-custody for any lot
- **Freshness Indicator**: Know how fresh your roasted coffee is
- **Search**: Find lots by origin, variety, or name

### For Industry Professionals
- **Price Transparency**: See value distribution across the chain
- **Handoff Recording**: Document transfers between actors
- **Verification**: Confirm data reported by others
- **Interactions**: Add cupping notes, roast profiles, brew recipes

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based)
- **Database**: SQLite (expo-sqlite) — local-first, migrateable to Supabase
- **Language**: TypeScript

## Project Structure

```
coffee-chain/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with tabs
│   ├── index.tsx          # Collection (home)
│   ├── explore.tsx        # Search/discover lots
│   ├── add.tsx            # Add new lot form
│   ├── profile.tsx        # User profile & role
│   └── lot/
│       └── [id].tsx       # Lot detail with timeline
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Timeline.tsx
│   │   ├── FreshnessIndicator.tsx
│   │   ├── PriceBreakdown.tsx
│   │   └── LotCard.tsx
│   ├── database/          # SQLite schema & operations
│   │   ├── schema.ts
│   │   ├── operations.ts
│   │   └── seed.ts
│   ├── models/            # TypeScript types
│   │   └── types.ts
│   └── utils/             # Formatting & helpers
│       └── formatting.ts
├── app.json               # Expo config
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app on your phone (for testing)

### Installation

```bash
# Clone or copy the project
cd coffee-chain

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Testing

1. **On Phone**: Scan the QR code with Expo Go (Android) or Camera app (iOS)
2. **Web Preview**: Press `w` to open in browser
3. **Simulator**: Press `i` for iOS simulator or `a` for Android emulator (requires setup)

### Loading Demo Data

The app includes seed data for demonstration. To load it:

1. Open the app
2. Navigate to the Profile tab
3. (In a future version) Tap "Load Demo Data"

Or modify `app/_layout.tsx` to call `seedDemoData()` on first launch.

## Data Model

### Core Entities

| Entity | Description |
|--------|-------------|
| **Lot** | A traceable batch of coffee |
| **Actor** | A participant in the supply chain |
| **Handoff** | Transfer of custody between actors |
| **Interaction** | Cupping note, brew recipe, roast profile |

### Verification Levels

| Status | Icon | Meaning |
|--------|------|---------|
| Self-reported | 🔵 | Actor entered their own data |
| Confirmed | ✅ | Verified by next actor in chain |
| Documented | 📄 | Supporting documents attached |
| Unverified | ❓ | No verification |

## Roadmap

### Phase 1 (Current) ✅
- [x] Core data model
- [x] Collection management
- [x] Timeline visualization
- [x] Basic forms

### Phase 2
- [ ] Camera integration for bag scanning
- [ ] QR code generation for lots
- [ ] Cloud sync (Supabase)
- [ ] User authentication

### Phase 3
- [ ] Social features (follow actors, share lots)
- [ ] Market data integration (C-price, futures)
- [ ] Computer vision for label reading
- [ ] Multi-language support

## Design Principles

1. **Lot-centric**: Everything connects to a traceable batch
2. **Trust through verification**: Multiple verification levels
3. **Progressive disclosure**: Simple for consumers, detailed for pros
4. **Offline-first**: Works without internet, syncs when available
5. **Transparency by default**: Encourage price sharing

## Contributing

This is an open project for coffee transparency. Contributions welcome!

## License

MIT

---

Built with ☕ and curiosity about where it comes from.
