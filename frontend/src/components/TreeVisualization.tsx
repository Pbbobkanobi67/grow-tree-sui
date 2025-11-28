'use client';

import { motion } from 'framer-motion';
import { PHASES } from '@/lib/constants';
import { useMemo } from 'react';

interface TreeVisualizationProps {
  phase: number;
  phaseProgress: number;
}

// Calculate overall progress (0-100) from phase and phaseProgress
function calculateOverallProgress(phase: number, phaseProgress: number): number {
  const phaseRanges = [
    { start: 0, end: 30 },   // Phase 1: 0-30%
    { start: 30, end: 60 },  // Phase 2: 30-60%
    { start: 60, end: 80 },  // Phase 3: 60-80%
    { start: 80, end: 100 }, // Phase 4: 80-100%
  ];

  const range = phaseRanges[phase - 1] || phaseRanges[0];
  const rangeSize = range.end - range.start;
  return range.start + (phaseProgress / 100) * rangeSize;
}

// Generate floating particles for final stretch
function generateParticles(count: number) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: -50 + Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      size: 2 + Math.random() * 3,
    });
  }
  return particles;
}

export function TreeVisualization({ phase, phaseProgress }: TreeVisualizationProps) {
  const currentPhase = PHASES[phase as keyof typeof PHASES] || PHASES[1];
  const isFinalStretch = phase === 4;
  const overallProgress = calculateOverallProgress(phase, phaseProgress);
  const progress = overallProgress / 100; // 0 to 1

  // Generate particles for final stretch
  const particles = useMemo(() => isFinalStretch ? generateParticles(15) : [], [isFinalStretch]);

  // Colors
  const leafColor = isFinalStretch ? '#d4a017' : '#34d399';
  const leafColorDark = isFinalStretch ? '#b8860b' : '#22805a';
  const trunkColor = '#8B4513';
  const trunkColorDark = '#654321';

  // Tree dimensions that grow with progress
  const trunkHeight = 20 + progress * 100;
  const trunkWidth = 6 + progress * 14;
  const canopyWidth = progress * 80;
  const canopyHeight = progress * 60;

  // Ground position
  const groundY = 80;

  return (
    <div className={`relative flex flex-col items-center justify-center p-8 rounded-3xl min-h-[450px] bg-forest-800/50 border border-forest-600/50 overflow-hidden ${isFinalStretch ? 'final-stretch-glow' : 'card-glow'}`}>

      {/* Phase Badge */}
      <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-medium z-10 ${isFinalStretch ? 'bg-gold-500/20 text-gold-400 border border-gold-500/50' : 'bg-forest-700/50 text-forest-300 border border-forest-600/50'}`}>
        {currentPhase.name}
      </div>

      {/* Progress percentage */}
      <div className="absolute top-4 right-4 text-sm text-forest-400">
        {Math.round(overallProgress)}%
      </div>

      {/* Floating Particles (Final Stretch) */}
      {isFinalStretch && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gold-400"
          style={{
            left: `calc(50% + ${particle.x}px)`,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ bottom: '30%', opacity: 0 }}
          animate={{
            bottom: ['30%', '70%'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Tree Container */}
      <motion.div
        className="relative"
        animate={{ rotate: isFinalStretch ? 0 : [-0.5, 0.5, -0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-72 h-72"
        >
          {/* Ground / Soil */}
          <ellipse
            cx="100"
            cy={groundY + 5}
            rx="60"
            ry="10"
            fill="#1a4731"
          />
          <ellipse
            cx="100"
            cy={groundY}
            rx="50"
            ry="8"
            fill="#276749"
          />

          {/* Seedling stage (0-30%) - Animated sprout */}
          {progress < 0.30 && (
            <g>
              {/* Main stem */}
              <motion.path
                d={`M100,${groundY} C100,${groundY - 15 - progress * 80} 100,${groundY - 20 - progress * 80} 100,${groundY - 25 - progress * 80}`}
                stroke="#34d399"
                strokeWidth={4 + progress * 6}
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />

              {/* Left leaf */}
              <motion.ellipse
                cx={100 - 10 - progress * 20}
                cy={groundY - 20 - progress * 50}
                rx={6 + progress * 18}
                ry={4 + progress * 10}
                fill="#34d399"
                initial={{ scale: 0, rotate: -30 }}
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [-30, -25, -30]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ transformOrigin: 'right center' }}
              />

              {/* Right leaf */}
              <motion.ellipse
                cx={100 + 10 + progress * 20}
                cy={groundY - 22 - progress * 55}
                rx={6 + progress * 18}
                ry={4 + progress * 10}
                fill="#34d399"
                initial={{ scale: 0, rotate: 30 }}
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [30, 25, 30]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                style={{ transformOrigin: 'left center' }}
              />

              {/* Top bud/leaf */}
              <motion.ellipse
                cx="100"
                cy={groundY - 30 - progress * 80}
                rx={8 + progress * 20}
                ry={6 + progress * 14}
                fill="#22c55e"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              {/* Highlight on top bud */}
              <motion.ellipse
                cx={98}
                cy={groundY - 32 - progress * 80}
                rx={3 + progress * 8}
                ry={2 + progress * 6}
                fill="#4ade80"
                opacity={0.6}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Small floating particles around seedling */}
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={`seedling-particle-${i}`}
                  cx={90 + i * 10}
                  cy={groundY - 25 - progress * 50}
                  r={2}
                  fill="#34d399"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    y: [-10, -25, -40]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.7
                  }}
                />
              ))}
            </g>
          )}

          {/* Growing stage (30-100%) - Full tree */}
          {progress >= 0.30 && (
            <g>
              {/* Main trunk */}
              <motion.rect
                x={100 - trunkWidth / 2}
                y={groundY - trunkHeight}
                width={trunkWidth}
                height={trunkHeight}
                rx={trunkWidth / 4}
                fill={trunkColor}
                initial={false}
                animate={{
                  x: 100 - trunkWidth / 2,
                  y: groundY - trunkHeight,
                  width: trunkWidth,
                  height: trunkHeight,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Trunk shading */}
              <motion.rect
                x={100 - trunkWidth / 2}
                y={groundY - trunkHeight}
                width={trunkWidth / 3}
                height={trunkHeight}
                rx={trunkWidth / 6}
                fill={trunkColorDark}
                opacity="0.3"
                initial={false}
                animate={{
                  x: 100 - trunkWidth / 2,
                  y: groundY - trunkHeight,
                  width: trunkWidth / 3,
                  height: trunkHeight,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Branches (appear after 30% progress) */}
              {progress > 0.3 && (
                <g>
                  {/* Left branch */}
                  <motion.line
                    x1="100"
                    y1={groundY - trunkHeight * 0.6}
                    x2={100 - 15 - progress * 25}
                    y2={groundY - trunkHeight * 0.7}
                    stroke={trunkColor}
                    strokeWidth={3 + progress * 4}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {/* Right branch */}
                  <motion.line
                    x1="100"
                    y1={groundY - trunkHeight * 0.5}
                    x2={100 + 15 + progress * 25}
                    y2={groundY - trunkHeight * 0.6}
                    stroke={trunkColor}
                    strokeWidth={3 + progress * 4}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                  {/* Upper branches (appear after 50%) */}
                  {progress > 0.5 && (
                    <>
                      <motion.line
                        x1="100"
                        y1={groundY - trunkHeight * 0.75}
                        x2={100 - 10 - progress * 15}
                        y2={groundY - trunkHeight * 0.85}
                        stroke={trunkColor}
                        strokeWidth={2 + progress * 3}
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      <motion.line
                        x1="100"
                        y1={groundY - trunkHeight * 0.8}
                        x2={100 + 10 + progress * 15}
                        y2={groundY - trunkHeight * 0.88}
                        stroke={trunkColor}
                        strokeWidth={2 + progress * 3}
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      />
                    </>
                  )}
                </g>
              )}

              {/* Canopy - positioned at top of trunk */}
              <motion.g
                initial={false}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back layer of leaves */}
                <motion.ellipse
                  cx="100"
                  cy={groundY - trunkHeight - canopyHeight * 0.3}
                  rx={canopyWidth * 0.9}
                  ry={canopyHeight * 0.7}
                  fill={leafColorDark}
                  initial={false}
                  animate={{
                    cx: 100,
                    cy: groundY - trunkHeight - canopyHeight * 0.3,
                    rx: canopyWidth * 0.9,
                    ry: canopyHeight * 0.7,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Main canopy */}
                <motion.ellipse
                  cx="100"
                  cy={groundY - trunkHeight - canopyHeight * 0.4}
                  rx={canopyWidth}
                  ry={canopyHeight * 0.8}
                  fill={leafColor}
                  initial={false}
                  animate={{
                    cx: 100,
                    cy: groundY - trunkHeight - canopyHeight * 0.4,
                    rx: canopyWidth,
                    ry: canopyHeight * 0.8,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Left canopy bulge */}
                {progress > 0.4 && (
                  <motion.ellipse
                    cx={100 - canopyWidth * 0.5}
                    cy={groundY - trunkHeight - canopyHeight * 0.2}
                    rx={canopyWidth * 0.5}
                    ry={canopyHeight * 0.5}
                    fill={leafColor}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Right canopy bulge */}
                {progress > 0.4 && (
                  <motion.ellipse
                    cx={100 + canopyWidth * 0.5}
                    cy={groundY - trunkHeight - canopyHeight * 0.25}
                    rx={canopyWidth * 0.45}
                    ry={canopyHeight * 0.45}
                    fill={leafColor}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  />
                )}

                {/* Top canopy */}
                {progress > 0.5 && (
                  <motion.ellipse
                    cx="100"
                    cy={groundY - trunkHeight - canopyHeight * 0.8}
                    rx={canopyWidth * 0.6}
                    ry={canopyHeight * 0.5}
                    fill={leafColor}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Highlight spots on canopy */}
                {progress > 0.3 && (
                  <>
                    <motion.circle
                      cx={100 - canopyWidth * 0.3}
                      cy={groundY - trunkHeight - canopyHeight * 0.5}
                      r={canopyWidth * 0.15}
                      fill={isFinalStretch ? '#eab308' : '#6ee7b7'}
                      opacity="0.6"
                      animate={{ opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.circle
                      cx={100 + canopyWidth * 0.2}
                      cy={groundY - trunkHeight - canopyHeight * 0.6}
                      r={canopyWidth * 0.1}
                      fill={isFinalStretch ? '#eab308' : '#6ee7b7'}
                      opacity="0.5"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    />
                  </>
                )}
              </motion.g>

              {/* Glow effect for final stretch */}
              {isFinalStretch && (
                <motion.ellipse
                  cx="100"
                  cy={groundY - trunkHeight - canopyHeight * 0.4}
                  rx={canopyWidth + 15}
                  ry={canopyHeight + 10}
                  fill="none"
                  stroke="#d4a017"
                  strokeWidth="3"
                  opacity="0.4"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    rx: [canopyWidth + 10, canopyWidth + 20, canopyWidth + 10],
                    ry: [canopyHeight + 5, canopyHeight + 15, canopyHeight + 5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Sparkles for final stretch */}
              {isFinalStretch && [0, 1, 2, 3, 4, 5].map((i) => {
                const angle = (i / 6) * Math.PI * 2;
                const radius = canopyWidth * 0.8;
                const cx = 100 + Math.cos(angle) * radius;
                const cy = groundY - trunkHeight - canopyHeight * 0.4 + Math.sin(angle) * canopyHeight * 0.6;
                return (
                  <motion.circle
                    key={`sparkle-${i}`}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#fbbf24"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.2, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.25,
                    }}
                  />
                );
              })}
            </g>
          )}
        </svg>
      </motion.div>

      {/* Progress Bar and Phase Indicator (hidden in final stretch) */}
      {!isFinalStretch && (
        <div className="absolute bottom-6 left-6 right-6">
          {/* Current phase progress */}
          <div className="text-sm text-center text-forest-300 mb-2">
            {phaseProgress}% through {currentPhase.name}{' '}
            <span className="text-forest-400">
              ({phase === 1 && 'Water to sprout!'}
              {phase === 2 && 'Keep growing!'}
              {phase === 3 && 'Almost there!'})
            </span>
          </div>
          <div className="h-3 bg-forest-700 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-forest-400 to-forest-300 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${phaseProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Phase indicator */}
          <div className="flex items-center justify-between gap-1">
            {[
              { num: 1, name: 'Seedling' },
              { num: 2, name: 'Growing' },
              { num: 3, name: 'Maturing' },
              { num: 4, name: 'Final' },
            ].map((p, idx) => (
              <div key={p.num} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  {/* Phase dot */}
                  <div
                    className={`w-4 h-4 rounded-full flex-shrink-0 border-2 ${
                      phase > p.num
                        ? 'bg-forest-400 border-forest-400'
                        : phase === p.num
                        ? 'bg-forest-500 border-forest-300 ring-2 ring-forest-400/50'
                        : 'bg-forest-800 border-forest-600'
                    }`}
                  />
                  {/* Connecting line (not on last item) */}
                  {idx < 3 && (
                    <div
                      className={`h-1 flex-1 ${
                        phase > p.num ? 'bg-forest-400' : 'bg-forest-700'
                      }`}
                    />
                  )}
                </div>
                {/* Phase label */}
                <span
                  className={`text-xs mt-1 ${
                    phase === p.num ? 'text-forest-300 font-medium' : 'text-forest-500'
                  }`}
                >
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Stretch Message */}
      {isFinalStretch && (
        <motion.div
          className="absolute bottom-8 text-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-2xl font-bold text-gold-400 text-glow-gold">
            Reach the treetop!
          </span>
        </motion.div>
      )}
    </div>
  );
}
