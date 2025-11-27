# Grow Tree SUI - Complete Project Setup Script
# Run this from C:\Users\bob\grow-tree-sui in PowerShell
# Usage: .\setup.ps1

Write-Host "🌳 Setting up Grow Tree SUI..." -ForegroundColor Green

# Create directory structure
$dirs = @(
    "contracts\sources",
    "scripts",
    "frontend\src\app",
    "frontend\src\components",
    "frontend\src\hooks",
    "frontend\src\lib",
    "frontend\src\styles",
    "frontend\public"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created $dir" -ForegroundColor Gray
    }
}

# ============== SMART CONTRACT ==============

Write-Host "`n📄 Creating smart contract..." -ForegroundColor Cyan

# contracts/Move.toml
@"
[package]
name = "tree_game"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
tree_game = "0x0"
"@ | Out-File -FilePath "contracts\Move.toml" -Encoding UTF8

# contracts/sources/tree_game.move
@"
/// Tree Watering Prize Pool Game
module tree_game::tree_game {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::table::{Self, Table};

    // Error Codes
    const EGamePaused: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const ETreeAlreadyMature: u64 = 2;
    const EInvalidConfig: u64 = 4;
    const EGameNotPaused: u64 = 5;

    const BASIS_POINTS: u64 = 10000;
    const FINAL_STRETCH_THRESHOLD: u64 = 8000; // 80%

    public struct AdminCap has key, store { id: UID }

    public struct GameConfig has key, store {
        id: UID,
        water_cost: u64,
        growth_per_water: u64,
        maturity_threshold: u64,
        winner_share_bps: u64,
        treasury_share_bps: u64,
        treasury: address,
        is_paused: bool
    }

    public struct TreeGame has key {
        id: UID,
        growth_progress: u64,
        prize_pool: Balance<SUI>,
        round: u64,
        total_waterings: u64,
        unique_players: u64,
        contributions: Table<address, u64>,
        top1_address: address,
        top1_amount: u64,
        top2_address: address,
        top2_amount: u64,
        top3_address: address,
        top3_amount: u64
    }

    // Events
    public struct TreeWatered has copy, drop {
        player: address,
        round: u64,
        amount_paid: u64,
        growth_phase: u8,
        phase_progress_pct: u64,
        total_prize_pool: u64,
        unique_players: u64
    }

    public struct TreeMatured has copy, drop {
        winner: address,
        round: u64,
        winner_prize: u64,
        total_waterings: u64
    }

    public struct NewRoundStarted has copy, drop {
        round: u64,
        starting_pool: u64
    }

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap { id: object::new(ctx) };

        let config = GameConfig {
            id: object::new(ctx),
            water_cost: 50_000_000, // 0.05 SUI
            growth_per_water: 1,
            maturity_threshold: 100,
            winner_share_bps: 5000, // 50%
            treasury_share_bps: 2500, // 25%
            treasury: tx_context::sender(ctx),
            is_paused: false
        };

        let game = TreeGame {
            id: object::new(ctx),
            growth_progress: 0,
            prize_pool: balance::zero(),
            round: 1,
            total_waterings: 0,
            unique_players: 0,
            contributions: table::new(ctx),
            top1_address: @0x0,
            top1_amount: 0,
            top2_address: @0x0,
            top2_amount: 0,
            top3_address: @0x0,
            top3_amount: 0
        };

        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(config);
        transfer::share_object(game);

