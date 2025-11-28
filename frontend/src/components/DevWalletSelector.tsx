'use client';

import { useState, createContext, useContext, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { DEV_MODE, getMockBalance, mockFaucet, adjustMockBalance } from '@/lib/devMode';
import { formatSui } from '@/lib/constants';

// Dev wallet addresses (fake but consistent)
const DEV_WALLETS = [
  { name: 'Dev Wallet 1', address: '0xdev1111111111111111111111111111111111111111111111111111111111111111' },
  { name: 'Dev Wallet 2', address: '0xdev2222222222222222222222222222222222222222222222222222222222222222' },
  { name: 'Dev Wallet 3', address: '0xdev3333333333333333333333333333333333333333333333333333333333333333' },
  { name: 'Dev Wallet 4', address: '0xdev4444444444444444444444444444444444444444444444444444444444444444' },
  { name: 'Dev Wallet 5', address: '0xdev5555555555555555555555555555555555555555555555555555555555555555' },
  { name: 'Dev Wallet 6', address: '0xdev6666666666666666666666666666666666666666666666666666666666666666' },
];

interface DevWalletContextType {
  selectedWallet: typeof DEV_WALLETS[0] | null;
  selectWallet: (wallet: typeof DEV_WALLETS[0] | null) => void;
  balance: bigint;
  refreshBalance: () => void;
  addFunds: (amount: bigint) => void;
  adjustBalance: (delta: bigint) => void;
}

const DevWalletContext = createContext<DevWalletContextType | null>(null);

export function useDevWallet() {
  const context = useContext(DevWalletContext);
  if (!context) {
    throw new Error('useDevWallet must be used within DevWalletProvider');
  }
  return context;
}

export function DevWalletProvider({ children }: { children: ReactNode }) {
  const [selectedWallet, setSelectedWallet] = useState<typeof DEV_WALLETS[0] | null>(null);
  const [balanceKey, setBalanceKey] = useState(0);

  const balance = selectedWallet ? getMockBalance(selectedWallet.address) : BigInt(0);

  const refreshBalance = () => setBalanceKey((k) => k + 1);

  const addFunds = (amount: bigint) => {
    if (selectedWallet) {
      mockFaucet(selectedWallet.address, amount);
      refreshBalance();
    }
  };

  const adjustBalance = (delta: bigint) => {
    if (selectedWallet) {
      adjustMockBalance(selectedWallet.address, delta);
      refreshBalance();
    }
  };

  return (
    <DevWalletContext.Provider
      value={{
        selectedWallet,
        selectWallet: setSelectedWallet,
        balance,
        refreshBalance,
        addFunds,
        adjustBalance,
      }}
    >
      {children}
    </DevWalletContext.Provider>
  );
}

export function DevWalletSelector() {
  const { selectedWallet, selectWallet, balance, addFunds } = useDevWallet();
  const [isOpen, setIsOpen] = useState(false);

  if (!DEV_MODE) return null;

  return (
    <div className="relative">
      {selectedWallet ? (
        <div className="flex items-center gap-2">
          {/* Balance */}
          <div className="px-3 py-1.5 text-sm font-medium text-purple-300 bg-purple-900/30 border border-purple-700/50 rounded-full">
            {formatSui(balance)}
          </div>

          {/* Quick add funds */}
          <motion.button
            onClick={() => addFunds(BigInt(1000) * BigInt(1000000000))}
            className="px-2 py-1.5 text-xs font-medium text-green-300 bg-green-900/30 border border-green-700/50 rounded-full hover:bg-green-800/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Add 1000 SUI"
          >
            +1K
          </motion.button>

          {/* Wallet selector */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-full flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            {selectedWallet.name}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-full"
        >
          Connect Dev Wallet
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-72 bg-forest-800 border border-purple-500/50 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="p-2 border-b border-purple-500/30">
            <div className="text-xs text-purple-300 font-medium px-2 py-1">DEV WALLETS</div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {DEV_WALLETS.map((wallet) => {
              const walletBalance = getMockBalance(wallet.address);
              const isSelected = selectedWallet?.address === wallet.address;
              return (
                <button
                  key={wallet.address}
                  onClick={() => {
                    selectWallet(wallet);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-purple-900/30 flex items-center justify-between ${
                    isSelected ? 'bg-purple-900/50' : ''
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-white">{wallet.name}</div>
                    <div className="text-xs text-forest-400 font-mono">
                      {wallet.address.slice(0, 10)}...{wallet.address.slice(-6)}
                    </div>
                  </div>
                  <div className="text-sm text-purple-300">{formatSui(walletBalance)}</div>
                </button>
              );
            })}
          </div>
          {selectedWallet && (
            <div className="p-2 border-t border-purple-500/30">
              <button
                onClick={() => {
                  selectWallet(null);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg"
              >
                Disconnect
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
