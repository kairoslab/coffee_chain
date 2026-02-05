/**
 * CoffeeChain Mark2 Data Models
 *
 * Type definitions matching the LocoRoco-inspired implementation spec.
 * Includes visibility score calculation and growth metrics.
 */

// =============================================================================
// STAGE TYPES
// =============================================================================

export type StageType =
  | 'harvest'
  | 'processing'
  | 'drying'
  | 'milling'
  | 'export'
  | 'shipping'
  | 'import'
  | 'warehousing'
  | 'roasting'
  | 'retail';

export type ParticipantType =
  | 'producer'
  | 'processor'
  | 'exporter'
  | 'shipper'
  | 'importer'
  | 'warehouse'
  | 'roaster'
  | 'retailer';

// =============================================================================
// LOT MODEL
// =============================================================================

export interface Lot {
  id: string; // UUID
  externalId: string; // User-facing ID, e.g., "ETH-YRG-2024-0847"

  origin: {
    country: string;
    region: string;
    subregion?: string;
    farm?: string;
    producer: string;
    coordinates?: { lat: number; lng: number };
    altitude?: { min: number; max: number; unit: 'masl' };
  };

  coffee: {
    varietal: string[];
    processing: string;
    dryingMethod?: string;
    harvestStart: string; // ISO date
    harvestEnd: string; // ISO date
  };

  quality: {
    officialScore?: number;
    flavorNotes: string[];
    certifications: string[];
  };

  supplyChain: {
    stages: Stage[];
  };

  visibility: {
    score: number; // 0-100
    lastUpdated: string; // ISO datetime
    contributors: string[]; // participant IDs
  };

  metadata: {
    createdAt: string; // ISO datetime
    updatedAt: string; // ISO datetime
    createdBy: string; // user ID
  };

  // Quality events including cupping sessions
  qualityEvents: Array<{
    type: 'cupping';
    cuppingSession: CuppingSession;
  }>;
}

// =============================================================================
// STAGE MODEL
// =============================================================================

export interface Stage {
  id: string;
  type: StageType;
  participant: {
    id: string;
    name: string;
    type: ParticipantType;
  };
  timestamp: string; // ISO datetime
  location?: { lat: number; lng: number };
  data: Record<string, unknown>; // Stage-specific data
  documents: string[]; // URLs to attached files
  verified: boolean;
  verifiedBy?: string;
}

// =============================================================================
// CUPPING SESSION MODEL
// =============================================================================

export interface CuppingSession {
  sessionId: string;
  lotId: string;
  userId: string;
  timestamp: string; // ISO datetime
  roastProfile?: {
    roastDate: string;
    roastLevel: string;
    roasterNotes?: string;
  };
  scores: CuppingScores;
  totalScore: number; // 0-100
  defects: {
    taint: number;
    fault: number;
  };
  notes?: string;
  isPublic: boolean;
}

export interface CuppingScores {
  fragrance: number; // 0-10
  flavor: number;
  aftertaste: number;
  acidity: number;
  body: number;
  balance: number;
  uniformity: number;
  cleanCup: number;
  sweetness: number;
  overall: number;
}

// =============================================================================
// USER MODEL
// =============================================================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  organizationType: 'roaster' | 'importer' | 'producer' | 'other';
  organizationName?: string;
  connections: string[]; // user IDs
  inventory: string[]; // lot IDs
  settings: {
    defaultProtocol: string;
    notifications: boolean;
    reducedMotion: boolean;
  };
  createdAt: string; // ISO datetime
}

// =============================================================================
// GROWTH UNITS CALCULATION
// =============================================================================

/**
 * Data categories contributing to growth (1 unit each, max 20)
 * Lot size scales based on data richness.
 */
export const GROWTH_CATEGORIES = [
  'farmProducerIdentification',
  'geographicCoordinates',
  'altitudeDocumentation',
  'varietalSpecification',
  'harvestDateRange',
  'processingMethod',
  'dryingMethod',
  'moistureContentReading',
  'exportDocumentation',
  'shippingLogisticsData',
  'importDocumentation',
  'warehouseStorageData',
  'sampleRoastData',
  'officialCuppingScore',
  'userCuppingScore',
  'roastProfileData',
  'retailDistributionData',
  'endConsumerFeedback',
  'certifications',
  'mediaPhotos',
] as const;

