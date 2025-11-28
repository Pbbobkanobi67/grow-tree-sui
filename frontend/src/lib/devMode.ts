// Dev Mode - Mock blockchain for unlimited testing
// Toggle this to switch between real blockchain and mock mode

export const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

// Test wallets with unlimited balances
export const TEST_WALLETS = [
  { name: 'Dev Wallet 1', address: '0xDEV1...', balance: 10000000 },
  { name: 'Dev Wallet 2', address: '0xDEV2...', balance: 10000000 },
  { name: 'Dev Wallet 3', address: '0xDEV3...', balance: 10000000 },
  { name: 'Dev Wallet 4', address: '0xDEV4...', balance: 10000000 },
  { name: 'Dev Wallet 5', address: '0xDEV5...', balance: 10000000 },
  { name: 'Dev Wallet 6', address: '0xDEV6...', balance: 10000000 },
];

// Mock game state
export interface MockGameState {
  phase: number;
  phaseProgress: number;
  prizePool: bigint;
  round: number;
  totalWaterings: number;
  uniquePlayers: number;
  lastWaterer: string;
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
  completionThreshold: number; // Random between 97-103%
  contributions: Record<string, bigint>; // Track each player's contributions
}

// Generate random completion threshold between 97-103%
function generateCompletionThreshold(): number {
  return 97 + Math.floor(Math.random() * 7); // 97, 98, 99, 100, 101, 102, or 103
}

// Dev wallet addresses (must match DevWalletSelector)
const DEV_WALLET_1 = '0xdev1111111111111111111111111111111111111111111111111111111111111111';
const DEV_WALLET_2 = '0xdev2222222222222222222222222222222222222222222222222222222222222222';
const DEV_WALLET_3 = '0xdev3333333333333333333333333333333333333333333333333333333333333333';

// Persistent mock state (in-memory, resets on refresh)
let mockState: MockGameState = {
  phase: 2,
  phaseProgress: 50,
  prizePool: BigInt(125000000000), // 125 SUI
  round: 1,
  totalWaterings: 47,
  uniquePlayers: 3,
  lastWaterer: DEV_WALLET_1,
  top1Address: DEV_WALLET_1,
  top1Amount: BigInt(15000000000),
  top2Address: DEV_WALLET_2,
  top2Amount: BigInt(12000000000),
  top3Address: DEV_WALLET_3,
  top3Amount: BigInt(8000000000),
  isComplete: false,
  winner: '',
  winnerContribution: BigInt(0),
  totalContributions: BigInt(35000000000), // 35 SUI contributed so far
  completionThreshold: generateCompletionThreshold(),
  contributions: {
    [DEV_WALLET_1]: BigInt(15000000000),
    [DEV_WALLET_2]: BigInt(12000000000),
    [DEV_WALLET_3]: BigInt(8000000000),
  },
};

let mockBalances: Record<string, bigint> = {
  '0xdev1111111111111111111111111111111111111111111111111111111111111111': BigInt(10000000) * BigInt(1000000000),
  '0xdev2222222222222222222222222222222222222222222222222222222222222222': BigInt(10000000) * BigInt(1000000000),
  '0xdev3333333333333333333333333333333333333333333333333333333333333333': BigInt(10000000) * BigInt(1000000000),
  '0xdev4444444444444444444444444444444444444444444444444444444444444444': BigInt(10000000) * BigInt(1000000000),
  '0xdev5555555555555555555555555555555555555555555555555555555555555555': BigInt(10000000) * BigInt(1000000000),
  '0xdev6666666666666666666666666666666666666666666666666666666666666666': BigInt(10000000) * BigInt(1000000000),
};

// Mock functions
export function getMockGameState(): MockGameState {
  return { ...mockState };
}

export function getMockBalance(address: string): bigint {
  return mockBalances[address] || BigInt(10000000) * BigInt(1000000000);
}

export function mockWaterTree(
  address: string,
  tier: 'drip' | 'splash' | 'flood'
): { success: boolean; progress: number } {
  const tierCosts = {
    drip: BigInt(50000000),
    splash: BigInt(250000000),
    flood: BigInt(1000000000),
  };

  const progressRanges = {
    drip: [1, 2],
    splash: [3, 5],
    flood: [6, 10],
  };

  const cost = tierCosts[tier];
  const [minProgress, maxProgress] = progressRanges[tier];
  const progress = minProgress + Math.floor(Math.random() * (maxProgress - minProgress + 1));

  // Deduct from balance
  if (mockBalances[address]) {
    mockBalances[address] -= cost;
  }

  // Add to prize pool
  mockState.prizePool += cost;
  mockState.totalWaterings += 1;
  mockState.lastWaterer = address;
  mockState.totalContributions += cost;

  // Track individual contributions
  if (!mockState.contributions[address]) {
    mockState.contributions[address] = BigInt(0);
    mockState.uniquePlayers += 1;
  }
  mockState.contributions[address] += cost;

  // Update progress
  mockState.phaseProgress += progress;

  // Calculate overall progress for completion check
  const overallProgress = calculateOverallProgressFromPhase(mockState.phase, mockState.phaseProgress);

  // Check if game is complete using random threshold
  if (overallProgress >= mockState.completionThreshold) {
    // Game complete! Set winner and mark complete
    mockState.isComplete = true;
    mockState.winner = address;
    mockState.winnerContribution = mockState.contributions[address];
  } else if (mockState.phaseProgress >= 100) {
    // Phase transition (but not game completion)
    mockState.phaseProgress = mockState.phaseProgress - 100;
    mockState.phase += 1;
  }

  // Update top contributors
  updateTopContributors(address);

  return { success: true, progress };
}