        event::emit(NewRoundStarted { round: 1, starting_pool: 0 });
    }

    public entry fun water_tree(
        game: &mut TreeGame,
        config: &GameConfig,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(!config.is_paused, EGamePaused);
        assert!(game.growth_progress < config.maturity_threshold, ETreeAlreadyMature);

        let payment_value = coin::value(&payment);
        assert!(payment_value >= config.water_cost, EInsufficientPayment);

        let player = tx_context::sender(ctx);

        balance::join(&mut game.prize_pool, coin::into_balance(payment));

        let is_new = !table::contains(&game.contributions, player);
        if (is_new) {
            table::add(&mut game.contributions, player, 0);
            game.unique_players = game.unique_players + 1;
        };

        let contribution = table::borrow_mut(&mut game.contributions, player);
        *contribution = *contribution + payment_value;
        let player_total = *contribution;

        update_top_contributors(game, player, player_total);

        let new_growth = game.growth_progress + config.growth_per_water;
        game.growth_progress = new_growth;
        game.total_waterings = game.total_waterings + 1;

        let (phase, phase_progress) = get_phase_info(game, config);

        event::emit(TreeWatered {
            player,
            round: game.round,
            amount_paid: payment_value,
            growth_phase: phase,
            phase_progress_pct: phase_progress,
            total_prize_pool: balance::value(&game.prize_pool),
            unique_players: game.unique_players
        });

        if (new_growth >= config.maturity_threshold) {
            complete_round(game, config, player, ctx);
        }
    }

    public entry fun water_tree_exact(
        game: &mut TreeGame,
        config: &GameConfig,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let exact_payment = coin::split(payment, config.water_cost, ctx);
        water_tree(game, config, exact_payment, ctx);
    }

    fun update_top_contributors(game: &mut TreeGame, player: address, amount: u64) {
        if (amount > game.top1_amount) {
            game.top3_address = game.top2_address;
            game.top3_amount = game.top2_amount;
            game.top2_address = game.top1_address;
            game.top2_amount = game.top1_amount;
            game.top1_address = player;
            game.top1_amount = amount;
        } else if (amount > game.top2_amount && player != game.top1_address) {
            game.top3_address = game.top2_address;
            game.top3_amount = game.top2_amount;
            game.top2_address = player;
            game.top2_amount = amount;
        } else if (amount > game.top3_amount && player != game.top1_address && player != game.top2_address) {
            game.top3_address = player;
            game.top3_amount = amount;
        }
    }

    fun get_phase_info(game: &TreeGame, config: &GameConfig): (u8, u64) {
        let progress_bps = (game.growth_progress * BASIS_POINTS) / config.maturity_threshold;
        
        if (progress_bps < 3000) {
            (1, (progress_bps * 100) / 3000)
        } else if (progress_bps < 6000) {
            (2, ((progress_bps - 3000) * 100) / 3000)
        } else if (progress_bps < 8000) {
            (3, ((progress_bps - 6000) * 100) / 2000)
        } else {
            (4, 0) // Final stretch - hidden progress
        }
    }

    fun complete_round(
        game: &mut TreeGame,
        config: &GameConfig,
        winner: address,
        ctx: &mut TxContext
    ) {
        let total_pool = balance::value(&game.prize_pool);
        let winner_amount = (total_pool * config.winner_share_bps) / BASIS_POINTS;
        let treasury_amount = (total_pool * config.treasury_share_bps) / BASIS_POINTS;

        if (winner_amount > 0) {
            let winner_coin = coin::from_balance(
                balance::split(&mut game.prize_pool, winner_amount),
                ctx
            );
            transfer::public_transfer(winner_coin, winner);
        };

        if (treasury_amount > 0) {
            let treasury_coin = coin::from_balance(
                balance::split(&mut game.prize_pool, treasury_amount),
                ctx
            );
            transfer::public_transfer(treasury_coin, config.treasury);
        };

        event::emit(TreeMatured {
            winner,
            round: game.round,
            winner_prize: winner_amount,
            total_waterings: game.total_waterings
        });

        game.growth_progress = 0;
        game.round = game.round + 1;
        game.total_waterings = 0;
        game.unique_players = 0;
        game.top1_address = @0x0;
        game.top1_amount = 0;
        game.top2_address = @0x0;
        game.top2_amount = 0;
        game.top3_address = @0x0;
        game.top3_amount = 0;

        event::emit(NewRoundStarted {
            round: game.round,
            starting_pool: balance::value(&game.prize_pool)
        });
    }

    // Admin functions
    public entry fun pause_game(_: &AdminCap, config: &mut GameConfig) {
        config.is_paused = true;
    }

    public entry fun unpause_game(_: &AdminCap, config: &mut GameConfig) {
        config.is_paused = false;
    }

    public entry fun seed_pool(_: &AdminCap, game: &mut TreeGame, funds: Coin<SUI>) {
        balance::join(&mut game.prize_pool, coin::into_balance(funds));
    }

    // View functions
    public fun get_growth_progress(game: &TreeGame): u64 { game.growth_progress }
    public fun get_prize_pool(game: &TreeGame): u64 { balance::value(&game.prize_pool) }
    public fun get_round(game: &TreeGame): u64 { game.round }
    public fun get_water_cost(config: &GameConfig): u64 { config.water_cost }
    public fun is_paused(config: &GameConfig): bool { config.is_paused }
}
"@ | Out-File -FilePath "contracts\sources\tree_game.move" -Encoding UTF8

