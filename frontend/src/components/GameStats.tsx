'use client';

import { formatSui, formatAddress } from '@/lib/constants';
import { GameState, GameConfig } from '@/hooks/useGameState';
import { motion } from 'framer-motion';

interface GameStatsProps {
  gameState: GameState | null;
  gameConfig: GameConfig | null;
}

// Prize distribution percentages
const PRIZE_DISTRIBUTION = [
  { label: 'Final Waterer', percent: 40, icon: '🏆', color: 'text-gold-400' },
  { label: 'Top Contributor', percent: 15, icon: '👑', color: 'text-orange-400' },
  { label: 'Random Player', percent: 5, icon: '🎲', color: 'text-purple-400' },
  { label: 'Next Round', percent: 20, icon: '🌱', color: 'text-blue-400' },
  { label: 'Treasury', percent: 10, icon: '🏦', color: 'text-green-400' },
  { label: 'Dev & Ads', percent: 10, icon: '📢', color: 'text-cyan-400' },
];

export function GameStats({ gameState, gameConfig }: GameStatsProps) {
  if (!gameState) {
    return <div className="animate-pulse h-48 bg-forest-800/50 rounded-xl" />;
  }

  const pool = gameState.prizePool;

  return (
    <div className="space-y-4">
      {/* Prize Pool */}
      <div className="bg-forest-800/50 rounded-2xl p-6 gold-glow">
        <div className="text-gold-400 font-medium mb-1">Prize Pool</div>
        <div className="text-4xl font-bold text-gold-300 text-glow-gold">
          {formatSui(pool)}
        </div>

        {/* Prize Distribution Breakdown */}
        <div className="mt-4 space-y-2">
          <div className="text-xs text-forest-400 mb-2">Prize Distribution:</div>
          {PRIZE_DISTRIBUTION.slice(0, 4).map((item) => (
            <div key={item.label} className="flex justify-between items-center text-sm">
              <span className={`${item.color} flex items-center gap-1`}>
                <span>{item.icon}</span> {item.label}
              </span>
              <span className="text-forest-300">
                {item.percent}% (~{formatSui((pool * BigInt(item.percent)) / BigInt(100))})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50 card-glow">
          <div className="text-forest-400 text-sm">Round</div>
          <div className="text-2xl font-bold text-forest-200">#{gameState.round}</div>
        </div>
        <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50 card-glow">
          <div className="text-forest-400 text-sm">Players</div>
          <div className="text-2xl font-bold text-forest-200">{gameState.uniquePlayers}</div>
        </div>
        <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50 card-glow col-span-2">
          <div className="text-forest-400 text-sm">Total Waterings</div>
          <div className="text-2xl font-bold text-forest-200">{gameState.totalWaterings}</div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow">
        <h3 className="font-bold text-lg mb-4 text-forest-300">Top Contributors</h3>
        <div className="space-y-2">
          {[
            { place: '1st', addr: gameState.top1Address, amt: gameState.top1Amount, color: 'text-gold-400' },
            { place: '2nd', addr: gameState.top2Address, amt: gameState.top2Amount, color: 'text-gray-300' },
            { place: '3rd', addr: gameState.top3Address, amt: gameState.top3Amount, color: 'text-orange-400' },
          ].map(({ place, addr, amt, color }) => (
            <div key={place} className="flex justify-between items-center py-2 border-b border-forest-600/30 last:border-0">
              <span className={`${color} font-medium`}>{place}</span>
              <span className="text-forest-300">{formatAddress(addr)}</span>
              <span className="font-medium text-forest-200">{formatSui(amt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