export type GrowthCategory = typeof GROWTH_CATEGORIES[number];

/**
 * Calculate growth units from a lot's data completeness
 */
export function calculateGrowthUnits(lot: Lot): number {
  let units = 0;

  // Check each category
  if (lot.origin.producer) units++; // farmProducerIdentification
  if (lot.origin.coordinates) units++; // geographicCoordinates
  if (lot.origin.altitude) units++; // altitudeDocumentation
  if (lot.coffee.varietal.length > 0) units++; // varietalSpecification
  if (lot.coffee.harvestStart && lot.coffee.harvestEnd) units++; // harvestDateRange
  if (lot.coffee.processing) units++; // processingMethod
  if (lot.coffee.dryingMethod) units++; // dryingMethod

  // Check stages for specific data
  const stageTypes = new Set(lot.supplyChain.stages.map(s => s.type));
  if (stageTypes.has('export')) units++; // exportDocumentation
  if (stageTypes.has('shipping')) units++; // shippingLogisticsData
  if (stageTypes.has('import')) units++; // importDocumentation
  if (stageTypes.has('warehousing')) units++; // warehouseStorageData
  if (stageTypes.has('roasting')) units++; // sampleRoastData / roastProfileData

  // Quality data
  if (lot.quality.officialScore) units++; // officialCuppingScore
  if (lot.quality.certifications.length > 0) units++; // certifications

  // Cap at 20
  return Math.min(units, 20);
}

// =============================================================================
// VISIBILITY SCORE CALCULATION
// =============================================================================

/**
 * Base score points per documented stage (max 60)
 * Per spec Section 5.2, Farm/Producer documentation is valued at 8 points
 */
const STAGE_POINTS: Record<StageType, number> = {
  harvest: 6,
  processing: 8,
  drying: 6,
  milling: 4,
  export: 8,
  shipping: 6,
  import: 6,
  warehousing: 4,
  roasting: 4,
  retail: 4, // Reduced from 8 to balance with producer documentation
};

/**
 * Producer documentation score (separate from stages)
 * Spec values Farm/Producer identification at 8 points
 */
const PRODUCER_DOCUMENTATION_POINTS = 8;

/**
 * Verification type bonus points (max 20)
 */
interface VerificationBonus {
  certificationBody: boolean; // 5 points
  labAnalysis: boolean; // 5 points
  multipleParticipantConfirmation: boolean; // 5 points
  photographicEvidence: boolean; // 3 points
  gpsTimestampData: boolean; // 2 points
}

/**
 * Calculate visibility score for a lot
 */