# ============== FRONTEND CONFIG FILES ==============

Write-Host "📄 Creating frontend config files..." -ForegroundColor Cyan

# frontend/package.json
@"
{
  "name": "grow-tree-sui",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@mysten/dapp-kit": "^0.14.0",
    "@mysten/sui": "^1.0.0",
    "@tanstack/react-query": "^5.28.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.356.0",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0"
  }
}
"@ | Out-File -FilePath "frontend\package.json" -Encoding UTF8

# frontend/next.config.js
@"
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
"@ | Out-File -FilePath "frontend\next.config.js" -Encoding UTF8

# frontend/tsconfig.json
@"
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
"@ | Out-File -FilePath "frontend\tsconfig.json" -Encoding UTF8

# frontend/tailwind.config.js
@"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tree: {
          seedling: '#90EE90',
          growing: '#32CD32',
          maturing: '#228B22',
          final: '#FFD700',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sway': 'sway 4s ease-in-out infinite',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
};
"@ | Out-File -FilePath "frontend\tailwind.config.js" -Encoding UTF8

# frontend/postcss.config.js
@"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@ | Out-File -FilePath "frontend\postcss.config.js" -Encoding UTF8

# frontend/.env.example
@"
# SUI Network: devnet, testnet, or mainnet
NEXT_PUBLIC_SUI_NETWORK=testnet

# Contract addresses (from deployment output)
NEXT_PUBLIC_PACKAGE_ID=0x_YOUR_PACKAGE_ID
NEXT_PUBLIC_GAME_CONFIG_ID=0x_YOUR_CONFIG_OBJECT_ID
NEXT_PUBLIC_TREE_GAME_ID=0x_YOUR_GAME_OBJECT_ID
"@ | Out-File -FilePath "frontend\.env.example" -Encoding UTF8

# frontend/vercel.json
@"
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
"@ | Out-File -FilePath "frontend\vercel.json" -Encoding UTF8

# ============== FRONTEND SOURCE FILES ==============

Write-Host "📄 Creating frontend source files..." -ForegroundColor Cyan

# frontend/src/styles/globals.css
@"
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 240, 253, 244;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(to bottom, rgb(240, 249, 255), rgb(240, 253, 244));
  min-height: 100vh;
}

.tree-glow {
  box-shadow: 0 0 60px rgba(34, 197, 94, 0.3);
}

.final-stretch-glow {
  animation: final-glow 1.5s ease-in-out infinite alternate;
}

@keyframes final-glow {
  from { box-shadow: 0 0 30px rgba(255, 215, 0, 0.4); }
  to { box-shadow: 0 0 60px rgba(255, 215, 0, 0.8); }
}

.water-drop {
  animation: drop 0.6s ease-in forwards;
}

@keyframes drop {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(100px); }
}
"@ | Out-File -FilePath "frontend\src\styles\globals.css" -Encoding UTF8

# frontend/src/lib/constants.ts
@"
export const CONTRACT_CONFIG = {
  PACKAGE_ID: process.env.NEXT_PUBLIC_PACKAGE_ID || '',
  GAME_CONFIG_ID: process.env.NEXT_PUBLIC_GAME_CONFIG_ID || '',
  TREE_GAME_ID: process.env.NEXT_PUBLIC_TREE_GAME_ID || '',
};

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet') as 'devnet' | 'testnet' | 'mainnet';

