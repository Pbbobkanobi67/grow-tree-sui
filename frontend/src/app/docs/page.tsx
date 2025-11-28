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
              Grove Games is a competitive prize pool game on the SUI blockchain. Players water a virtual tree, and multiple winners share the prize pool when the tree reaches maturity.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-forest-300">
              <li>Connect your SUI wallet</li>
              <li>Choose a watering tier: <span className="text-blue-400">Drip</span>, <span className="text-cyan-400">Splash</span>, or <span className="text-teal-400">Flood</span></li>
              <li>Water the tree to grow it and increase the prize pool</li>
              <li>The tree grows through 4 phases toward completion</li>
              <li>When complete, prizes are distributed to multiple winners!</li>
            </ol>
          </div>
        </section>

        {/* Watering Tiers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-forest-200 mb-4">Watering Tiers</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-forest-800/50 rounded-xl p-4 border border-blue-500/30 card-glow">
              <div className="text-3xl mb-2">💧</div>
              <h3 className="font-bold text-blue-400 mb-1">Drip</h3>
              <div className="text-gold-400 font-bold">0.05 SUI</div>
              <div className="text-sm text-forest-400 mt-2">+1-2% progress</div>
              <div className="text-xs text-forest-500 mt-1">Available Phase 1+</div>
            </div>
            <div className="bg-forest-800/50 rounded-xl p-4 border border-cyan-500/30 card-glow">
              <div className="text-3xl mb-2">🌊</div>
              <h3 className="font-bold text-cyan-400 mb-1">Splash</h3>
              <div className="text-gold-400 font-bold">0.25 SUI</div>
              <div className="text-sm text-forest-400 mt-2">+3-5% progress</div>
              <div className="text-xs text-forest-500 mt-1">Available Phase 2+</div>
            </div>
            <div className="bg-forest-800/50 rounded-xl p-4 border border-teal-500/30 card-glow">
              <div className="text-3xl mb-2">🌀</div>
              <h3 className="font-bold text-teal-400 mb-1">Flood</h3>
              <div className="text-gold-400 font-bold">1.00 SUI</div>
              <div className="text-sm text-forest-400 mt-2">+6-10% progress</div>
              <div className="text-xs text-forest-500 mt-1">Available Phase 3+</div>
            </div>
          </div>
        </section>

        {/* Game Phases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-forest-200 mb-4">Game Phases</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { phase: 'Seedling', range: '0-30%', desc: 'The tree sprouts - only Drip available', icon: '🌱' },
              { phase: 'Growing', range: '30-60%', desc: 'Branches form - Splash unlocks', icon: '🌿' },
              { phase: 'Maturing', range: '60-80%', desc: 'Almost grown - Flood unlocks', icon: '🌲' },
              { phase: 'Final Stretch', range: '80-???%', desc: 'Mystery zone - progress hidden!', icon: '✨' },
            ].map(({ phase, range, desc, icon }) => (
              <div key={phase} className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50 card-glow">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-forest-300">{icon} {phase}</span>
                  <span className="text-sm text-forest-400">{range}</span>
                </div>
                <p className="text-sm text-forest-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Anti-Sniping Mechanics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-forest-200 mb-4">Anti-Sniping Mechanics</h2>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow space-y-4">
            <p className="text-forest-300">
              Grove Games uses several mechanics to prevent last-minute sniping and reward consistent players:
            </p>
            <ul className="space-y-3 text-forest-300">
              <li className="flex items-start gap-3">
                <span className="text-gold-400">🎭</span>
                <div>
                  <span className="font-bold">Mystery Percentage</span>
                  <p className="text-sm text-forest-400">After 90%, progress shows "??%" - you won't know exactly when the tree completes!</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold-400">🎲</span>
                <div>
                  <span className="font-bold">Random Completion</span>
                  <p className="text-sm text-forest-400">The tree completes at a random threshold between 97-103% - impossible to predict!</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold-400">⚖️</span>
                <div>
                  <span className="font-bold">Weighted Winner Prize</span>
                  <p className="text-sm text-forest-400">The final waterer gets 25% guaranteed + up to 15% bonus based on their total contributions. Loyal players earn more!</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Prize Distribution */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-forest-200 mb-4">Prize Distribution</h2>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-forest-600/30">
                <span className="text-gold-400 flex items-center gap-2">🏆 Final Waterer</span>
                <span className="font-bold text-gold-400">40%</span>
              </div>
              <div className="text-xs text-forest-500 -mt-2 mb-2 pl-7">
                (25% guaranteed + 15% weighted by contribution)
              </div>
              <div className="flex justify-between items-center py-2 border-b border-forest-600/30">
                <span className="text-orange-400 flex items-center gap-2">👑 Top Contributor</span>
                <span className="font-bold text-forest-200">15%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-forest-600/30">
                <span className="text-purple-400 flex items-center gap-2">🎲 Random Player</span>
                <span className="font-bold text-forest-200">5%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-forest-600/30">
                <span className="text-blue-400 flex items-center gap-2">🌱 Next Round Seed</span>
                <span className="font-bold text-forest-200">20%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-forest-600/30">
                <span className="text-green-400 flex items-center gap-2">🏦 Treasury</span>
                <span className="font-bold text-forest-200">10%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-cyan-400 flex items-center gap-2">📢 Dev & Marketing</span>
                <span className="font-bold text-forest-200">10%</span>
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
                q: 'What happens during Final Stretch?',
                a: 'After 90%, the progress shows "??%" so no one knows exactly when the tree will complete. The completion threshold is randomly set between 97-103%, adding extra unpredictability!',
              },
              {
                q: 'How does the weighted winner prize work?',
                a: 'The final waterer gets 25% guaranteed, plus a share of an additional 15% based on how much they contributed to the total pool. If you contributed 50% of all waterings, you\'d get 25% + 7.5% = 32.5%!',
              },
              {
                q: 'Why are higher tiers locked at first?',
                a: 'Splash unlocks at Phase 2 (30%) and Flood at Phase 3 (60%). This prevents whales from dominating early and gives everyone a fair start.',
              },
              {
                q: 'How is the Random Player chosen?',
                a: 'Any address that participated in the round has a chance to win the 5% random prize. More waterings = more chances, but even 1 watering gives you a shot!',
              },
              {
                q: 'When does a new round start?',
                a: 'A new round starts immediately after prizes are distributed. 20% of the prize pool seeds the next round.',
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
