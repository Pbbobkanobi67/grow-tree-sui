'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Header } from '@/components/Header';
import { DevWalletSelector, useDevWallet } from '@/components/DevWalletSelector';
import { DEV_MODE } from '@/lib/devMode';

const games = [
  {
    id: 'grow',
    title: 'Grow Tree',
    description: 'Water the community tree and compete for the prize pool. Multiple winners share rewards when the tree reaches maturity!',
    href: '/grow',
    icon: '🌳',
    color: 'from-green-500/20 to-emerald-600/20',
    borderColor: 'border-green-500/50',
    hoverBorder: 'hover:border-green-400',
    badge: 'LIVE',
    badgeColor: 'bg-green-500',
  },
  {
    id: 'fortune',
    title: 'Tree of Fortune',
    description: 'Spin the wheel and test your luck! Win up to 10x your bet with realistic casino odds.',
    href: '/fortune',
    icon: '🎰',
    color: 'from-amber-500/20 to-gold-600/20',
    borderColor: 'border-amber-500/50',
    hoverBorder: 'hover:border-amber-400',
    badge: 'LIVE',
    badgeColor: 'bg-amber-500',
  },
  {
    id: 'forest',
    title: 'Forest Crossing',
    description: 'Help the frog hop across logs and dodge cars to reach the Enchanted Forest! Classic arcade fun.',
    href: '/forest',
    icon: '🐸',
    color: 'from-emerald-500/20 to-green-600/20',
    borderColor: 'border-emerald-500/50',
    hoverBorder: 'hover:border-emerald-400',
    badge: 'LIVE',
    badgeColor: 'bg-emerald-500',
  },
  {
    id: 'harvest',
    title: 'Harvest Season',
    description: 'Coming soon: Seasonal events with limited-time rewards and exclusive NFT drops.',
    href: '#',
    icon: '🍂',
    color: 'from-orange-500/20 to-red-600/20',
    borderColor: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-400',
    badge: 'SOON',
    badgeColor: 'bg-orange-600',
    disabled: true,
  },
];

export default function Home() {
  // Real wallet
  const realAccount = useCurrentAccount();

  // Dev wallet
  const { selectedWallet: devWallet } = useDevWallet();

  // Use dev wallet in DEV_MODE
  const isConnected = DEV_MODE ? !!devWallet : !!realAccount;

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <Image
              src="/images/hero.png"
              alt="Grove Games"
              width={180}
              height={220}
              className="drop-shadow-2xl"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-glow mb-4">
            <span className="text-forest-300">GROVE</span>{' '}
            <span className="text-blue-400">GAMES</span>
          </h1>
          <p className="text-xl text-forest-400 max-w-2xl mx-auto">
            The ultimate gaming hub for the SUI TREE ecosystem. Play, earn, and grow together.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <a
              href="https://tree-token.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-forest-700 hover:bg-forest-600 text-forest-200 rounded-full font-medium transition-all border border-forest-600"
            >
              Learn about TREE
            </a>
            {!isConnected && (
              <div className="flex items-center gap-2">
                {DEV_MODE ? <DevWalletSelector /> : <ConnectButton />}
              </div>
            )}
          </div>
        </motion.div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {game.disabled ? (
                <div
                  className={`relative bg-gradient-to-br ${game.color} rounded-2xl p-6 border ${game.borderColor} opacity-60 cursor-not-allowed`}
                >
                  <GameCardContent game={game} />
                </div>
              ) : (
                <Link href={game.href}>
                  <motion.div
                    className={`relative bg-gradient-to-br ${game.color} rounded-2xl p-6 border ${game.borderColor} ${game.hoverBorder} transition-all cursor-pointer`}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GameCardContent game={game} />
                  </motion.div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-forest-800/30 rounded-2xl p-8 border border-forest-600/50"
        >
          <h2 className="text-2xl font-bold text-forest-300 text-center mb-8">Ecosystem Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Games Live', value: '3', icon: '🎮' },
              { label: 'Coming Soon', value: '1+', icon: '🚀' },
              { label: 'Network', value: 'SUI', icon: '⛓️' },
              { label: 'Token', value: '$TREE', icon: '🌳' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-forest-200">{stat.value}</div>
                <div className="text-sm text-forest-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/grow"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-medium transition-all flex items-center gap-2"
          >
            <span>🌳</span> Play Grow Tree
          </Link>
          <Link
            href="/fortune"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-medium transition-all flex items-center gap-2"
          >
            <span>🎰</span> Spin the Wheel
          </Link>
          <Link
            href="/forest"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-all flex items-center gap-2"
          >
            <span>🐸</span> Forest Crossing
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 bg-forest-700 hover:bg-forest-600 text-forest-200 rounded-full font-medium transition-all flex items-center gap-2 border border-forest-600"
          >
            <span>📚</span> Read Docs
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-forest-600/50 mt-16 py-8 text-center text-forest-400">
        <p>
          Grove Games - Built on SUI Blockchain |{' '}
          <a
            href="https://tree-token.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-300 hover:text-forest-200 underline transition-colors"
          >
            TREE Token
          </a>
        </p>
      </footer>
    </main>
  );
}

function GameCardContent({ game }: { game: typeof games[0] }) {
  return (
    <>
      <div className="absolute top-4 right-4">
        <span className={`text-xs px-2 py-1 ${game.badgeColor} text-white rounded-full font-medium`}>
          {game.badge}
        </span>
      </div>
      <div className="text-5xl mb-4">{game.icon}</div>
      <h3 className="text-2xl font-bold text-forest-200 mb-2">{game.title}</h3>
      <p className="text-forest-400 text-sm leading-relaxed">{game.description}</p>
      {!game.disabled && (
        <div className="mt-4 flex items-center text-forest-300 text-sm font-medium">
          Play Now <span className="ml-2">→</span>
        </div>
      )}
    </>
  );
}
