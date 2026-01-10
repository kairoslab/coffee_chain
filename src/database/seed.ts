// Seed data for demonstration purposes

import { createActor, createLot, createHandoff, createInteraction, addToCollection } from './operations';
import type { Actor, Lot, ProcessingMethod } from '../models/types';

export async function seedDemoData(): Promise<void> {
  console.log('Seeding demo data...');

  // ============================================================
  // CREATE ACTORS
  // ============================================================

  const producer = await createActor({
    name: 'Juan Pérez',
    role: 'producer',
    location: {
      country: 'Colombia',
      region: 'Cauca',
      coordinates: { lat: 2.4833, lng: -76.6167 },
    },
    certifications: ['Organic', 'Rainforest Alliance'],
  });

  const processor = await createActor({
    name: 'Finca El Paraíso',
    role: 'processor',
    location: {
      country: 'Colombia',
      region: 'Cauca',
    },
  });

  const exporter = await createActor({
    name: 'Nordic Approach',
    role: 'exporter',
    location: {
      country: 'Norway',
      region: 'Oslo',
    },
    contactInfo: {
      website: 'https://nordicapproach.no',
    },
  });

  const importer = await createActor({
    name: 'Onyx Coffee Lab Imports',
    role: 'importer',
    location: {
      country: 'United States',
      region: 'Arkansas',
    },
  });

  const roaster = await createActor({
    name: 'Onyx Coffee Lab',
    role: 'roaster',
    location: {
      country: 'United States',
      region: 'Arkansas',
    },
    contactInfo: {
      website: 'https://onyxcoffeelab.com',
    },
    certifications: ['B Corp'],
  });

  const retailer = await createActor({
    name: 'Local Coffee Shop',
    role: 'retailer',
    location: {
      country: 'United States',
      region: 'California',
    },
  });

  const consumer = await createActor({
    name: 'You',
    role: 'consumer',
    location: {
      country: 'United States',
      region: 'California',
    },
  });

  // ============================================================
  // CREATE LOT 1: El Paraíso Gesha
  // ============================================================

  const lot1 = await createLot({
    name: 'El Paraíso Gesha Lot 42',
    lotCode: 'EP-2024-042',
    variety: 'Gesha',
    species: 'Arabica',
    origin: {
      country: 'Colombia',
      region: 'Cauca',
      farm: 'Finca El Paraíso',
      altitude: 1950,
      coordinates: { lat: 2.4833, lng: -76.6167 },
    },
    harvestDate: '2024-11-15',
    processingMethod: 'anaerobic',
    currentState: 'retailed',
    currentLocation: 'California, USA',
    currentHolderId: retailer.id,
    roastDate: '2025-01-03',
    roastLevel: 'light',
    initialQuantity: { amount: 150, unit: 'kg' },
  });

  // Create handoffs for lot 1
  await createHandoff({
    lotId: lot1.id,
    fromActorId: producer.id,
    toActorId: processor.id,
    date: '2024-11-20',
    location: 'Cauca, Colombia',
    previousState: 'harvested',
    newState: 'processed',
    verification: 'self_reported',
    notes: 'Double anaerobic fermentation, 120 hours',
  });

  await createHandoff({
    lotId: lot1.id,
    fromActorId: processor.id,
    toActorId: exporter.id,
    date: '2024-12-05',
    location: 'Bogotá, Colombia',
    previousState: 'processed',
    newState: 'exported',
    price: { amount: 45.00, currency: 'USD', unit: 'kg', priceType: 'FOB' },
    verification: 'documented',
    notes: 'Contract #NA-2024-1842',
  });

  await createHandoff({
    lotId: lot1.id,
    fromActorId: exporter.id,
    toActorId: importer.id,
    date: '2024-12-20',
    location: 'Rogers, Arkansas',
    previousState: 'exported',
    newState: 'imported',
    price: { amount: 52.00, currency: 'USD', unit: 'kg', priceType: 'CIF' },
    verification: 'documented',
  });

  await createHandoff({
    lotId: lot1.id,
    fromActorId: importer.id,
    toActorId: roaster.id,
    date: '2025-01-02',
    location: 'Rogers, Arkansas',
    previousState: 'imported',
    newState: 'roasted',
    verification: 'confirmed',
  });

  await createHandoff({
    lotId: lot1.id,
    fromActorId: roaster.id,
    toActorId: retailer.id,
    date: '2025-01-05',
    location: 'San Francisco, California',
    previousState: 'roasted',
    newState: 'retailed',
    price: { amount: 88.00, currency: 'USD', unit: 'kg', priceType: 'wholesale' },
    verification: 'confirmed',
  });

  // Add interactions
  await createInteraction({
    lotId: lot1.id,
    actorId: roaster.id,
    type: 'roast_profile',
    data: {
      roastDate: '2025-01-03',
      roastLevel: 'light',
      firstCrack: 540,
      dropTemp: 204,
      developmentTime: 75,
      totalTime: 615,
      notes: 'Developed for filter brewing, preserving floral notes',
    },
  });

  await createInteraction({
    lotId: lot1.id,
    actorId: roaster.id,
    type: 'cupping',
    data: {
      score: 92,
      aroma: 9,
      flavor: 9.5,
      aftertaste: 9,
      acidity: 9,
      body: 8.5,
      balance: 9,
      descriptors: ['jasmine', 'bergamot', 'tropical fruit', 'honey'],
      notes: 'Exceptional clarity with complex floral aromatics',
    },
  });

  // Add to collection
  await addToCollection(lot1.id, {
    quantityRemaining: 250,
    quantityUnit: 'g',
    purchasePrice: 32,
    purchaseCurrency: 'USD',
  });

  // ============================================================
  // CREATE LOT 2: Ethiopian Yirgacheffe
  // ============================================================

  const ethiopianProducer = await createActor({
    name: 'Aricha Washing Station',
    role: 'producer',
    location: {
      country: 'Ethiopia',
      region: 'Yirgacheffe',
    },
  });

  const lot2 = await createLot({
    name: 'Aricha Natural Lot 7',
    lotCode: 'ARI-2024-007',
    variety: 'Heirloom',
    species: 'Arabica',
    origin: {
      country: 'Ethiopia',
      region: 'Yirgacheffe, Gedeo',
      farm: 'Aricha Washing Station',
      altitude: 2100,
    },
    harvestDate: '2024-10-20',
    processingMethod: 'natural',
    currentState: 'roasted',
    roastDate: '2024-12-28',
    roastLevel: 'light',
    currentHolderId: roaster.id,
  });

  await createHandoff({
    lotId: lot2.id,
    fromActorId: ethiopianProducer.id,
    toActorId: exporter.id,
    date: '2024-11-15',
    previousState: 'harvested',
    newState: 'exported',
    price: { amount: 8.50, currency: 'USD', unit: 'kg', priceType: 'FOB' },
    verification: 'self_reported',
  });

  await createHandoff({
    lotId: lot2.id,
    fromActorId: exporter.id,
    toActorId: roaster.id,
    date: '2024-12-20',
    previousState: 'exported',
    newState: 'roasted',
    price: { amount: 14.00, currency: 'USD', unit: 'kg', priceType: 'CIF' },
    verification: 'documented',
  });

  await addToCollection(lot2.id, {
    quantityRemaining: 180,
    quantityUnit: 'g',
    purchasePrice: 18,
    purchaseCurrency: 'USD',
  });

  // ============================================================
  // CREATE LOT 3: Kenyan AA
  // ============================================================

  const kenyanProducer = await createActor({
    name: 'Nyeri Hill Estate',
    role: 'producer',
    location: {
      country: 'Kenya',
      region: 'Nyeri',
    },
  });

  const lot3 = await createLot({
    name: 'Nyeri Hill AA',
    lotCode: 'NH-2024-AA',
    variety: 'SL28',
    species: 'Arabica',
    origin: {
      country: 'Kenya',
      region: 'Nyeri',
      farm: 'Nyeri Hill Estate',
      altitude: 1750,
    },
    harvestDate: '2024-09-10',
    processingMethod: 'washed',
    currentState: 'imported',
    currentHolderId: importer.id,
  });

  await createHandoff({
    lotId: lot3.id,
    fromActorId: kenyanProducer.id,
    toActorId: exporter.id,
    date: '2024-10-01',
    previousState: 'harvested',
    newState: 'exported',
    price: { amount: 6.20, currency: 'USD', unit: 'kg', priceType: 'FOB' },
    verification: 'documented',
  });

  await createHandoff({
    lotId: lot3.id,
    fromActorId: exporter.id,
    toActorId: importer.id,
    date: '2024-11-15',
    previousState: 'exported',
    newState: 'imported',
    price: { amount: 9.80, currency: 'USD', unit: 'kg', priceType: 'CIF' },
    verification: 'documented',
  });

  await addToCollection(lot3.id);

  console.log('Demo data seeded successfully!');
}