export function calculateVisibilityScore(
  lot: Lot,
  verifications?: Partial<VerificationBonus>
): number {
  // BASE SCORE (max 60)
  let baseScore = 0;

  // Producer documentation (spec Section 5.2: Farm/Producer = 8 points)
  // Philosophical alignment: spec treats producer documentation as valuable
  if (lot.origin.producer && lot.origin.producer.trim() !== '') {
    baseScore += PRODUCER_DOCUMENTATION_POINTS;
  }

  // Stage points
  for (const stage of lot.supplyChain.stages) {
    baseScore += STAGE_POINTS[stage.type] || 0;
  }
  baseScore = Math.min(baseScore, 60);

  // VERIFICATION BONUS (max 20)
  let verificationBonus = 0;
  if (verifications) {
    if (verifications.certificationBody) verificationBonus += 5;
    if (verifications.labAnalysis) verificationBonus += 5;
    if (verifications.multipleParticipantConfirmation) verificationBonus += 5;
    if (verifications.photographicEvidence) verificationBonus += 3;
    if (verifications.gpsTimestampData) verificationBonus += 2;
  }
  // Also check for verified stages
  const verifiedStages = lot.supplyChain.stages.filter(s => s.verified).length;
  if (verifiedStages >= 3) verificationBonus += 5;
  verificationBonus = Math.min(verificationBonus, 20);

  // RECENCY BONUS (max 10)
  let recencyBonus = 0;
  const lastUpdated = new Date(lot.visibility.lastUpdated);
  const daysSinceUpdate = Math.floor(
    (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceUpdate <= 30) recencyBonus = 10;
  else if (daysSinceUpdate <= 90) recencyBonus = 7;
  else if (daysSinceUpdate <= 180) recencyBonus = 4;
  else if (daysSinceUpdate <= 365) recencyBonus = 2;

  // PARTICIPANT DIVERSITY BONUS (max 10)
  let diversityBonus = 0;
  const participants = lot.visibility.contributors.length;
  if (participants >= 5) diversityBonus = 10;
  else if (participants === 4) diversityBonus = 8;
  else if (participants === 3) diversityBonus = 6;
  else if (participants === 2) diversityBonus = 4;
  else if (participants === 1) diversityBonus = 2;

  // FINAL CALCULATION
  const total = baseScore + verificationBonus + recencyBonus + diversityBonus;
  return Math.max(0, Math.min(100, total));
}

// =============================================================================
// VISIBILITY LEVEL LABELS
// =============================================================================

export type VisibilityLevel = 'opaque' | 'partial' | 'transparent' | 'fullyVisible';

export function getVisibilityLevel(score: number): VisibilityLevel {
  if (score >= 76) return 'fullyVisible';
  if (score >= 51) return 'transparent';
  if (score >= 26) return 'partial';
  return 'opaque';
}

export const VISIBILITY_LABELS: Record<VisibilityLevel, string> = {
  opaque: 'Opaque',
  partial: 'Partial',
  transparent: 'Transparent',
  fullyVisible: 'Fully Visible',
};

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

export const STAGE_LABELS: Record<StageType, string> = {
  harvest: 'Harvest',
  processing: 'Processing',
  drying: 'Drying',
  milling: 'Milling',
  export: 'Export',
  shipping: 'Shipping',
  import: 'Import',
  warehousing: 'Warehousing',
  roasting: 'Roasting',
  retail: 'Retail',
};

export const STAGE_ORDER: StageType[] = [
  'harvest',
  'processing',
  'drying',
  'milling',
  'export',
  'shipping',
  'import',
  'warehousing',
  'roasting',
  'retail',
];

/**
 * Get display data for a stage
 */
export function getStageDisplayData(
  stage: Stage
): { primaryValue: string; secondaryContext?: string; tertiaryDetail?: string } {
  const data = stage.data as Record<string, string>;

  switch (stage.type) {
    case 'harvest':
      return {
        primaryValue: data.harvestDate || 'Harvested',
        secondaryContext: stage.participant.name,
        tertiaryDetail: data.method || undefined,
      };
    case 'processing':
      return {
        primaryValue: data.method || 'Processed',
        secondaryContext: stage.participant.name,
        tertiaryDetail: data.duration || undefined,
      };
    case 'drying':
      return {
        primaryValue: data.method || 'Dried',
        secondaryContext: stage.participant.name,
        tertiaryDetail: data.duration || undefined,
      };
    case 'milling':
      return {
        primaryValue: 'Milled',
        secondaryContext: stage.participant.name,
        tertiaryDetail: data.screenSize || undefined,
      };
    case 'export':
      return {
        primaryValue: 'Exported',
        secondaryContext: stage.participant.name,
        tertiaryDetail: data.destination || undefined,
      };
    case 'shipping':
      return {
        primaryValue: data.vessel || 'In Transit',
        secondaryContext: data.route || stage.participant.name,
        tertiaryDetail: data.duration || undefined,
      };
    case 'import':
      return {
        primaryValue: 'Imported',
        secondaryContext: stage.participant.name,
        tertiaryDetail: data.port || undefined,
      };
    case 'warehousing':
      return {
        primaryValue: 'Stored',
        secondaryContext: stage.participant.name,
        tertiaryDetail: data.conditions || undefined,
      };
    case 'roasting':
      return {
        primaryValue: data.roastLevel || 'Roasted',
        secondaryContext: stage.participant.name,
        tertiaryDetail: data.roastDate || undefined,
      };
    case 'retail':
      return {
        primaryValue: 'Available',
        secondaryContext: stage.participant.name,
        tertiaryDetail: data.price || undefined,
      };
    default:
      return {
        primaryValue: stage.type,
        secondaryContext: stage.participant.name,
      };
  }
}
