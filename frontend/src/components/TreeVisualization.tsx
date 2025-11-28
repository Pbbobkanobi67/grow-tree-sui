'use client';

import { motion } from 'framer-motion';
import { PHASES } from '@/lib/constants';

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

// Pine tree branch layer (triangular)
function PineLayer({
  cx,
  y,
  width,
  height,
  delay,
  color,
  shadowColor,
}: {
  cx: number;
  y: number;
  width: number;
  height: number;
  delay: number;
  color: string;
  shadowColor: string;
}) {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay, ease: 'backOut' }}
      style={{ transformOrigin: `${cx}px ${y + height}px` }}
    >
      {/* Shadow/depth layer */}
      <polygon
        points={`${cx} ${y}, ${cx + width / 2 + 3} ${y + height + 2}, ${cx - width / 2 - 3} ${y + height + 2}`}
        fill={shadowColor}
      />
      {/* Main layer */}
      <polygon
        points={`${cx} ${y}, ${cx + width / 2} ${y + height}, ${cx - width / 2} ${y + height}`}
        fill={color}
      />
      {/* Highlight */}
      <polygon
        points={`${cx} ${y}, ${cx + width / 4} ${y + height * 0.6}, ${cx - width / 6} ${y + height * 0.5}`}
        fill="rgba(255,255,255,0.1)"
      />
    </motion.g>
  );
}

// Tree trunk
function Trunk({
  cx,
  topY,
  bottomY,
  width,
  delay,
}: {
  cx: number;
  topY: number;
  bottomY: number;
  width: number;
  delay: number;
}) {
  return (
    <motion.g
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      style={{ transformOrigin: `${cx}px ${bottomY}px` }}
    >
      {/* Trunk shadow */}
      <rect
        x={cx - width / 2 - 2}
        y={topY}
        width={width + 4}
        height={bottomY - topY}
        fill="#3E2723"
        rx={2}
      />
      {/* Main trunk */}
      <rect
        x={cx - width / 2}
        y={topY}
        width={width}
        height={bottomY - topY}
        fill="#5D4037"
        rx={2}
      />
      {/* Trunk highlight */}
      <rect
        x={cx - width / 4}
        y={topY}
        width={width / 3}
        height={bottomY - topY}
        fill="#6D4C41"
        rx={1}
      />
    </motion.g>
  );
}

// Small seedling sprout
function Seedling({ cx, groundY, progress }: { cx: number; groundY: number; progress: number }) {
  const height = 10 + progress * 100;
  const leafSize = 5 + progress * 30;

  return (
    <motion.g
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stem */}
      <motion.line
        x1={cx}
        y1={groundY}
        x2={cx}
        y2={groundY - height}
        stroke="#2E7D32"
        strokeWidth={2 + progress * 4}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
      {/* First leaves */}
      <motion.ellipse
        cx={cx - leafSize / 2}
        cy={groundY - height + 5}
        rx={leafSize * 0.4}
        ry={leafSize * 0.8}
        fill="#4CAF50"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: -30 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ transformOrigin: `${cx}px ${groundY - height + 5}px` }}
      />
      <motion.ellipse
        cx={cx + leafSize / 2}
        cy={groundY - height + 5}
        rx={leafSize * 0.4}
        ry={leafSize * 0.8}
        fill="#4CAF50"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: 30 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{ transformOrigin: `${cx}px ${groundY - height + 5}px` }}
      />
      {/* Top sprout */}
      <motion.ellipse
        cx={cx}
        cy={groundY - height - leafSize * 0.3}
        rx={leafSize * 0.3}
        ry={leafSize * 0.6}
        fill="#66BB6A"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      />
    </motion.g>
  );
}

// Floating particle (pine needle or sparkle)
function Particle({ x, delay, isFinal }: { x: number; delay: number; isFinal: boolean }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.8, 0],
        y: [-20, -60, -100],
        x: [0, (Math.random() - 0.5) * 30],
        rotate: [0, 360],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    >
      {isFinal ? (
        // Golden sparkle for final stretch
        <polygon
          points={`${x},0 ${x + 2},4 ${x + 6},4 ${x + 3},7 ${x + 4},12 ${x},9 ${x - 4},12 ${x - 3},7 ${x - 6},4 ${x - 2},4`}
          fill="#FFD700"
          transform={`translate(0, 100)`}
        />
      ) : (
        // Pine needle
        <ellipse
          cx={x}
          cy={100}
          rx={1.5}
          ry={4}
          fill="#2E7D32"
        />
      )}
    </motion.g>
  );
}

