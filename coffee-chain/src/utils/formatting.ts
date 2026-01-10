// Utility functions for CoffeeChain

import type { LotState, FreshnessLevel, VerificationStatus, ActorRole } from '../models/types';

// ============================================================
// STATE DISPLAY
// ============================================================

export const STATE_LABELS: Record<LotState, string> = {
  harvested: 'Harvested',
  processed: 'Processed',
  exported: 'Exported',
  imported: 'Imported',
  roasted: 'Roasted',
  retailed: 'Retailed',
  consumed: 'Consumed',
};

export const STATE_ORDER: LotState[] = [
  'harvested',
  'processed',
  'exported',
  'imported',
  'roasted',
  'retailed',
  'consumed',
];

export function getStateIndex(state: LotState): number {
  return STATE_ORDER.indexOf(state);
}

// ============================================================
// FRESHNESS
// ============================================================

export const FRESHNESS_CONFIG: Record<FreshnessLevel, { label: string; color: string; emoji: string }> = {
  peak: { label: 'Peak Freshness', color: '#22c55e', emoji: '🟢' },
  good: { label: 'Good', color: '#84cc16', emoji: '🟡' },
  declining: { label: 'Declining', color: '#f97316', emoji: '🟠' },
  stale: { label: 'Stale', color: '#ef4444', emoji: '🔴' },
};

export function getFreshnessDisplay(freshness?: FreshnessLevel, daysSinceRoast?: number): string {
  if (!freshness || daysSinceRoast === undefined) return '';
  const config = FRESHNESS_CONFIG[freshness];
  return `${config.emoji} ${config.label} (${daysSinceRoast}d)`;
}

// ============================================================
// VERIFICATION
// ============================================================

export const VERIFICATION_CONFIG: Record<VerificationStatus, { label: string; icon: string; color: string }> = {
  self_reported: { label: 'Self-reported', icon: '🔵', color: '#3b82f6' },
  confirmed: { label: 'Confirmed', icon: '✅', color: '#22c55e' },
  documented: { label: 'Documented', icon: '📄', color: '#8b5cf6' },
  unverified: { label: 'Unverified', icon: '❓', color: '#9ca3af' },
};

// ============================================================
// ACTOR ROLES
// ============================================================

export const ROLE_LABELS: Record<ActorRole, string> = {
  producer: 'Producer',
  processor: 'Processor',
  exporter: 'Exporter',
  importer: 'Importer',
  roaster: 'Roaster',
  retailer: 'Retailer',
  consumer: 'Consumer',
};

export const ROLE_ICONS: Record<ActorRole, string> = {
  producer: '🌱',
  processor: '🏭',
  exporter: '📦',
  importer: '🚢',
  roaster: '🔥',
  retailer: '🛒',
  consumer: '☕',
};

// ============================================================
// FORMATTING
// ============================================================

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatPrice(amount: number, currency: string, unit?: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
  
  return unit ? `${formatted}/${unit}` : formatted;
}

export function formatAltitude(meters: number): string {
  return `${meters.toLocaleString()} masl`;
}

// ============================================================
// PROCESSING METHODS
// ============================================================

export const PROCESSING_LABELS: Record<string, string> = {
  washed: 'Washed',
  natural: 'Natural',
  honey: 'Honey',
  anaerobic: 'Anaerobic',
  carbonic: 'Carbonic Maceration',
  experimental: 'Experimental',
};
