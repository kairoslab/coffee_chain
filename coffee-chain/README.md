# CoffeeChain ☕

**Transparency from farm to cup.**

A mobile application for tracking coffee lots through the entire supply chain — enabling producers, traders, roasters, and consumers to document and verify the journey of specialty coffee.

---

## Core Concepts

### Lot-Centric Model

CoffeeChain tracks **lots** (specific batches) rather than abstract varieties:

| Entity | Description |
|--------|-------------|
| **Lot** | A traceable batch: farm + harvest + process + quantity |
| **Actor** | A participant with a supply chain role |
| **Handoff** | Transfer of custody with date, location, price |
| **Interaction** | User engagement: cupping notes, brew recipes, roast profiles |

### Lifecycle States

```
Harvested → Processed → Exported → Imported → Roasted → Retailed → Consumed
```

### Freshness Tracking

- 🟢 **Peak**: 0-14 days post-roast
- 🟡 **Good**: 14-30 days
- 🟠 **Declining**: 30-60 days
- 🔴 **Stale**: 60+ days

### Price Transparency

See value distribution: farmgate → FOB → CIF → wholesale → retail

---

## Tech Stack

- **React Native + Expo** (cross-platform)
- **Expo Router** (file-based navigation)
- **SQLite** (local-first database)
- **TypeScript**

---

## Project Structure

```
coffee-chain/
├── app/                    # Screens (Expo Router)
│   ├── _layout.tsx         # Tab navigation
│   ├── index.tsx           # Collection
│   ├── explore.tsx         # Search
│   ├── add.tsx             # Add lot form
│   ├── profile.tsx         # User profile
│   └── lot/[id].tsx        # Lot detail
├── src/
│   ├── components/         # UI components
│   ├── database/           # SQLite schema & operations
│   ├── models/             # TypeScript types
│   └── utils/              # Formatting helpers
├── package.json
└── app.json
```

---

## Getting Started

```bash
cd coffee-chain
npm install
npx expo start
```

Scan QR with Expo Go, or press `w` for web preview.

---

## Future Enhancements

- QR/barcode scanning for retail packages
- Photo capture and attachment
- Live market data (C-price)
- Cloud sync and sharing
- Cryptographic verification

---

MIT License | Built with ☕ and transparency