// Calculate overall progress (0-100+) from phase and phaseProgress
function calculateOverallProgressFromPhase(phase: number, phaseProgress: number): number {
  const phaseStarts = [0, 30, 60, 80]; // Phase 1: 0-30, Phase 2: 30-60, Phase 3: 60-80, Phase 4: 80-100+
  const phaseSizes = [30, 30, 20, 20]; // Size of each phase in overall %
  const idx = Math.min(phase - 1, 3);
  return phaseStarts[idx] + (phaseProgress / 100) * phaseSizes[idx];
}

// Update top contributors based on current contributions
function updateTopContributors(address: string) {
  const contribution = mockState.contributions[address];

  // Check if this address should be in top 3
  if (contribution > mockState.top1Amount) {
    // New #1
    if (mockState.top1Address !== address) {
      mockState.top3Address = mockState.top2Address;
      mockState.top3Amount = mockState.top2Amount;
      mockState.top2Address = mockState.top1Address;
      mockState.top2Amount = mockState.top1Amount;
    }
    mockState.top1Address = address;
    mockState.top1Amount = contribution;
  } else if (contribution > mockState.top2Amount && address !== mockState.top1Address) {
    // New #2
    if (mockState.top2Address !== address) {
      mockState.top3Address = mockState.top2Address;
      mockState.top3Amount = mockState.top2Amount;
    }
    mockState.top2Address = address;
    mockState.top2Amount = contribution;
  } else if (contribution > mockState.top3Amount && address !== mockState.top1Address && address !== mockState.top2Address) {
    // New #3
    mockState.top3Address = address;
    mockState.top3Amount = contribution;
  }
}

export function mockFaucet(address: string, amount: bigint = BigInt(1000) * BigInt(1000000000)): void {
  if (!mockBalances[address]) {
    mockBalances[address] = BigInt(0);
  }
  mockBalances[address] += amount;
}

export function startNewRound(): void {
  // Start a new round keeping round counter and 20% prize pool carryover
  const carryoverPrize = (mockState.prizePool * BigInt(20)) / BigInt(100); // 20% carries over to seed next round
  mockState = {
    phase: 1,
    phaseProgress: 0,
    prizePool: carryoverPrize,
    round: mockState.round + 1,
    totalWaterings: 0,
    uniquePlayers: 0,
    lastWaterer: '',
    top1Address: '',
    top1Amount: BigInt(0),
    top2Address: '',
    top2Amount: BigInt(0),
    top3Address: '',
    top3Amount: BigInt(0),
    isComplete: false,
    winner: '',
    winnerContribution: BigInt(0),
    totalContributions: BigInt(0),
    completionThreshold: generateCompletionThreshold(), // New random threshold for new round
    contributions: {},
  };
}

export function resetMockState(): void {
  mockState = {
    phase: 2,
    phaseProgress: 50,
    prizePool: BigInt(125000000000),
    round: 1,
    totalWaterings: 47,
    uniquePlayers: 3,
    lastWaterer: DEV_WALLET_1,
    top1Address: DEV_WALLET_1,
    top1Amount: BigInt(15000000000),
    top2Address: DEV_WALLET_2,
    top2Amount: BigInt(12000000000),
    top3Address: DEV_WALLET_3,
    top3Amount: BigInt(8000000000),
    isComplete: false,
    winner: '',
    winnerContribution: BigInt(0),
    totalContributions: BigInt(35000000000),
    completionThreshold: generateCompletionThreshold(),
    contributions: {
      [DEV_WALLET_1]: BigInt(15000000000),
      [DEV_WALLET_2]: BigInt(12000000000),
      [DEV_WALLET_3]: BigInt(8000000000),
    },
  };

  mockBalances = {
    '0xdev1111111111111111111111111111111111111111111111111111111111111111': BigInt(10000000) * BigInt(1000000000),
    '0xdev2222222222222222222222222222222222222222222222222222222222222222': BigInt(10000000) * BigInt(1000000000),
    '0xdev3333333333333333333333333333333333333333333333333333333333333333': BigInt(10000000) * BigInt(1000000000),
    '0xdev4444444444444444444444444444444444444444444444444444444444444444': BigInt(10000000) * BigInt(1000000000),
    '0xdev5555555555555555555555555555555555555555555555555555555555555555': BigInt(10000000) * BigInt(1000000000),
    '0xdev6666666666666666666666666666666666666666666666666666666666666666': BigInt(10000000) * BigInt(1000000000),
  };
}
