'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface WheelSegment {
  label: string;
  multiplier: number;
  color: string;
  probability: number;
}

// Realistic odds with ~96.5% RTP (3.5% house edge)
const SEGMENTS: WheelSegment[] = [
  { label: 'BUST', multiplier: 0, color: '#991b1b', probability: 30 },
  { label: '0.5x', multiplier: 0.5, color: '#4a5568', probability: 25 },
  { label: '1x', multiplier: 1, color: '#374151', probability: 18 },
  { label: '1.5x', multiplier: 1.5, color: '#065f46', probability: 12 },
  { label: '2x', multiplier: 2, color: '#1e40af', probability: 8 },
  { label: '3x', multiplier: 3, color: '#5b21b6', probability: 4 },
  { label: '5x', multiplier: 5, color: '#9d174d', probability: 2 },
  { label: '10x', multiplier: 10, color: '#b45309', probability: 1 },
];

interface FortuneWheelProps {
  betAmount: bigint;
  onSpin: (multiplier: number, winAmount: bigint) => void;
  disabled?: boolean;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export function FortuneWheel({ betAmount, onSpin, disabled, isSpinning, setIsSpinning }: FortuneWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSegment | null>(null);

  const selectSegment = (): number => {
    const totalWeight = SEGMENTS.reduce((sum, seg) => sum + seg.probability, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < SEGMENTS.length; i++) {
      random -= SEGMENTS[i].probability;
      if (random <= 0) return i;
    }
    return 0;
  };

  const handleSpin = () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    setResult(null);

    const winningIndex = selectSegment();
    const segment = SEGMENTS[winningIndex];

    const segmentAngle = 360 / SEGMENTS.length;
    const segmentCenter = winningIndex * segmentAngle + segmentAngle / 2;

    // Calculate the final angle needed (where pointer aligns with segment center)
    // Pointer is at top (0°), segment centers are at segmentCenter degrees from start
    // To align: wheel rotation should put segment at 360 - segmentCenter (or equivalently -segmentCenter)
    const targetAngle = 360 - segmentCenter;

    // Account for current rotation - find how much MORE we need to rotate
    const currentAngle = rotation % 360;
    let additionalRotation = targetAngle - currentAngle;
    if (additionalRotation <= 0) additionalRotation += 360; // Always rotate forward

    // Add 5-7 full spins for drama
    const fullRotations = 5 + Math.floor(Math.random() * 3);
    const newRotation = rotation + fullRotations * 360 + additionalRotation;
    setRotation(newRotation);

    setTimeout(() => {
      setResult(segment);
      const winAmount = (betAmount * BigInt(Math.floor(segment.multiplier * 100))) / BigInt(100);
      onSpin(segment.multiplier, winAmount);
      setIsSpinning(false);
    }, 4000);
  };

  const segmentAngle = 360 / SEGMENTS.length;

  return (
    <div className="flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-30">
          <div
            className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[30px] border-l-transparent border-r-transparent border-t-gold-400"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
          />
        </div>

        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-400 via-amber-500 to-gold-600 p-1.5 shadow-2xl shadow-gold-500/30">
          <div className="w-full h-full rounded-full bg-forest-900 p-1">
            {/* Inner decorative ring */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-forest-700 to-forest-800 p-0.5">
              <div className="w-full h-full rounded-full bg-forest-900" />
            </div>
          </div>
        </div>

        {/* Spinning Wheel */}
        <motion.div
          className="absolute inset-4 rounded-full overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {SEGMENTS.map((segment, index) => {
              const startAngle = index * segmentAngle - 90;
              const endAngle = (index + 1) * segmentAngle - 90;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);

              const largeArc = segmentAngle > 180 ? 1 : 0;
              const pathD = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

              const textAngle = startAngle + segmentAngle / 2;
              const textRad = (textAngle * Math.PI) / 180;
              const textX = 50 + 33 * Math.cos(textRad);
              const textY = 50 + 33 * Math.sin(textRad);

              return (
                <g key={index}>
                  <path d={pathD} fill={segment.color} stroke="#0d1117" strokeWidth="0.8" />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
            {/* Center circle cutout for button */}
            <circle cx="50" cy="50" r="15" fill="#0f1a12" />
          </svg>
        </motion.div>

        {/* Center Button - Fixed position, doesn't rotate */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <button
            onClick={handleSpin}
            disabled={isSpinning || disabled}
            className={`pointer-events-auto w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center
              transition-all duration-200 transform
              ${isSpinning || disabled
                ? 'bg-gradient-to-b from-gray-500 to-gray-700 cursor-not-allowed scale-100'
                : 'bg-gradient-to-b from-gold-400 via-amber-500 to-amber-600 hover:from-gold-300 hover:via-amber-400 hover:to-amber-500 cursor-pointer hover:scale-105 active:scale-95'
              }
              shadow-lg shadow-black/50
              border-4 border-forest-900
            `}
            style={{
              boxShadow: isSpinning || disabled
                ? '0 4px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)'
                : '0 4px 20px rgba(251,191,36,0.4), inset 0 2px 4px rgba(255,255,255,0.3), 0 0 30px rgba(251,191,36,0.2)'
            }}
          >
            <span className={`font-black text-lg md:text-xl tracking-wider ${
              isSpinning || disabled ? 'text-gray-300' : 'text-forest-900'
            }`}
            style={{ textShadow: isSpinning || disabled ? 'none' : '0 1px 0 rgba(255,255,255,0.3)' }}
            >
              {isSpinning ? (
                <span className="animate-pulse">•••</span>
              ) : (
                'SPIN'
              )}
            </span>
          </button>
        </div>

        {/* Decorative lights around wheel */}
        <div className="absolute inset-0 rounded-full pointer-events-none">
          {[...Array(16)].map((_, i) => {
            const angle = (i * 360 / 16) * Math.PI / 180;
            const x = 50 + 48 * Math.cos(angle);
            const y = 50 + 48 * Math.sin(angle);
            return (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${isSpinning ? 'animate-pulse' : ''}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: i % 2 === 0 ? '#fbbf24' : '#f59e0b',
                  boxShadow: `0 0 ${isSpinning ? '8px' : '4px'} ${i % 2 === 0 ? '#fbbf24' : '#f59e0b'}`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Result Display */}
      {result && !isSpinning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`mt-8 px-8 py-4 rounded-2xl text-center ${
            result.multiplier >= 5
              ? 'bg-gradient-to-r from-gold-500/30 to-amber-500/30 border-2 border-gold-500'
              : result.multiplier >= 2
                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-500'
                : result.multiplier >= 1
                  ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-2 border-blue-500'
                  : 'bg-gradient-to-r from-red-500/30 to-rose-500/30 border-2 border-red-500'
          }`}
        >
          <div className="text-3xl font-black text-white mb-1">{result.label}</div>
          <div className={`text-lg font-bold ${
            result.multiplier >= 1 ? 'text-green-400' : 'text-red-400'
          }`}>
            {result.multiplier >= 1 ? '🎉 WIN!' : '💔 BUST'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
