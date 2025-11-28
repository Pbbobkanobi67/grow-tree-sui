'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { FroggerGame } from '../FroggerGame';

export default function ForestPage() {
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [wins, setWins] = useState(0);

  const handleGameOver = (score: number) => {
    setGamesPlayed(prev => prev + 1);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const handleWin = (score: number) => {
    setGamesPlayed(prev => prev + 1);
    setWins(prev => prev + 1);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-glow mb-2">
            <span className="text-emerald-400">Forest</span>{' '}
            <span className="text-forest-300">Crossing</span>
          </h1>
          <p className="text-forest-400">
            Help the frog hop across logs and dodge cars to reach the Enchanted Forest!
          </p>
        </motion.div>

        {/* Game Area */}
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
          {/* Game */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-forest-800/50 rounded-2xl p-6 border border-forest-600/50"
          >
            <FroggerGame onGameOver={handleGameOver} onWin={handleWin} />
          </motion.div>

          {/* Side Panel */}
          <div className="w-full lg:w-64 space-y-4">
            {/* Stats */}
            <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50">
              <h3 className="font-bold text-forest-300 mb-3">Your Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-forest-400">High Score</span>
                  <span className="text-gold-400 font-bold">{highScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-400">Games Played</span>
                  <span className="text-forest-200">{gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-400">Wins</span>
                  <span className="text-green-400 font-bold">{wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest-400">Win Rate</span>
                  <span className="text-forest-200">
                    {gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* How to Play */}
            <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50">
              <h3 className="font-bold text-forest-300 mb-3">How to Play</h3>
              <ul className="space-y-2 text-sm text-forest-400">
                <li className="flex items-start gap-2">
                  <span className="text-forest-300">⬆️</span>
                  <span>Move forward toward the forest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forest-300">🪵</span>
                  <span>Hop on logs to cross the water</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forest-300">🚗</span>
                  <span>Avoid cars on the road</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forest-300">🌲</span>
                  <span>Reach the Enchanted Forest to win!</span>
                </li>
              </ul>
            </div>

            {/* Controls */}
            <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50">
              <h3 className="font-bold text-forest-300 mb-3">Controls</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div />
                <div className="bg-forest-700 rounded p-2 text-sm">
                  <span className="text-forest-200">W</span>
                  <span className="text-forest-500"> / </span>
                  <span className="text-forest-200">↑</span>
                </div>
                <div />
                <div className="bg-forest-700 rounded p-2 text-sm">
                  <span className="text-forest-200">A</span>
                  <span className="text-forest-500"> / </span>
                  <span className="text-forest-200">←</span>
                </div>
                <div className="bg-forest-700 rounded p-2 text-sm">
                  <span className="text-forest-200">S</span>
                  <span className="text-forest-500"> / </span>
                  <span className="text-forest-200">↓</span>
                </div>
                <div className="bg-forest-700 rounded p-2 text-sm">
                  <span className="text-forest-200">D</span>
                  <span className="text-forest-500"> / </span>
                  <span className="text-forest-200">→</span>
                </div>
              </div>
            </div>

            {/* Scoring */}
            <div className="bg-forest-800/50 rounded-xl p-4 border border-forest-600/50">
              <h3 className="font-bold text-forest-300 mb-3">Scoring</h3>
              <ul className="space-y-1 text-sm text-forest-400">
                <li>+10 points per row advanced</li>
                <li>+500 bonus for reaching forest</li>
                <li>3 lives per game</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-forest-600/50 mt-16 py-8 text-center text-forest-400">
        <p>Forest Crossing - Part of Grove Games</p>
      </footer>
    </main>
  );
}
