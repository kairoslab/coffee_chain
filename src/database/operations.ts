// Database operations for CoffeeChain entities

import { getDatabase, generateId, toJSON, fromJSON } from './schema';
import type {
  Actor,
  Lot,
  Handoff,
  Interaction,
  LotWithChain,
  TimelineEntry,
  LotState,
  FreshnessLevel,
  PriceNode,
} from '../models/types';

// ============================================================
// ACTOR OPERATIONS
// ============================================================

export async function createActor(actor: Omit<Actor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Actor> {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  await db.runAsync(
    `INSERT INTO actors (id, name, role, country, region, lat, lng, email, phone, website, certifications, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      actor.name,
      actor.role,
      actor.location.country,
      actor.location.region || null,
      actor.location.coordinates?.lat || null,
      actor.location.coordinates?.lng || null,
      actor.contactInfo?.email || null,
      actor.contactInfo?.phone || null,
      actor.contactInfo?.website || null,
      actor.certifications ? toJSON(actor.certifications) : null,
      now,
      now,
    ]
  );
  
  return { ...actor, id, createdAt: now, updatedAt: now } as Actor;
}

export async function getActor(id: string): Promise<Actor | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM actors WHERE id = ?', [id]);
  if (!row) return null;
  return rowToActor(row);
}

export async function getAllActors(): Promise<Actor[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM actors ORDER BY name');
  return rows.map(rowToActor);
}

export async function getActorsByRole(role: Actor['role']): Promise<Actor[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM actors WHERE role = ? ORDER BY name', [role]);
  return rows.map(rowToActor);
}

function rowToActor(row: any): Actor {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    location: {
      country: row.country,
      region: row.region || undefined,
      coordinates: row.lat && row.lng ? { lat: row.lat, lng: row.lng } : undefined,
    },
    contactInfo: {
      email: row.email || undefined,
      phone: row.phone || undefined,
      website: row.website || undefined,
    },
    certifications: fromJSON(row.certifications) || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================
// LOT OPERATIONS
// ============================================================

export async function createLot(lot: Omit<Lot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lot> {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  await db.runAsync(
    `INSERT INTO lots (
      id, name, lot_code, variety, species, country, region, farm, altitude,
      origin_lat, origin_lng, harvest_date, processing_method, current_state,
      current_location, current_holder_id, roast_date, roast_level,
      initial_quantity_amount, initial_quantity_unit, photos, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      lot.name,
      lot.lotCode || null,
      lot.variety,
      lot.species || 'Arabica',
      lot.origin.country,
      lot.origin.region,
      lot.origin.farm || null,
      lot.origin.altitude || null,
      lot.origin.coordinates?.lat || null,
      lot.origin.coordinates?.lng || null,
      lot.harvestDate || null,
      lot.processingMethod,
      lot.currentState,
      lot.currentLocation || null,
      lot.currentHolderId || null,
      lot.roastDate || null,
      lot.roastLevel || null,
      lot.initialQuantity?.amount || null,
      lot.initialQuantity?.unit || null,
      lot.photos ? toJSON(lot.photos) : null,
      now,
      now,
    ]
  );
  
  return { ...lot, id, createdAt: now, updatedAt: now } as Lot;
}

export async function getLot(id: string): Promise<Lot | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM lots WHERE id = ?', [id]);
  if (!row) return null;
  return rowToLot(row);
}

export async function getAllLots(): Promise<Lot[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM lots ORDER BY updated_at DESC');
  return rows.map(rowToLot);
}

export async function updateLotState(
  lotId: string,
  newState: LotState,
  updates?: Partial<Pick<Lot, 'currentLocation' | 'currentHolderId' | 'roastDate' | 'roastLevel'>>
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  let sql = 'UPDATE lots SET current_state = ?, updated_at = ?';
  const params: any[] = [newState, now];
  
  if (updates?.currentLocation !== undefined) {
    sql += ', current_location = ?';
    params.push(updates.currentLocation);
  }
  if (updates?.currentHolderId !== undefined) {
    sql += ', current_holder_id = ?';
    params.push(updates.currentHolderId);
  }
  if (updates?.roastDate !== undefined) {
    sql += ', roast_date = ?';
    params.push(updates.roastDate);
  }
  if (updates?.roastLevel !== undefined) {
    sql += ', roast_level = ?';
    params.push(updates.roastLevel);
  }
  
  sql += ' WHERE id = ?';
  params.push(lotId);
  
  await db.runAsync(sql, params);
}

