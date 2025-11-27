'use client';

import { formatSui, formatAddress } from '@/lib/constants';
import { GameState, GameConfig } from '@/hooks/useGameState';

interface GameStatsProps {
  gameState: GameState | null;
  gameConfig: GameConfig | null;
}

export function GameStats({ gameState, gameConfig }: GameStatsProps) {
  if (!gameState) {
    return <div className="animate-pulse h-48 bg-gray-200 rounded-xl" />;
  }

  const estimatedPrize = gameConfig 
    ? (gameState.prizePool * BigInt(5000)) / BigInt(10000)
    : BigInt(0);

  return (
    <div className="space-y-4">
      {/* Prize Pool */}
      <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 shadow-lg">
        <div className="text-yellow-700 font-medium mb-1">ðŸ’° Prize Pool</div>
        <div className="text-3xl font-bold text-yellow-800">
          {formatSui(gameState.prizePool)}
        </div>
        <div className="text-sm text-yellow-600 mt-1">
          Winner gets: ~{formatSui(estimatedPrize)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-gray-500 text-sm">ðŸ† Round</div>
          <div className="text-2xl font-bold">#{gameState.round}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-gray-500 text-sm">ðŸ‘¥ Players</div>
          <div className="text-2xl font-bold">{gameState.uniquePlayers}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow col-span-2">
          <div className="text-gray-500 text-sm">ðŸ’§ Total Waterings</div>
          <div className="text-2xl font-bold">{gameState.totalWaterings}</div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-lg mb-4">ðŸ… Top Contributors</h3>
        <div className="space-y-2">
          {[
            { place: 'ðŸ¥‡', addr: gameState.top1Address, amt: gameState.top1Amount },
            { place: 'ðŸ¥ˆ', addr: gameState.top2Address, amt: gameState.top2Amount },
            { place: 'ðŸ¥‰', addr: gameState.top3Address, amt: gameState.top3Amount },
          ].map(({ place, addr, amt }) => (
            <div key={place} className="flex justify-between items-center py-2 border-b last:border-0">
              <span>{place} {formatAddress(addr)}</span>
              <span className="font-medium">{formatSui(amt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
