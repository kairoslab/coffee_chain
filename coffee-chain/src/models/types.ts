// Core entity types for CoffeeChain

// ============================================================
// ENUMS
// ============================================================

export type ActorRole = 
  | 'producer' 
  | 'processor' 
  | 'exporter' 
  | 'importer' 
  | 'roaster' 
  | 'retailer' 
  | 'consumer';

export type LotState = 
  | 'harvested' 
  | 'processed' 
  | 'exported' 
  | 'imported' 
  | 'roasted' 
  | 'retailed' 
  | 'consumed';

export type ProcessingMethod = 
  | 'washed' 
  | 'natural' 
  | 'honey' 
  | 'anaerobic' 
  | 'carbonic' 
  | 'experimental';

export type VerificationStatus = 
  | 'self_reported' 
  | 'confirmed' 
  | 'documented' 
  | 'unverified';

export type FreshnessLevel = 
  | 'peak'      // 0-14 days post-roast
  | 'good'      // 14-30 days
  | 'declining' // 30-60 days
  | 'stale';    // 60+ days

// ============================================================
// CORE ENTITIES
// ============================================================

/**
 * Actor: A participant in the coffee supply chain
 */
export interface Actor {
  id: string;
  name: string;
  role: ActorRole;
  location: {
    country: string;
    region?: string;
    coordinates?: { lat: number; lng: number };
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  certifications?: string[]; // e.g., "Organic", "Fair Trade", "Rainforest Alliance"
  createdAt: string;
  updatedAt: string;
}

/**
 * Lot: A traceable batch of coffee
 * This is the central entity - everything connects to a Lot
 */
export interface Lot {
  id: string;
  
  // Identity
  name: string;              // e.g., "El Paraíso Gesha Lot 42"
  lotCode?: string;          // Producer's lot identifier
  
  // Botanical info
  variety: string;           // e.g., "Gesha", "Bourbon", "Caturra"
  species?: string;          // e.g., "Arabica", "Robusta"
  
  // Origin
  origin: {
    country: string;
    region: string;
    farm?: string;
    altitude?: number;       // meters above sea level
    coordinates?: { lat: number; lng: number };
  };
  
  // Harvest & Processing
  harvestDate?: string;
  processingMethod: ProcessingMethod;
  
  // Current state
  currentState: LotState;
  currentLocation?: string;
  currentHolderId?: string;  // Actor ID of current custodian
  
  // Roast info (populated when state >= 'roasted')
  roastDate?: string;
  roastLevel?: 'light' | 'medium' | 'dark';
  
  // Quantity tracking
  initialQuantity?: {
    amount: number;
    unit: 'kg' | 'lb' | 'bags';
  };
  
  // Media
  photos?: string[];         // URIs to photos
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Handoff: Transfer of custody between actors
 * Creates the chain-of-custody timeline
 */
export interface Handoff {
  id: string;
  lotId: string;
  
  // Who
  fromActorId: string;
  toActorId: string;
  
  // When & Where
  date: string;
  location?: string;
  
  // State transition
  previousState: LotState;
  newState: LotState;
  
  // Price transparency
  price?: {
    amount: number;
    currency: string;
    unit: 'kg' | 'lb' | 'bag';
    priceType: 'FOB' | 'CIF' | 'farmgate' | 'wholesale' | 'retail';
  };
  
  // Verification
  verification: VerificationStatus;
  documents?: string[];      // URIs to invoices, contracts, etc.
  notes?: string;
  
  // Metadata
  createdAt: string;
}

/**
 * Interaction: User engagement with a lot
 * Brewing notes, cupping scores, roast profiles, etc.
 */
export interface Interaction {
  id: string;
  lotId: string;
  actorId: string;
  
  type: 'cupping' | 'brew' | 'roast_profile' | 'cultivation_note' | 'review';
  
  // Content depends on type
  data: CuppingData | BrewData | RoastProfileData | CultivationData | ReviewData;
  
  // Media
  photos?: string[];
  
  // Metadata
  createdAt: string;
}

// ============================================================
// INTERACTION DATA TYPES
// ============================================================

export interface CuppingData {
  score?: number;            // 0-100 SCA scale
  aroma?: number;
  flavor?: number;
  aftertaste?: number;
  acidity?: number;
  body?: number;
  balance?: number;
  sweetness?: number;
  cleanCup?: number;
  uniformity?: number;
  descriptors?: string[];    // e.g., ["jasmine", "bergamot", "stone fruit"]
  notes?: string;
}

export interface BrewData {
  method: 'pourover' | 'espresso' | 'french_press' | 'aeropress' | 'cold_brew' | 'other';
  dose?: number;             // grams
  yield?: number;            // grams or ml
  waterTemp?: number;        // celsius
  brewTime?: number;         // seconds
  grindSize?: string;        // e.g., "medium-fine"
  notes?: string;
  rating?: number;           // 1-5
}

export interface RoastProfileData {
  roastDate: string;
  roastLevel: 'light' | 'medium' | 'dark';
  firstCrack?: number;       // seconds
  dropTemp?: number;         // celsius
  developmentTime?: number;  // seconds after first crack
  totalTime?: number;        // seconds
  notes?: string;
}

export interface CultivationData {
  season: string;
  practices?: string[];      // e.g., ["shade-grown", "hand-picked"]
  fertilizers?: string[];
  yieldPerHectare?: number;
  notes?: string;
}

export interface ReviewData {
  rating: number;            // 1-5
  title?: string;
  body: string;
  wouldBuyAgain?: boolean;
}

// ============================================================
// COMPUTED / DERIVED TYPES
// ============================================================

/**
 * Full lot with all related data for display
 */
export interface LotWithChain extends Lot {
  handoffs: Handoff[];
  interactions: Interaction[];
  actors: Record<string, Actor>;  // Map of actor IDs to actors
  freshness?: FreshnessLevel;
  daysSinceRoast?: number;
  priceBreakdown?: PriceNode[];
}

/**
 * Price distribution across the chain
 */
export interface PriceNode {
  actorId: string;
  actorRole: ActorRole;
  actorName: string;
  priceIn?: number;          // What they paid
  priceOut?: number;         // What they sold for
  margin?: number;           // Difference
  marginPercent?: number;    // Of final retail price
  currency: string;
}

/**
 * Timeline entry for chain-of-custody display
 */
export interface TimelineEntry {
  id: string;
  date: string;
  state: LotState;
  actor: Actor;
  location?: string;
  price?: Handoff['price'];
  verification: VerificationStatus;
  notes?: string;
  isCurrentState: boolean;
}
