'use client';

import { useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { CONTRACT_CONFIG } from '@/lib/constants';
import { DEV_MODE, getMockGameState } from '@/lib/devMode';

export interface GameState {
  phase: number;
  phaseProgress: number;
  prizePool: bigint;
  round: number;
  uniquePlayers: number;
  totalWaterings: number;
  growthProgress: number;
  maturityThreshold: number;
  top1Address: string;
  top1Amount: bigint;
  top2Address: string;
  top2Amount: bigint;
  top3Address: string;
  top3Amount: bigint;
  isComplete: boolean;
  winner: string;
  winnerContribution: bigint;
  totalContributions: bigint;
}

export interface GameConfig {
  waterCost: bigint;
  isPaused: boolean;
}

export function useGameState() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['gameState', CONTRACT_CONFIG.TREE_GAME_ID, DEV_MODE],
    queryFn: async (): Promise<GameState | null> => {
      // DEV MODE: Return mock state
      if (DEV_MODE) {
        const mockState = getMockGameState();
        return {
          phase: mockState.phase,
          phaseProgress: mockState.phaseProgress,
          prizePool: mockState.prizePool,
          round: mockState.round,
          uniquePlayers: mockState.uniquePlayers,
          totalWaterings: mockState.totalWaterings,
          growthProgress: mockState.phase * 25 + Math.floor(mockState.phaseProgress / 4),
          maturityThreshold: 100,
          top1Address: mockState.top1Address,
          top1Amount: mockState.top1Amount,
          top2Address: mockState.top2Address,
          top2Amount: mockState.top2Amount,
          top3Address: mockState.top3Address,
          top3Amount: mockState.top3Amount,
          isComplete: mockState.isComplete,
          winner: mockState.winner,
          winnerContribution: mockState.winnerContribution,
          totalContributions: mockState.totalContributions,
        };
      }

      // REAL MODE: Fetch from blockchain
      if (!CONTRACT_CONFIG.TREE_GAME_ID) return null;

      try {
        const result = await client.getObject({
          id: CONTRACT_CONFIG.TREE_GAME_ID,
          options: { showContent: true },
        });

        if (result.data?.content?.dataType !== 'moveObject') return null;

        const fields = (result.data.content as any).fields;
        const growthProgress = parseInt(fields.growth_progress || '0');
        const maturityThreshold = 100;
        const progressBps = (growthProgress * 10000) / maturityThreshold;

        let phase = 1, phaseProgress = 0;
        if (progressBps < 3000) {
          phase = 1;
          phaseProgress = Math.floor((progressBps * 100) / 3000);
        } else if (progressBps < 6000) {
          phase = 2;
          phaseProgress = Math.floor(((progressBps - 3000) * 100) / 3000);
        } else if (progressBps < 8000) {
          phase = 3;
          phaseProgress = Math.floor(((progressBps - 6000) * 100) / 2000);
        } else {
          phase = 4;
          phaseProgress = 0;
        }

        return {
          phase,
          phaseProgress,
          prizePool: BigInt(fields.prize_pool || '0'),
          round: parseInt(fields.round || '1'),
          uniquePlayers: parseInt(fields.unique_players || '0'),
          totalWaterings: parseInt(fields.total_waterings || '0'),
          growthProgress,
          maturityThreshold,
          top1Address: fields.top1_address || '0x0',
          top1Amount: BigInt(fields.top1_amount || '0'),
          top2Address: fields.top2_address || '0x0',
          top2Amount: BigInt(fields.top2_amount || '0'),
          top3Address: fields.top3_address || '0x0',
          top3Amount: BigInt(fields.top3_amount || '0'),
          isComplete: fields.is_complete || false,
          winner: fields.winner || '',
          winnerContribution: BigInt(fields.winner_contribution || '0'),
          totalContributions: BigInt(fields.total_contributions || '0'),
        };
      } catch (error) {
        console.error('Failed to fetch game state:', error);
        return null;
      }
    },
    refetchInterval: DEV_MODE ? 500 : 3000, // Faster refresh in dev mode
    enabled: DEV_MODE || !!CONTRACT_CONFIG.TREE_GAME_ID,
  });
}

export function useGameConfig() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['gameConfig', CONTRACT_CONFIG.GAME_CONFIG_ID, DEV_MODE],
    queryFn: async (): Promise<GameConfig | null> => {
      // DEV MODE: Return mock config
      if (DEV_MODE) {
        return {
          waterCost: BigInt(50000000), // 0.05 SUI
          isPaused: false,
        };
      }

      // REAL MODE: Fetch from blockchain
      if (!CONTRACT_CONFIG.GAME_CONFIG_ID) return null;

      try {
        const result = await client.getObject({
          id: CONTRACT_CONFIG.GAME_CONFIG_ID,
          options: { showContent: true },
        });

        if (result.data?.content?.dataType !== 'moveObject') return null;
        const fields = (result.data.content as any).fields;

        return {
          waterCost: BigInt(fields.water_cost || '50000000'),
          isPaused: fields.is_paused || false,
        };
      } catch (error) {
        console.error('Failed to fetch game config:', error);
        return null;
      }
    },
    refetchInterval: DEV_MODE ? 1000 : 30000,
    enabled: DEV_MODE || !!CONTRACT_CONFIG.GAME_CONFIG_ID,
  });
}