export const PHASES = {
  1: { name: 'Seedling', emoji: '🌱', color: 'text-green-400', bgColor: 'bg-green-100' },
  2: { name: 'Growing', emoji: '🌿', color: 'text-green-500', bgColor: 'bg-green-200' },
  3: { name: 'Maturing', emoji: '🌳', color: 'text-green-600', bgColor: 'bg-green-300' },
  4: { name: 'Final Stretch', emoji: '🔥', color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
} as const;

export const formatSui = (mist: bigint | number): string => {
  const sui = Number(mist) / 1_000_000_000;
  if (sui < 0.01) return '<0.01 SUI';
  if (sui < 1) return sui.toFixed(2) + ' SUI';
  return sui.toFixed(1) + ' SUI';
};

export const formatAddress = (address: string): string => {
  if (!address || address === '0x0') return '---';
  return address.slice(0, 6) + '...' + address.slice(-4);
};
"@ | Out-File -FilePath "frontend\src\lib\constants.ts" -Encoding UTF8

# frontend/src/components/Providers.tsx
@"
'use client';

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import '@mysten/dapp-kit/dist/index.css';

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  devnet: { url: getFullnodeUrl('devnet') },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={(process.env.NEXT_PUBLIC_SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet') || 'testnet'}
      >
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
"@ | Out-File -FilePath "frontend\src\components\Providers.tsx" -Encoding UTF8

# frontend/src/hooks/useGameState.ts
@"
'use client';

import { useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { CONTRACT_CONFIG } from '@/lib/constants';

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
}

export interface GameConfig {
  waterCost: bigint;
  isPaused: boolean;
}

export function useGameState() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['gameState', CONTRACT_CONFIG.TREE_GAME_ID],
    queryFn: async (): Promise<GameState | null> => {
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
        };
      } catch (error) {
        console.error('Failed to fetch game state:', error);
        return null;
      }
    },
    refetchInterval: 3000,
    enabled: !!CONTRACT_CONFIG.TREE_GAME_ID,
  });
}

export function useGameConfig() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['gameConfig', CONTRACT_CONFIG.GAME_CONFIG_ID],
    queryFn: async (): Promise<GameConfig | null> => {
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
    refetchInterval: 30000,
    enabled: !!CONTRACT_CONFIG.GAME_CONFIG_ID,
  });
}
"@ | Out-File -FilePath "frontend\src\hooks\useGameState.ts" -Encoding UTF8

# frontend/src/components/TreeVisualization.tsx
@"
'use client';

import { motion } from 'framer-motion';
import { PHASES } from '@/lib/constants';

interface TreeVisualizationProps {
  phase: number;
  phaseProgress: number;
}

