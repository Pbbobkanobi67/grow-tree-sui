'use client';

import { motion } from 'framer-motion';
import { PHASES } from '@/lib/constants';

interface TreeVisualizationProps {
  phase: number;
  phaseProgress: number;
}

export function TreeVisualization({ phase, phaseProgress }: TreeVisualizationProps) {
  const currentPhase = PHASES[phase as keyof typeof PHASES] || PHASES[1];
  const isFinalStretch = phase === 4;
  const treeScale = 0.5 + (phase / 4) * 0.5;

  return (
    <div className={elative flex flex-col items-center justify-center p-8 rounded-3xl min-h-[400px]  bg-gradient-to-b from-sky-100 to-green-50}>
      
      {/* Phase Badge */}
      <div className={bsolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium  }>
        {currentPhase.emoji} {currentPhase.name}
      </div>

      {/* Tree */}
      <motion.div
        className="relative"
        animate={{ scale: treeScale }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-[150px] animate-sway origin-bottom">
          {phase === 1 && 'ðŸŒ±'}
          {phase === 2 && 'ðŸŒ¿'}
          {phase === 3 && 'ðŸŒ³'}
          {phase === 4 && 'ðŸŒ³âœ¨'}
        </div>
      </motion.div>

      {/* Progress (hidden in final stretch) */}
      {!isFinalStretch && (
        <div className="absolute bottom-8 left-8 right-8">
          <div className="text-sm text-center text-green-700 mb-2">
            {phaseProgress}% through {currentPhase.name}
          </div>
          <div className="h-3 bg-green-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: ${phaseProgress}% }}
            />
          </div>
        </div>
      )}

      {/* Final Stretch Message */}
      {isFinalStretch && (
        <motion.div
          className="absolute bottom-8 text-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <span className="text-2xl font-bold text-yellow-500">
            ðŸ”¥ WHO WILL WIN?! ðŸ”¥
          </span>
        </motion.div>
      )}
    </div>
  );
}
