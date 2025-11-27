export const CONTRACT_CONFIG = {
  PACKAGE_ID: process.env.NEXT_PUBLIC_PACKAGE_ID || '',
  GAME_CONFIG_ID: process.env.NEXT_PUBLIC_GAME_CONFIG_ID || '',
  TREE_GAME_ID: process.env.NEXT_PUBLIC_TREE_GAME_ID || '',
};

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet') as 'devnet' | 'testnet' | 'mainnet';

export const PHASES = {
  1: { name: 'Seedling', emoji: 'ðŸŒ±', color: 'text-green-400', bgColor: 'bg-green-100' },
  2: { name: 'Growing', emoji: 'ðŸŒ¿', color: 'text-green-500', bgColor: 'bg-green-200' },
  3: { name: 'Maturing', emoji: 'ðŸŒ³', color: 'text-green-600', bgColor: 'bg-green-300' },
  4: { name: 'Final Stretch', emoji: 'ðŸ”¥', color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
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