export function TreeVisualization({ phase, phaseProgress }: TreeVisualizationProps) {
  const currentPhase = PHASES[phase as keyof typeof PHASES] || PHASES[1];
  const isFinalStretch = phase === 4;
  const overallProgress = calculateOverallProgress(phase, phaseProgress);
  const progress = overallProgress / 100; // 0 to 1

  // Tree dimensions based on progress
  const cx = 100;
  const groundY = 145;
  const maxTreeHeight = 110;
  const treeHeight = maxTreeHeight * Math.min(1, progress * 1.2);
  const trunkWidth = 8 + progress * 12;
  const trunkHeight = 15 + progress * 25;
  const trunkTop = groundY - trunkHeight;

  // Pine layer colors
  const baseGreen = isFinalStretch ? '#1B5E20' : '#2E7D32';
  const lightGreen = isFinalStretch ? '#2E7D32' : '#388E3C';
  const shadowGreen = isFinalStretch ? '#0D3311' : '#1B5E20';

  // Calculate number of layers based on progress
  const numLayers = Math.floor(progress * 6) + 1; // 1-7 layers

  // Generate pine layers
  const layers = [];
  for (let i = 0; i < Math.min(numLayers, 7); i++) {
    const layerProgress = (i + 1) / 7;
    const layerY = trunkTop - (i * treeHeight / 7) - 5;
    const layerWidth = 20 + (7 - i) * 12 - (1 - progress) * 20;
    const layerHeight = 18 + (7 - i) * 3;

    if (progress > layerProgress * 0.8) {
      layers.push({
        y: layerY,
        width: Math.max(10, layerWidth),
        height: layerHeight,
        delay: i * 0.15,
      });
    }
  }

  // Show seedling for very early progress
  const showSeedling = progress < 0.15;

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-3xl min-h-[420px] bg-gradient-to-b from-forest-900 via-forest-800 to-forest-900 border border-forest-600/50 overflow-hidden ${isFinalStretch ? 'final-stretch-glow' : 'card-glow'}`}>

      {/* Forest floor gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-forest-950 to-transparent" />

      {/* Phase Badge */}
      <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-medium z-10 ${isFinalStretch ? 'bg-gold-500/20 text-gold-400 border border-gold-500/50' : 'bg-forest-700/50 text-forest-300 border border-forest-600/50'}`}>
        {currentPhase.name}
      </div>

      {/* Progress percentage */}
      <div className="absolute top-4 right-4 text-sm text-forest-400">
        {overallProgress >= 90 ? (
          // Mystery mode after 90% - show scrambled/hidden percentage
          <motion.span
            className="relative inline-block font-mono text-gold-400"
            animate={{
              opacity: [1, 0.7, 1, 0.8, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          >
            <span className="relative">
              {/* Scrambled display */}
              <motion.span
                animate={{
                  opacity: [1, 0, 1, 0, 1],
                }}
                transition={{
                  duration: 0.15,
                  repeat: Infinity,
                  repeatDelay: 1 + Math.random() * 2,
                }}
              >
                ??%
              </motion.span>
            </span>
          </motion.span>
        ) : (
          <span>{Math.round(overallProgress)}%</span>
        )}
      </div>

      {/* Floating particles */}
      {progress > 0.2 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <Particle
              key={i}
              x={60 + i * 25}
              delay={i * 0.8}
              isFinal={isFinalStretch}
            />
          ))}
        </svg>
      )}

      {/* Main Tree SVG */}
      <svg viewBox="0 0 200 180" className="w-80 h-72">
        {/* Ground */}
        <ellipse
          cx={cx}
          cy={groundY + 5}
          rx={60}
          ry={8}
          fill="#1a3d1a"
        />
        <ellipse
          cx={cx}
          cy={groundY + 2}
          rx={45}
          ry={5}
          fill="#0d260d"
        />

        {showSeedling ? (
          // Show seedling for early stage
          <Seedling cx={cx} groundY={groundY} progress={progress * 6} />
        ) : (
          // Show full pine tree
          <g>
            {/* Trunk */}
            <Trunk
              cx={cx}
              topY={trunkTop}
              bottomY={groundY}
              width={trunkWidth}
              delay={0}
            />

            {/* Pine layers (bottom to top) */}
            {layers.reverse().map((layer, i) => (
              <PineLayer
                key={i}
                cx={cx}
                y={layer.y}
                width={layer.width}
                height={layer.height}
                delay={layer.delay}
                color={i % 2 === 0 ? baseGreen : lightGreen}
                shadowColor={shadowGreen}
              />
            ))}

            {/* Tree top / Star area */}
            {progress > 0.9 && (
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {/* Top point */}
                <polygon
                  points={`${cx} ${trunkTop - treeHeight - 10}, ${cx + 8} ${trunkTop - treeHeight + 5}, ${cx - 8} ${trunkTop - treeHeight + 5}`}
                  fill={lightGreen}
                />
                {isFinalStretch && (
                  // Golden glow at top for final stretch
                  <motion.circle
                    cx={cx}
                    cy={trunkTop - treeHeight - 10}
                    r={8}
                    fill="#FFD700"
                    opacity={0.8}
                    animate={{
                      opacity: [0.6, 1, 0.6],
                      r: [6, 10, 6],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.g>
            )}
          </g>
        )}

        {/* Golden aura for final stretch */}
        {isFinalStretch && !showSeedling && (
          <motion.ellipse
            cx={cx}
            cy={trunkTop - treeHeight / 2}
            rx={50}
            ry={60}
            fill="none"
            stroke="#FFD700"
            strokeWidth={2}
            opacity={0.3}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              rx: [45, 55, 45],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </svg>

      {/* Progress Section */}
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
          <div className="h-2 bg-forest-700 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
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
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${
                      phase > p.num
                        ? 'bg-green-400 border-green-400'
                        : phase === p.num
                        ? 'bg-green-500 border-green-300 ring-2 ring-green-400/50'
                        : 'bg-forest-800 border-forest-600'
                    }`}
                  />
                  {idx < 3 && (
                    <div className={`h-0.5 flex-1 ${phase > p.num ? 'bg-green-400' : 'bg-forest-700'}`} />
                  )}
                </div>
                <span className={`text-xs mt-1 ${phase === p.num ? 'text-forest-300 font-medium' : 'text-forest-500'}`}>
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
          className="absolute bottom-6 text-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-xl font-bold text-gold-400 text-glow-gold">
            Reach the treetop!
          </span>
        </motion.div>
      )}
    </div>
  );
}
