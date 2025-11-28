'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CONTRACT_CONFIG, NETWORK } from '@/lib/constants';

export default function DocsPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-forest-900/80 border-b border-forest-600/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-bold text-2xl text-glow"><span className="text-forest-300">GROVE</span>{' '}<span className="text-blue-400">GAMES</span></span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-full text-sm font-medium bg-forest-700 text-forest-200 border border-forest-600 hover:bg-forest-600 transition-all"
          >
            Back to Game
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-forest-300 text-glow">Documentation</h1>
          <Image
            src="/images/photo_2025-10-26_18-42-50.png"
            alt="Tree Hero"
            width={150}
            height={150}
            className="rounded-xl border-2 border-forest-600/50"
          />
        </div>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-forest-200 mb-4">How It Works</h2>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow space-y-4">
            <p className="text-forest-200">
              Tree Sui Canopy is a competitive prize pool game on the SUI blockchain. Players water a virtual tree, and the player who completes the final watering wins a share of the prize pool.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-forest-300">
              <li>Connect your SUI wallet</li>
              <li>Click "Water Tree" to contribute to the tree's growth</li>
              <li>Each watering costs <span className="text-gold-400">0.05 SUI</span></li>
              <li>The tree grows through 4 phases: Seedling → Growing → Maturing → Final Stretch</li>
              <li>The player who makes the final watering wins <span className="text-gold-400">50%</span> of the prize pool</li>
            </ol>
          </div>
        </section>

        {/* Game Phases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-forest-200 mb-4">Game Phases</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { phase: 'Seedling', range: '0-30%', desc: 'The tree is just starting to grow' },
              { phase: 'Growing', range: '30-60%', desc: 'The tree is developing roots and branches' },
              { phase: 'Maturing', range: '60-80%', desc: 'The tree is almost fully grown' },
              { phase: 'Final Stretch', range: '80-100%', desc: 'Hidden progress - anyone could win!' },
            ].map(({ phase, range, desc }) => (
              <div key={phase} className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50 card-glow">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-forest-300">{phase}</span>
                  <span className="text-sm text-forest-400">{range}</span>
                </div>
                <p className="text-sm text-forest-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prize Distribution */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-forest-200 mb-4">Prize Distribution</h2>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-forest-600/30">
                <span className="text-forest-300">Winner (Final Waterer)</span>
                <span className="font-bold text-gold-400">50%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-forest-600/30">
                <span className="text-forest-300">Treasury</span>
                <span className="font-bold text-forest-200">25%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-forest-300">Next Round Pool</span>
                <span className="font-bold text-forest-200">25%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Contract */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-forest-200 mb-4">Smart Contract</h2>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow space-y-4">
            <p className="text-forest-300 text-sm">
              The game runs on a fully on-chain Move smart contract deployed on SUI {NETWORK}.
            </p>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-forest-400">Package ID:</span>
                <span className="text-forest-300 break-all bg-forest-900/50 px-3 py-2 rounded">
                  {CONTRACT_CONFIG.PACKAGE_ID || 'Not configured'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-forest-400">Game Config:</span>
                <span className="text-forest-300 break-all bg-forest-900/50 px-3 py-2 rounded">
                  {CONTRACT_CONFIG.GAME_CONFIG_ID || 'Not configured'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-forest-400">Tree Game:</span>
                <span className="text-forest-300 break-all bg-forest-900/50 px-3 py-2 rounded">
                  {CONTRACT_CONFIG.TREE_GAME_ID || 'Not configured'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-forest-200 mb-4">FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: 'What happens if I water during Final Stretch?',
                a: 'During the Final Stretch phase (80-100%), the progress bar is hidden. You won\'t know how close the tree is to completion, adding excitement to every watering!',
              },
              {
                q: 'How much does it cost to water?',
                a: 'Each watering costs 0.05 SUI. This amount goes directly into the prize pool.',
              },
              {
                q: 'What if I water multiple times?',
                a: 'You can water as many times as you want! Your total contributions are tracked on the leaderboard.',
              },
              {
                q: 'When does a new round start?',
                a: 'A new round starts immediately after a winner claims the prize. 25% of the previous pool carries over.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50 card-glow">
                <h3 className="font-bold text-forest-300 mb-2">{q}</h3>
                <p className="text-sm text-forest-400">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-forest-600/50 py-8 text-center text-forest-400">
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