export function TreeVisualization({ phase, phaseProgress }: TreeVisualizationProps) {
  const currentPhase = PHASES[phase as keyof typeof PHASES] || PHASES[1];
  const isFinalStretch = phase === 4;
  const treeScale = 0.5 + (phase / 4) * 0.5;

  return (
    <div className={`relative flex flex-col items-center justify-center p-8 rounded-3xl min-h-[400px] ${
      isFinalStretch ? 'final-stretch-glow' : 'tree-glow'
    } bg-gradient-to-b from-sky-100 to-green-50`}>
      
      {/* Phase Badge */}
      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${currentPhase.bgColor} ${currentPhase.color}`}>
        {currentPhase.emoji} {currentPhase.name}
      </div>

      {/* Tree */}
      <motion.div
        className="relative"
        animate={{ scale: treeScale }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-[150px] animate-sway origin-bottom">
          {phase === 1 && '🌱'}
          {phase === 2 && '🌿'}
          {phase === 3 && '🌳'}
          {phase === 4 && '🌳✨'}
        </div>
      </motion.div>

      {/* Progress (hidden in final stretch) */}
      {!isFinalStretch && (
        <div className="absolute bottom-8 left-8 right-8">
          <div className="text-sm text-center text-green-700 mb-2">
            {phaseProgress}% through {currentPhase.name}
          </div>
          <div className="h-3 bg-green-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${phaseProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Final Stretch Message */}
      {isFinalStretch && (
        <motion.div
          className="absolute bottom-8 text-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <span className="text-2xl font-bold text-yellow-500">
            🔥 WHO WILL WIN?! 🔥
          </span>
        </motion.div>
      )}
    </div>
  );
}
"@ | Out-File -FilePath "frontend\src\components\TreeVisualization.tsx" -Encoding UTF8

# frontend/src/components/WaterButton.tsx
@"
'use client';

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CONTRACT_CONFIG, formatSui } from '@/lib/constants';

interface WaterButtonProps {
  waterCost: bigint;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function WaterButton({ waterCost, disabled, onSuccess }: WaterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const handleWater = async () => {
    if (!account) return;
    setIsLoading(true);

    try {
      const coins = await client.getCoins({
        owner: account.address,
        coinType: '0x2::sui::SUI',
      });

      const suitableCoin = coins.data.find(
        (coin) => BigInt(coin.balance) >= waterCost
      );

      if (!suitableCoin) {
        alert('Insufficient balance. Need at least ' + formatSui(waterCost));
        return;
      }

      const tx = new Transaction();
      tx.moveCall({
        target: `${CONTRACT_CONFIG.PACKAGE_ID}::tree_game::water_tree_exact`,
        arguments: [
          tx.object(CONTRACT_CONFIG.TREE_GAME_ID),
          tx.object(CONTRACT_CONFIG.GAME_CONFIG_ID),
          tx.object(suitableCoin.coinObjectId),
        ],
      });

      await signAndExecute({ transaction: tx });
      onSuccess?.();
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleWater}
      disabled={disabled || isLoading || !account}
      className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
        disabled || !account
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500 hover:shadow-lg'
      }`}
      whileHover={!disabled && account ? { scale: 1.05 } : {}}
      whileTap={!disabled && account ? { scale: 0.95 } : {}}
    >
      {isLoading ? '💧 Watering...' : `💧 Water Tree (${formatSui(waterCost)})`}
    </motion.button>
  );
}
"@ | Out-File -FilePath "frontend\src\components\WaterButton.tsx" -Encoding UTF8

