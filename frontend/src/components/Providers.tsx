'use client';

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import '@mysten/dapp-kit/dist/index.css';
import { DevWalletProvider } from './DevWalletSelector';

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
        <WalletProvider autoConnect>
          <DevWalletProvider>{children}</DevWalletProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
