/**
 * LotProvider
 *
 * React context for managing lot data throughout the app.
 * Provides a bridge between mock data (development) and database (production).
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  Lot,
  CuppingScores,
  CuppingSession,
  calculateGrowthUnits,
  calculateVisibilityScore,
  getStageDisplayData,
} from '../models/mark2Types';
import { MOCK_LOTS } from './mockData';

// =============================================================================
// Types
// =============================================================================

interface LotSummary {
  id: string;
  externalId: string;
  name: string;
  origin: string;
  growthUnits: number;
  visibilityScore: number;
  roastDate?: string;
}

interface TimelineLot {
  id: string;
  externalId: string;
  growthUnits: number;
  visibilityScore: number;
  stages: Array<{
    stage: Lot['supplyChain']['stages'][0]['type'];
    primaryValue: string;
    secondaryContext?: string;
    tertiaryDetail?: string;
    hasData: boolean;
    verified: boolean;
  }>;
}

interface LotContextValue {
  // State
  lots: Lot[];
  isLoading: boolean;
  error: string | null;

  // Derived data
  lotSummaries: LotSummary[];

  // Actions
  getLotById: (id: string) => Lot | null;
  getTimelineLot: (id: string) => TimelineLot | null;
  saveCuppingSession: (
    lotId: string,
    scores: CuppingScores,
    total: number
  ) => Promise<void>;
  refreshLots: () => Promise<void>;
}

// =============================================================================
// Context
// =============================================================================

const LotContext = createContext<LotContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface LotProviderProps {
  children: ReactNode;
  useMockData?: boolean;
}

export function LotProvider({
  children,
  useMockData = true,
}: LotProviderProps) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load lots on mount
  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (useMockData) {
        // Use mock data for development
        // Simulate async loading
        await new Promise(resolve => setTimeout(resolve, 100));
        setLots(MOCK_LOTS);
      } else {
        // TODO: Load from database
        // const dbLots = await getAllLots();
        // setLots(transformDbLotsToMark2(dbLots));
        setLots(MOCK_LOTS); // Fallback to mock for now
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lots');
    } finally {
      setIsLoading(false);
    }
  }, [useMockData]);

  // Transform lots to summaries for inventory view
  const lotSummaries = useMemo((): LotSummary[] => {
    return lots.map(lot => ({
      id: lot.id,
      externalId: lot.externalId,
      name: lot.origin.farm || lot.origin.producer,
      origin: `${lot.origin.region}, ${lot.origin.country}`,
      growthUnits: calculateGrowthUnits(lot),
      visibilityScore: calculateVisibilityScore(lot),
      roastDate: lot.supplyChain.stages.find(s => s.type === 'roasting')
        ?.timestamp,
    }));
  }, [lots]);

  // Get lot by ID
  const getLotById = useCallback(
    (id: string): Lot | null => {
      return lots.find(l => l.id === id) || null;
    },
    [lots]
  );

  // Transform lot to timeline format
  const getTimelineLot = useCallback(
    (id: string): TimelineLot | null => {
      const lot = lots.find(l => l.id === id);
      if (!lot) return null;

      const growthUnits = calculateGrowthUnits(lot);
      const visibilityScore = calculateVisibilityScore(lot);

      const stages = lot.supplyChain.stages.map(stage => ({
        stage: stage.type,
        ...getStageDisplayData(stage),
        hasData: true,
        verified: stage.verified,
      }));

      return {
        id: lot.id,
        externalId: lot.externalId,
        growthUnits,
        visibilityScore,
        stages,
      };
    },
    [lots]
  );

  // Save cupping session
  const saveCuppingSession = useCallback(
    async (lotId: string, scores: CuppingScores, total: number) => {
      const session: CuppingSession = {
        sessionId: `cupping-${Date.now()}`,
        lotId,
        userId: 'current-user', // TODO: Get from auth
        timestamp: new Date().toISOString(),
        scores,
        totalScore: total,
        defects: { taint: 0, fault: 0 },
        isPublic: false,
      };

      // Update the lot with the new cupping session
      setLots(prevLots =>
        prevLots.map(lot => {
          if (lot.id !== lotId) return lot;
          return {
            ...lot,
            qualityEvents: [
              ...lot.qualityEvents,
              {
                type: 'cupping' as const,
                cuppingSession: session,
              },
            ],
          };
        })
      );

      if (!useMockData) {
        // TODO: Save to database via createInteraction
        // await createInteraction({
        //   lotId,
        //   type: 'cupping',
        //   data: JSON.stringify(session),
        //   createdAt: session.timestamp,
        // });
      }

      console.log('Cupping session saved:', session);
    },
    [useMockData]
  );

  // Refresh lots from data source
  const refreshLots = useCallback(async () => {
    await loadLots();
  }, [loadLots]);

  // Context value
  const value = useMemo(
    (): LotContextValue => ({
      lots,
      isLoading,
      error,
      lotSummaries,
      getLotById,
      getTimelineLot,
      saveCuppingSession,
      refreshLots,
    }),
    [
      lots,
      isLoading,
      error,
      lotSummaries,
      getLotById,
      getTimelineLot,
      saveCuppingSession,
      refreshLots,
    ]
  );

  return <LotContext.Provider value={value}>{children}</LotContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

export function useLots(): LotContextValue {
  const context = useContext(LotContext);
  if (!context) {
    throw new Error('useLots must be used within a LotProvider');
  }
  return context;
}

export default LotProvider;
