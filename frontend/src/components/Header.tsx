'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { DevWalletSelector, useDevWallet } from '@/components/DevWalletSelector';
import { DEV_MODE } from '@/lib/devMode';
import { NETWORK, formatSui } from '@/lib/constants';

interface NavItem {
  href: string;
  label: string;
  badge?: string;
  color: {
    bg: string;
    bgHover: string;
    text: string;
    border: string;
    activeBg: string;
    activeText: string;
  };
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/grow',
    label: 'Grow Tree',
    badge: 'GROW',
    color: {
      bg: 'bg-green-900/50',
      bgHover: 'hover:bg-green-800/50',
      text: 'text-green-200',
      border: 'border-green-600/50',
      activeBg: 'bg-green-600',
      activeText: 'text-white',
    },
  },
  {
    href: '/fortune',
    label: 'Fortune',
    badge: 'FORTUNE',
    color: {
      bg: 'bg-amber-900/50',
      bgHover: 'hover:bg-amber-800/50',
      text: 'text-amber-200',
      border: 'border-amber-600/50',
      activeBg: 'bg-amber-600',
      activeText: 'text-white',
    },
  },
];

const UTILITY_ITEMS: NavItem[] = [
  {
    href: '/docs',
    label: 'Docs',
    color: {
      bg: 'bg-forest-700',
      bgHover: 'hover:bg-forest-600',
      text: 'text-forest-200',
      border: 'border-forest-600',
      activeBg: 'bg-forest-500',
      activeText: 'text-white',
    },
  },
];

export function Header() {
  const pathname = usePathname();
  const isHub = pathname === '/';
  const isAdmin = pathname === '/admin';

  // Real wallet
  const realAccount = useCurrentAccount();

  // Dev wallet
  const { selectedWallet: devWallet, balance: devBalance } = useDevWallet();

  // Balance query for real wallet
  const { data: balanceData } = useSuiClientQuery(
    'getBalance',
    { owner: realAccount?.address || '', coinType: '0x2::sui::SUI' },
    { enabled: !DEV_MODE && !!realAccount?.address }
  );

  // Display balance
  const displayBalance = DEV_MODE
    ? formatSui(devBalance)
    : balanceData?.totalBalance
      ? (Number(balanceData.totalBalance) / 1_000_000_000).toFixed(2) + ' SUI'
      : null;

  // Find current page info
  const currentNavItem = NAV_ITEMS.find(item => pathname === item.href);
  const currentUtilItem = UTILITY_ITEMS.find(item => pathname === item.href);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-forest-900/80 border-b border-forest-600/50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Branding + Hub + Current Page Badge */}
        <div className="flex items-center gap-3">
          {/* Logo - always links to hub */}
          <Link href="/" className="font-bold text-2xl text-glow">
            <span className="text-forest-300">GROVE</span>{' '}
            <span className="text-blue-400">GAMES</span>
          </Link>

          {/* HUB button - shown when NOT on hub */}
          {!isHub && (
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-forest-500 to-blue-500 hover:from-forest-400 hover:to-blue-400 rounded-full transition-all shadow-lg shadow-blue-500/25"
            >
              HUB
            </Link>
          )}

          {/* Current page badge */}
          {currentNavItem && (
            <span className={`text-xs px-2 py-1 ${currentNavItem.color.activeBg} ${currentNavItem.color.activeText} rounded-full font-medium`}>
              {currentNavItem.badge}
            </span>
          )}
          {currentUtilItem && (
            <span className="text-xs px-2 py-1 bg-forest-600 text-forest-100 rounded-full font-medium">
              DOCS
            </span>
          )}
          {isAdmin && (
            <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full font-medium">
              ADMIN
            </span>
          )}

          {/* Network/Dev Mode badge */}
          {DEV_MODE ? (
            <span className="text-xs px-2 py-1 bg-purple-600 text-purple-100 rounded-full border border-purple-400 animate-pulse">
              DEV
            </span>
          ) : isHub && (
            <span className="text-xs px-2 py-1 bg-forest-700 text-forest-200 rounded-full border border-forest-600">
              {NETWORK}
            </span>
          )}
        </div>

        {/* Right: Navigation + Wallet */}
        <div className="flex items-center gap-2">
          {/* Game navigation */}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all border ${
                  isActive
                    ? `${item.color.activeBg} ${item.color.activeText} border-transparent shadow-md`
                    : `${item.color.bg} ${item.color.bgHover} ${item.color.text} ${item.color.border}`
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-forest-600/50 mx-1" />

          {/* Utility navigation */}
          {UTILITY_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all border ${
                  isActive
                    ? `${item.color.activeBg} ${item.color.activeText} border-transparent`
                    : `${item.color.bg} ${item.color.bgHover} ${item.color.text} ${item.color.border}`
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Admin link - subtle */}
          {!isAdmin && (
            <Link
              href="/admin"
              className="px-2 py-1.5 text-xs font-medium text-forest-500 hover:text-red-400 transition-colors"
              title="Admin"
            >
              ⚙️
            </Link>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-forest-600/50 mx-1" />

          {/* Balance display (when connected) */}
          {displayBalance && !DEV_MODE && realAccount && (
            <div className="px-3 py-1.5 text-sm font-medium text-blue-300 bg-blue-900/30 border border-blue-700/50 rounded-full">
              {displayBalance}
            </div>
          )}

          {/* Wallet */}
          {DEV_MODE ? <DevWalletSelector /> : <ConnectButton />}
        </div>
      </div>
    </header>
  );
}
