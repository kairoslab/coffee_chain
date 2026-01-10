// Seed data for demonstration purposes

import { initDatabase } from './schema';
import { createActor, createLot, createHandoff, addToCollection } from './operations';

export async function seedDatabase(): Promise<void> {
  await initDatabase();
  
  console.log('Seeding database with sample data...');

  // ACTORS
  const producer1 = await createActor({
    name: 'Juan Pérez',
    role: 'producer',
    location: { country: 'Colombia', region: 'Cauca' },
    certifications: ['Organic', 'Rainforest Alliance'],
  });

  const producer2 = await createActor({
    name: 'Negasa Boru',
    role: 'producer',
    location: { country: 'Ethiopia', region: 'Yirgacheffe' },
  });

  const exporter1 = await createActor({
    name: 'Nordic Approach',
    role: 'exporter',
    location: { country: 'Norway', region: 'Oslo' },
  });

  const importer1 = await createActor({
    name: 'Cafe Imports',
    role: 'importer',
    location: { country: 'USA', region: 'Minneapolis, MN' },
  });

  const roaster1 = await createActor({
    name: 'Onyx Coffee Lab',
    role: 'roaster',
    location: { country: 'USA', region: 'Springdale, AR' },
  });

  // LOT 1: Colombian Gesha (Full chain, recently roasted)
  const lot1 = await createLot({
    name: 'El Paraíso Gesha Lot 42',
    lotCode: 'EP-G42-2024',
    variety: 'Gesha',
    processingMethod: 'anaerobic',
    currentState: 'roasted',
    origin: {
      country: 'Colombia',
      region: 'Cauca',
      farm: 'Finca El Paraíso',
      altitude: 1850,
    },
    harvestDate: '2024-11-15',
    roastDate: '2025-01-03',
    roastLevel: 'light',
    currentHolderId: roaster1.id,
  });

  await createHandoff({
    lotId: lot1.id,
    fromActorId: producer1.id,
    toActorId: exporter1.id,
    date: '2024-12-01',
    location: 'Popayán, Colombia',
    previousState: 'harvested',
    newState: 'exported',
    price: { amount: 8.50, currency: 'USD', unit: 'lb', priceType: 'FOB' },
    verification: 'documented',
  });

  await createHandoff({
    lotId: lot1.id,
    fromActorId: exporter1.id,
    toActorId: importer1.id,
    date: '2024-12-15',
    previousState: 'exported',
    newState: 'imported',
    price: { amount: 12.20, currency: 'USD', unit: 'lb', priceType: 'CIF' },
    verification: 'confirmed',
  });

  await createHandoff({
    lotId: lot1.id,
    fromActorId: importer1.id,
    toActorId: roaster1.id,
    date: '2024-12-28',
    previousState: 'imported',
    newState: 'roasted',
    price: { amount: 14.00, currency: 'USD', unit: 'lb', priceType: 'wholesale' },
    verification: 'confirmed',
  });

  await addToCollection(lot1.id, { quantityRemaining: 250, quantityUnit: 'g' });

  // LOT 2: Ethiopian Natural
  const lot2 = await createLot({
    name: 'Worka Sakaro Natural',
    variety: 'Heirloom',
    processingMethod: 'natural',
    currentState: 'imported',
    origin: {
      country: 'Ethiopia',
      region: 'Yirgacheffe',
      farm: 'Worka Sakaro',
      altitude: 2100,
    },
    harvestDate: '2024-10-20',
    currentHolderId: importer1.id,
  });

  await addToCollection(lot2.id);

  console.log('Database seeded with 2 sample lots.');
}