function rowToLot(row: any): Lot {
  return {
    id: row.id,
    name: row.name,
    lotCode: row.lot_code || undefined,
    variety: row.variety,
    species: row.species || undefined,
    origin: {
      country: row.country,
      region: row.region,
      farm: row.farm || undefined,
      altitude: row.altitude || undefined,
      coordinates: row.origin_lat && row.origin_lng 
        ? { lat: row.origin_lat, lng: row.origin_lng } 
        : undefined,
    },
    harvestDate: row.harvest_date || undefined,
    processingMethod: row.processing_method,
    currentState: row.current_state,
    currentLocation: row.current_location || undefined,
    currentHolderId: row.current_holder_id || undefined,
    roastDate: row.roast_date || undefined,
    roastLevel: row.roast_level || undefined,
    initialQuantity: row.initial_quantity_amount
      ? { amount: row.initial_quantity_amount, unit: row.initial_quantity_unit }
      : undefined,
    photos: fromJSON(row.photos) || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================
// HANDOFF OPERATIONS
// ============================================================

export async function createHandoff(handoff: Omit<Handoff, 'id' | 'createdAt'>): Promise<Handoff> {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  await db.runAsync(
    `INSERT INTO handoffs (
      id, lot_id, from_actor_id, to_actor_id, date, location,
      previous_state, new_state, price_amount, price_currency, price_unit, price_type,
      verification, documents, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      handoff.lotId,
      handoff.fromActorId,
      handoff.toActorId,
      handoff.date,
      handoff.location || null,
      handoff.previousState,
      handoff.newState,
      handoff.price?.amount || null,
      handoff.price?.currency || null,
      handoff.price?.unit || null,
      handoff.price?.priceType || null,
      handoff.verification,
      handoff.documents ? toJSON(handoff.documents) : null,
      handoff.notes || null,
      now,
    ]
  );
  
  // Update lot state
  await updateLotState(handoff.lotId, handoff.newState, {
    currentHolderId: handoff.toActorId,
    currentLocation: handoff.location,
  });
  
  return { ...handoff, id, createdAt: now };
}

export async function getHandoffsForLot(lotId: string): Promise<Handoff[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM handoffs WHERE lot_id = ? ORDER BY date ASC',
    [lotId]
  );
  return rows.map(rowToHandoff);
}

function rowToHandoff(row: any): Handoff {
  return {
    id: row.id,
    lotId: row.lot_id,
    fromActorId: row.from_actor_id,
    toActorId: row.to_actor_id,
    date: row.date,
    location: row.location || undefined,
    previousState: row.previous_state,
    newState: row.new_state,
    price: row.price_amount
      ? {
          amount: row.price_amount,
          currency: row.price_currency,
          unit: row.price_unit,
          priceType: row.price_type,
        }
      : undefined,
    verification: row.verification,
    documents: fromJSON(row.documents) || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

// ============================================================
// INTERACTION OPERATIONS
// ============================================================

export async function createInteraction(
  interaction: Omit<Interaction, 'id' | 'createdAt'>
): Promise<Interaction> {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  await db.runAsync(
    `INSERT INTO interactions (id, lot_id, actor_id, type, data, photos, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      interaction.lotId,
      interaction.actorId,
      interaction.type,
      toJSON(interaction.data),
      interaction.photos ? toJSON(interaction.photos) : null,
      now,
    ]
  );
  
  return { ...interaction, id, createdAt: now };
}

export async function getInteractionsForLot(lotId: string): Promise<Interaction[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM interactions WHERE lot_id = ? ORDER BY created_at DESC',
    [lotId]
  );
  return rows.map(rowToInteraction);
}

function rowToInteraction(row: any): Interaction {
  return {
    id: row.id,
    lotId: row.lot_id,
    actorId: row.actor_id,
    type: row.type,
    data: fromJSON(row.data) || {},
    photos: fromJSON(row.photos) || undefined,
    createdAt: row.created_at,
  };
}

// ============================================================
// COLLECTION OPERATIONS
// ============================================================

export async function addToCollection(
  lotId: string,
  details?: {
    quantityRemaining?: number;
    quantityUnit?: 'g' | 'kg' | 'lb' | 'oz';
    purchasePrice?: number;
    purchaseCurrency?: string;
    notes?: string;
  }
): Promise<void> {
  const db = getDatabase();
  const id = generateId();
  
  await db.runAsync(
    `INSERT OR REPLACE INTO collection (id, lot_id, quantity_remaining, quantity_unit, purchase_price, purchase_currency, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      lotId,
      details?.quantityRemaining || null,
      details?.quantityUnit || null,
      details?.purchasePrice || null,
      details?.purchaseCurrency || null,
      details?.notes || null,
    ]
  );
}

export async function getCollection(): Promise<Lot[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT lots.* FROM lots
     INNER JOIN collection ON lots.id = collection.lot_id
     ORDER BY collection.added_at DESC`
  );
  return rows.map(rowToLot);
}

// ============================================================
// COMPOSITE OPERATIONS
// ============================================================

/**
 * Get a lot with its full chain of custody and interactions
 */
export async function getLotWithChain(lotId: string): Promise<LotWithChain | null> {
  const lot = await getLot(lotId);
  if (!lot) return null;
  
  const handoffs = await getHandoffsForLot(lotId);
  const interactions = await getInteractionsForLot(lotId);
  
  // Gather all actor IDs
  const actorIds = new Set<string>();
  if (lot.currentHolderId) actorIds.add(lot.currentHolderId);
  handoffs.forEach(h => {
    actorIds.add(h.fromActorId);
    actorIds.add(h.toActorId);
  });
  interactions.forEach(i => actorIds.add(i.actorId));
  
  // Fetch all actors
  const actors: Record<string, Actor> = {};
  for (const id of actorIds) {
    const actor = await getActor(id);
    if (actor) actors[id] = actor;
  }
  
  // Calculate freshness
  const freshness = calculateFreshness(lot.roastDate);
  const daysSinceRoast = lot.roastDate 
    ? Math.floor((Date.now() - new Date(lot.roastDate).getTime()) / (1000 * 60 * 60 * 24))
    : undefined;
  
  // Calculate price breakdown
  const priceBreakdown = calculatePriceBreakdown(handoffs, actors);
  
  return {
    ...lot,
    handoffs,
    interactions,
    actors,
    freshness,
    daysSinceRoast,
    priceBreakdown,
  };
}

/**
 * Build timeline entries for chain-of-custody display
 */
export async function getTimelineForLot(lotId: string): Promise<TimelineEntry[]> {
  const lotWithChain = await getLotWithChain(lotId);
  if (!lotWithChain) return [];
  
  const timeline: TimelineEntry[] = [];
  
  // Add harvest as first entry
  const firstHandoff = lotWithChain.handoffs[0];
  if (firstHandoff) {
    const producer = lotWithChain.actors[firstHandoff.fromActorId];
    if (producer) {
      timeline.push({
        id: `harvest-${lotWithChain.id}`,
        date: lotWithChain.harvestDate || firstHandoff.date,
        state: 'harvested',
        actor: producer,
        location: `${lotWithChain.origin.farm || ''}, ${lotWithChain.origin.region}, ${lotWithChain.origin.country}`.replace(/^, /, ''),
        verification: 'self_reported',
        isCurrentState: lotWithChain.currentState === 'harvested',
      });
    }
  }
  
  // Add each handoff
  for (const handoff of lotWithChain.handoffs) {
    const actor = lotWithChain.actors[handoff.toActorId];
    if (actor) {
      timeline.push({
        id: handoff.id,
        date: handoff.date,
        state: handoff.newState,
        actor,
        location: handoff.location,
        price: handoff.price,
        verification: handoff.verification,
        notes: handoff.notes,
        isCurrentState: lotWithChain.currentState === handoff.newState,
      });
    }
  }
  
  return timeline;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function calculateFreshness(roastDate?: string): FreshnessLevel | undefined {
  if (!roastDate) return undefined;
  
  const days = Math.floor((Date.now() - new Date(roastDate).getTime()) / (1000 * 60 * 60 * 24));
  
  if (days <= 14) return 'peak';
  if (days <= 30) return 'good';
  if (days <= 60) return 'declining';
  return 'stale';
}

function calculatePriceBreakdown(handoffs: Handoff[], actors: Record<string, Actor>): PriceNode[] {
  const nodes: PriceNode[] = [];
  
  // Find the final retail price for percentage calculations
  const retailHandoff = handoffs.find(h => h.newState === 'retailed');
  const finalPrice = retailHandoff?.price?.amount;
  
  for (let i = 0; i < handoffs.length; i++) {
    const handoff = handoffs[i];
    const actor = actors[handoff.toActorId];
    if (!actor || !handoff.price) continue;
    
    const priceIn = i > 0 ? handoffs[i - 1].price?.amount : undefined;
    const priceOut = handoff.price.amount;
    const margin = priceIn !== undefined ? priceOut - priceIn : undefined;
    const marginPercent = finalPrice && margin !== undefined ? (margin / finalPrice) * 100 : undefined;
    
    nodes.push({
      actorId: actor.id,
      actorRole: actor.role,
      actorName: actor.name,
      priceIn,
      priceOut,
      margin,
      marginPercent,
      currency: handoff.price.currency,
    });
  }
  
  return nodes;
}
