'use client';

import { formatSui, formatAddress } from '@/lib/constants';
import { GameState, GameConfig } from '@/hooks/useGameState';

interface GameStatsProps {
  gameState: GameState | null;
  gameConfig: GameConfig | null;
}

export function GameStats({ gameState, gameConfig }: GameStatsProps) {
  if (!gameState) {
    return <div className="animate-pulse h-48 bg-forest-800/50 rounded-xl" />;
  }

  const estimatedPrize = gameConfig
    ? (gameState.prizePool * BigInt(5000)) / BigInt(10000)
    : BigInt(0);

  return (
    <div className="space-y-4">
      {/* Prize Pool */}
      <div className="bg-forest-800/50 rounded-2xl p-6 gold-glow">
        <div className="text-gold-400 font-medium mb-1">Prize Pool</div>
        <div className="text-4xl font-bold text-gold-300 text-glow-gold">
          {formatSui(gameState.prizePool)}
        </div>
        <div className="text-sm text-gold-500 mt-2">
          Winner gets: ~{formatSui(estimatedPrize)}
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
