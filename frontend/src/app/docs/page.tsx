'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { CONTRACT_CONFIG, NETWORK } from '@/lib/constants';

export default function DocsPage() {
  return (
    <main className="min-h-screen">
      <Header />

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

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-forest-200 mb-4">Grove Games Overview</h2>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow space-y-4">
            <p className="text-forest-200">
              Grove Games is a gaming hub on the SUI blockchain featuring multiple games. Each game has unique mechanics and ways to win.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Link href="/grow" className="bg-green-900/30 rounded-xl p-4 border border-green-600/30 hover:border-green-500 transition-all text-center">
                <div className="text-3xl mb-2">🌳</div>
                <div className="font-bold text-green-400">Grow Tree</div>
                <div className="text-xs text-forest-400">Prize Pool Game</div>
              </Link>
              <Link href="/fortune" className="bg-amber-900/30 rounded-xl p-4 border border-amber-600/30 hover:border-amber-500 transition-all text-center">
                <div className="text-3xl mb-2">🎰</div>
                <div className="font-bold text-amber-400">Tree of Fortune</div>
                <div className="text-xs text-forest-400">Spin Wheel</div>
              </Link>
              <Link href="/keno" className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-600/30 hover:border-yellow-500 transition-all text-center">
                <div className="text-3xl mb-2">🌰</div>
                <div className="font-bold text-yellow-400">Acorn Keno</div>
                <div className="text-xs text-forest-400">Number Picker</div>
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== GROW TREE ==================== */}
        <div className="border-t border-forest-600/50 pt-8 mb-8">
          <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
            <span>🌳</span> Grow Tree
          </h2>
        </div>

        {/* How Grow Tree Works */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-forest-200 mb-4">How It Works</h3>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-green-600/30 card-glow space-y-4">
            <p className="text-forest-200">
              Grow Tree is a competitive prize pool game. Players water a virtual tree, and multiple winners share the prize pool when the tree reaches maturity.
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
        <section className="mb-8">
          <h3 className="text-xl font-bold text-forest-200 mb-4">Watering Tiers</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-forest-800/50 rounded-xl p-4 border border-blue-500/30 card-glow">
              <div className="text-3xl mb-2">💧</div>
              <h4 className="font-bold text-blue-400 mb-1">Drip</h4>
              <div className="text-gold-400 font-bold">0.05 SUI</div>
              <div className="text-sm text-forest-400 mt-2">+1-2% progress</div>
              <div className="text-xs text-forest-500 mt-1">Available Phase 1+</div>
            </div>
            <div className="bg-forest-800/50 rounded-xl p-4 border border-cyan-500/30 card-glow">
              <div className="text-3xl mb-2">🌊</div>
              <h4 className="font-bold text-cyan-400 mb-1">Splash</h4>
              <div className="text-gold-400 font-bold">0.25 SUI</div>
              <div className="text-sm text-forest-400 mt-2">+3-5% progress</div>
              <div className="text-xs text-forest-500 mt-1">Available Phase 2+</div>
            </div>
            <div className="bg-forest-800/50 rounded-xl p-4 border border-teal-500/30 card-glow">
              <div className="text-3xl mb-2">🌀</div>
              <h4 className="font-bold text-teal-400 mb-1">Flood</h4>
              <div className="text-gold-400 font-bold">1.00 SUI</div>
              <div className="text-sm text-forest-400 mt-2">+6-10% progress</div>
              <div className="text-xs text-forest-500 mt-1">Available Phase 3+</div>
            </div>
          </div>
        </section>

        {/* Game Phases */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-forest-200 mb-4">Game Phases</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { phase: 'Seedling', range: '0-30%', desc: 'The tree sprouts - only Drip available', icon: '🌱' },
              { phase: 'Growing', range: '30-60%', desc: 'Branches form - Splash unlocks', icon: '🌿' },
              { phase: 'Maturing', range: '60-80%', desc: 'Almost grown - Flood unlocks', icon: '🌲' },
              { phase: 'Final Stretch', range: '80-100+%', desc: 'Mystery zone - progress hidden after 90%!', icon: '✨' },
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

        {/* Anti-Sniping */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-forest-200 mb-4">Anti-Sniping Mechanics</h3>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow space-y-4">
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
                  <p className="text-sm text-forest-400">The tree completes at a random threshold between 97-103%</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold-400">⚖️</span>
                <div>
                  <span className="font-bold">Weighted Winner Prize</span>
                  <p className="text-sm text-forest-400">Final waterer gets 25% guaranteed + up to 15% bonus based on contribution ratio</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Prize Distribution */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-forest-200 mb-4">Prize Distribution</h3>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-green-600/30 card-glow">
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

        {/* ==================== TREE OF FORTUNE ==================== */}
        <div className="border-t border-forest-600/50 pt-8 mb-8">
          <h2 className="text-3xl font-bold text-amber-400 mb-6 flex items-center gap-3">
            <span>🎰</span> Tree of Fortune
          </h2>
        </div>

        {/* How Fortune Works */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-forest-200 mb-4">How It Works</h3>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-amber-600/30 card-glow space-y-4">
            <p className="text-forest-200">
              Tree of Fortune is a classic spin-the-wheel game. Place your bet, spin the wheel, and win up to 10x your bet!
            </p>
            <ol className="list-decimal list-inside space-y-2 text-forest-300">
              <li>Connect your wallet</li>
              <li>Select your bet amount (0.1 to 25 SUI)</li>
              <li>Click SPIN to spin the wheel</li>
              <li>Win based on where the wheel lands!</li>
            </ol>
          </div>
        </section>

        {/* Fortune Odds */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-forest-200 mb-4">Multipliers & Odds</h3>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-amber-600/30 card-glow">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { mult: 'BUST', chance: '30%', color: 'bg-red-900/50 border-red-600/50', textColor: 'text-red-400' },
                { mult: '0.5x', chance: '25%', color: 'bg-gray-800/50 border-gray-600/50', textColor: 'text-gray-400' },
                { mult: '1x', chance: '18%', color: 'bg-gray-700/50 border-gray-500/50', textColor: 'text-gray-300' },
                { mult: '1.5x', chance: '12%', color: 'bg-green-900/50 border-green-600/50', textColor: 'text-green-400' },
                { mult: '2x', chance: '8%', color: 'bg-blue-900/50 border-blue-600/50', textColor: 'text-blue-400' },
                { mult: '3x', chance: '4%', color: 'bg-purple-900/50 border-purple-600/50', textColor: 'text-purple-400' },
                { mult: '5x', chance: '2%', color: 'bg-pink-900/50 border-pink-600/50', textColor: 'text-pink-400' },
                { mult: '10x', chance: '1%', color: 'bg-amber-900/50 border-amber-500/50', textColor: 'text-gold-400' },
              ].map(({ mult, chance, color, textColor }) => (
                <div key={mult} className={`${color} rounded-lg p-3 border text-center`}>
                  <div className={`font-bold text-lg ${textColor}`}>{mult}</div>
                  <div className="text-xs text-forest-400">{chance}</div>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-forest-400 pt-4 border-t border-forest-600/30">
              RTP: ~96.5% | House edge: ~3.5%
            </div>
          </div>
        </section>

        {/* ==================== ACORN KENO ==================== */}
        <div className="border-t border-forest-600/50 pt-8 mb-8">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
            <span>🌰</span> Acorn Keno
          </h2>
        </div>

        {/* How Keno Works */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-forest-200 mb-4">How It Works</h3>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-yellow-600/30 card-glow space-y-4">
            <p className="text-forest-200">
              Acorn Keno is a lottery-style game where you pick acorns and hope they match the drawn numbers. Win up to 100x your bet!
            </p>
            <ol className="list-decimal list-inside space-y-2 text-forest-300">
              <li>Pick 1-5 acorns from the 40-acorn grid</li>
              <li>Choose your bet amount (1, 5, 10, 25, 50, or 100 $TREE)</li>
              <li>Click DRAW to reveal 10 winning acorns</li>
              <li>Win based on how many of your picks match!</li>
            </ol>
            <div className="bg-yellow-900/20 rounded-lg p-3 mt-4 border border-yellow-600/30">
              <p className="text-sm text-yellow-200">
                <span className="font-bold">Note:</span> Acorn Keno uses play money ($TREE) - no real cryptocurrency is wagered. Start with 1,000 $TREE and have fun!
              </p>
            </div>
          </div>
        </section>

        {/* Keno Payouts */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-forest-200 mb-4">Payout Tables</h3>
          <div className="grid md:grid-cols-5 gap-3">
            {/* 1 Pick */}
            <div className="bg-forest-800/50 rounded-xl p-4 border border-yellow-600/30">
              <h4 className="font-bold text-yellow-400 mb-3 text-center">1 Pick</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-forest-400">1 hit</span>
                  <span className="text-gold-400 font-bold">3.5x</span>
                </div>
              </div>
            </div>
            {/* 2 Picks */}
            <div className="bg-forest-800/50 rounded-xl p-4 border border-yellow-600/30">
              <h4 className="font-bold text-yellow-400 mb-3 text-center">2 Picks</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-forest-400">1 hit</span>
                  <span className="text-forest-200">1x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-400">2 hits</span>
                  <span className="text-gold-400 font-bold">9x</span>
                </div>
              </div>
            </div>
            {/* 3 Picks */}
            <div className="bg-forest-800/50 rounded-xl p-4 border border-yellow-600/30">
              <h4 className="font-bold text-yellow-400 mb-3 text-center">3 Picks</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-forest-400">2 hits</span>
                  <span className="text-forest-200">2x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-400">3 hits</span>
                  <span className="text-gold-400 font-bold">25x</span>
                </div>
              </div>
            </div>
            {/* 4 Picks */}
            <div className="bg-forest-800/50 rounded-xl p-4 border border-yellow-600/30">
              <h4 className="font-bold text-yellow-400 mb-3 text-center">4 Picks</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-forest-400">2 hits</span>
                  <span className="text-forest-200">1x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-400">3 hits</span>
                  <span className="text-forest-200">5x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-400">4 hits</span>
                  <span className="text-gold-400 font-bold">50x</span>
                </div>
              </div>
            </div>
            {/* 5 Picks */}
            <div className="bg-forest-800/50 rounded-xl p-4 border border-yellow-600/30">
              <h4 className="font-bold text-yellow-400 mb-3 text-center">5 Picks</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-forest-400">2 hits</span>
                  <span className="text-red-400">0.5x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-400">3 hits</span>
                  <span className="text-forest-200">3x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-400">4 hits</span>
                  <span className="text-forest-200">15x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-400">5 hits</span>
                  <span className="text-gold-400 font-bold">100x</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-forest-400 mt-4">
            40 acorns total | 10 drawn per round | Pick 1-5 acorns
          </div>
        </section>

        {/* ==================== TECHNICAL ==================== */}
        <div className="border-t border-forest-600/50 pt-8 mb-8">
          <h2 className="text-3xl font-bold text-forest-300 mb-6 flex items-center gap-3">
            <span>⚙️</span> Technical Info
          </h2>
        </div>

        {/* Smart Contract */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-forest-200 mb-4">Smart Contract</h3>
          <div className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50 card-glow space-y-4">
            <p className="text-forest-300 text-sm">
              Grow Tree runs on a fully on-chain Move smart contract deployed on SUI {NETWORK}.
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
          <h3 className="text-xl font-bold text-forest-200 mb-4">FAQ</h3>
          <div className="space-y-4">
            {[
              {
                q: 'What happens during Final Stretch in Grow Tree?',
                a: 'After 90%, the progress shows "??%" so no one knows exactly when the tree will complete. The completion threshold is randomly set between 97-103%.',
              },
              {
                q: 'How does the weighted winner prize work?',
                a: 'The final waterer gets 25% guaranteed, plus a share of an additional 15% based on how much they contributed to the total pool.',
              },
              {
                q: 'Is Tree of Fortune fair?',
                a: 'Yes! The wheel uses weighted random selection with ~96.5% RTP (Return to Player). All odds are displayed transparently.',
              },
              {
                q: 'Does Acorn Keno use real money?',
                a: 'No, Acorn Keno uses play money ($TREE). You start with 1,000 $TREE and can add more anytime. It\'s just for fun!',
              },
              {
                q: 'What are the best odds in Keno?',
                a: 'Picking 1 acorn gives you the best hit rate (25% chance), but lower payouts. Picking 5 acorns is riskier but offers up to 100x payouts.',
              },
              {
                q: 'When does a new Grow Tree round start?',
                a: 'A new round starts immediately after prizes are distributed. 20% of the prize pool seeds the next round.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50 card-glow">
                <h4 className="font-bold text-forest-300 mb-2">{q}</h4>
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
