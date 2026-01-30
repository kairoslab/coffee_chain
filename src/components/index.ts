/**
 * Component exports
 *
 * Mark2 LocoRoco-inspired components
 */

// Core blob component
export { Blob } from './Blob';

// Stage view for timeline navigation
export { StageView } from './StageView';

// Re-export StageType from canonical source
export type { StageType } from '../models/mark2Types';

// Legacy components (maintained for compatibility)
export { Timeline } from './Timeline';
export { FreshnessIndicator } from './FreshnessIndicator';
export { PriceBreakdown } from './PriceBreakdown';
export { LotCard } from './LotCard';