# frontend/src/components/GameStats.tsx
@"
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
        <div className="text-yellow-700 font-medium mb-1">💰 Prize Pool</div>
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
          <div className="text-gray-500 text-sm">🏆 Round</div>
          <div className="text-2xl font-bold">#{gameState.round}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-gray-500 text-sm">👥 Players</div>
          <div className="text-2xl font-bold">{gameState.uniquePlayers}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow col-span-2">
          <div className="text-gray-500 text-sm">💧 Total Waterings</div>
          <div className="text-2xl font-bold">{gameState.totalWaterings}</div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-lg mb-4">🏅 Top Contributors</h3>
        <div className="space-y-2">
          {[
            { place: '🥇', addr: gameState.top1Address, amt: gameState.top1Amount },
            { place: '🥈', addr: gameState.top2Address, amt: gameState.top2Amount },
            { place: '🥉', addr: gameState.top3Address, amt: gameState.top3Amount },
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
"@ | Out-File -FilePath "frontend\src\components\GameStats.tsx" -Encoding UTF8

# frontend/src/app/layout.tsx
@"
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Grow Tree SUI | Water the Tree, Win the Prize!',
  description: 'A viral prize pool game on SUI blockchain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
"@ | Out-File -FilePath "frontend\src\app\layout.tsx" -Encoding UTF8

# frontend/src/app/page.tsx
@"
'use client';

import { ConnectButton } from '@mysten/dapp-kit';
import { useQueryClient } from '@tanstack/react-query';
import { TreeVisualization } from '@/components/TreeVisualization';
import { WaterButton } from '@/components/WaterButton';
import { GameStats } from '@/components/GameStats';
import { useGameState, useGameConfig } from '@/hooks/useGameState';
import { CONTRACT_CONFIG, NETWORK } from '@/lib/constants';

export default function Home() {
  const queryClient = useQueryClient();
  const { data: gameState, isLoading: stateLoading } = useGameState();
  const { data: gameConfig, isLoading: configLoading } = useGameConfig();

  const isLoading = stateLoading || configLoading;
  const isConfigured = CONTRACT_CONFIG.PACKAGE_ID && CONTRACT_CONFIG.TREE_GAME_ID;

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['gameState'] });
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            <span className="font-bold text-xl">Grow Tree</span>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {NETWORK}
            </span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isConfigured ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌳</div>
            <h1 className="text-3xl font-bold mb-4">Setup Required</h1>
            <p className="text-gray-600 mb-8">
              Deploy the contract and set environment variables.
            </p>
            <div className="bg-gray-100 rounded-xl p-6 max-w-lg mx-auto text-left font-mono text-sm">
              <div>NEXT_PUBLIC_PACKAGE_ID=0x...</div>
              <div>NEXT_PUBLIC_GAME_CONFIG_ID=0x...</div>
              <div>NEXT_PUBLIC_TREE_GAME_ID=0x...</div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left - Tree */}
            <div className="space-y-6">
              <TreeVisualization
                phase={gameState?.phase || 1}
                phaseProgress={gameState?.phaseProgress || 0}
              />
              <div className="flex justify-center">
                <WaterButton
                  waterCost={gameConfig?.waterCost || BigInt(50000000)}
                  disabled={gameConfig?.isPaused}
                  onSuccess={handleSuccess}
                />
              </div>

              {/* How to Play */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4">🎮 How to Play</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li>1️⃣ Connect your SUI wallet</li>
                  <li>2️⃣ Click "Water Tree" to grow it</li>
                  <li>3️⃣ Watch the tree progress through phases</li>
                  <li>🏆 <strong>Complete the tree to win 50%!</strong></li>
                </ol>
              </div>
            </div>

            {/* Right - Stats */}
            <GameStats gameState={gameState} gameConfig={gameConfig} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 text-center text-gray-500">
        <p>🌳 Grow Tree SUI - Built on SUI Blockchain</p>
      </footer>
    </main>
  );
}
"@ | Out-File -FilePath "frontend\src\app\page.tsx" -Encoding UTF8

# ============== ROOT FILES ==============

Write-Host "📄 Creating root files..." -ForegroundColor Cyan

# .gitignore
@"
node_modules/
.next/
.env
.env.local
build/
*.log
.DS_Store
contracts/build/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

# README.md
@"
# 🌳 Grow Tree SUI

A viral prize pool game on SUI blockchain. Water the tree to grow it - the player who completes it wins 50%!

## Quick Start

### 1. Deploy Contract
``````
cd contracts
sui move build
sui client publish --gas-budget 200000000
``````

### 2. Configure Frontend
``````
cd frontend
copy .env.example .env.local
# Edit .env.local with your contract addresses
``````

### 3. Run Locally
``````
npm install
npm run dev
``````

### 4. Deploy to Vercel
- Push to GitHub
- Import to Vercel
- Set root directory: frontend
- Add environment variables
- Deploy!

## Game Mechanics
- 💧 Water Cost: 0.05 SUI
- 🌱→🌿→🌳→🔥 Four growth phases
- 🏆 Winner: 50% of prize pool
- 🔄 25% rolls to next round
"@ | Out-File -FilePath "README.md" -Encoding UTF8

# ============== DONE ==============

Write-Host "`n✅ Project setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. cd frontend" -ForegroundColor White
Write-Host "  2. npm install" -ForegroundColor White
Write-Host "  3. copy .env.example .env.local" -ForegroundColor White
Write-Host "  4. Edit .env.local with contract addresses" -ForegroundColor White
Write-Host "  5. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "To deploy contract:" -ForegroundColor Yellow
Write-Host "  cd contracts" -ForegroundColor White
Write-Host "  sui move build" -ForegroundColor White
Write-Host "  sui client publish --gas-budget 200000000" -ForegroundColor White
Write-Host ""