'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface GameObject {
  id: number;
  x: number;
  y: number;
  width: number;
  speed: number;
  type: 'log' | 'lilypad' | 'turtle';
}

interface Lane {
  y: number;
  type: 'safe' | 'water' | 'road' | 'goal';
  objects: GameObject[];
  direction: 1 | -1;
}

const GAME_WIDTH = 560;
const GAME_HEIGHT = 600;
const CELL_SIZE = 40;
const FROG_SIZE = 36;
const LANES_COUNT = 13;

// Lane configuration from bottom to top
const LANE_CONFIG: Array<{ type: Lane['type']; objects?: number; speed?: number; direction?: 1 | -1 }> = [
  { type: 'safe' }, // Start zone
  { type: 'road', objects: 3, speed: 2, direction: 1 },
  { type: 'road', objects: 2, speed: 3, direction: -1 },
  { type: 'road', objects: 3, speed: 1.5, direction: 1 },
  { type: 'safe' }, // Middle safe zone
  { type: 'water', objects: 3, speed: 1.5, direction: -1 },
  { type: 'water', objects: 2, speed: 2, direction: 1 },
  { type: 'water', objects: 4, speed: 1, direction: -1 },
  { type: 'water', objects: 2, speed: 2.5, direction: 1 },
  { type: 'water', objects: 3, speed: 1.5, direction: -1 },
  { type: 'safe' }, // Pre-goal safe zone
  { type: 'goal' }, // Enchanted Forest goal
  { type: 'goal' }, // Top decoration
];

interface FroggerGameProps {
  onGameOver?: (score: number) => void;
  onWin?: (score: number) => void;
}

export function FroggerGame({ onGameOver, onWin }: FroggerGameProps) {
  const [frogX, setFrogX] = useState(GAME_WIDTH / 2 - FROG_SIZE / 2);
  const [frogY, setFrogY] = useState(GAME_HEIGHT - CELL_SIZE - 10);
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [highestY, setHighestY] = useState(GAME_HEIGHT);
  const [isOnObject, setIsOnObject] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Initialize lanes
  useEffect(() => {
    const initialLanes: Lane[] = LANE_CONFIG.map((config, index) => {
      const y = GAME_HEIGHT - (index + 1) * CELL_SIZE;
      const objects: GameObject[] = [];

      if (config.objects && config.speed) {
        for (let i = 0; i < config.objects; i++) {
          const width = config.type === 'water' ? 80 + Math.random() * 40 : 60;
          objects.push({
            id: index * 100 + i,
            x: (GAME_WIDTH / config.objects) * i + Math.random() * 50,
            y,
            width,
            speed: config.speed * (config.direction || 1),
            type: config.type === 'water' ? (Math.random() > 0.7 ? 'turtle' : 'log') : 'log',
          });
        }
      }

      return {
        y,
        type: config.type,
        objects,
        direction: config.direction || 1,
      };
    });
    setLanes(initialLanes);
  }, []);

  // Reset frog position
  const resetFrog = useCallback(() => {
    setFrogX(GAME_WIDTH / 2 - FROG_SIZE / 2);
    setFrogY(GAME_HEIGHT - CELL_SIZE - 10);
    setHighestY(GAME_HEIGHT);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || won) return;

      const step = CELL_SIZE;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setFrogY(prev => Math.max(0, prev - step));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setFrogY(prev => Math.min(GAME_HEIGHT - CELL_SIZE, prev + step));
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setFrogX(prev => Math.max(0, prev - step));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setFrogX(prev => Math.min(GAME_WIDTH - FROG_SIZE, prev + step));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, won]);

  // Score for progress
  useEffect(() => {
    if (frogY < highestY) {
      setHighestY(frogY);
      setScore(prev => prev + 10);
    }
  }, [frogY, highestY]);

  // Game loop
  useEffect(() => {
    if (gameOver || won) return;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 16; // Normalize to ~60fps
      lastTimeRef.current = timestamp;

      // Move objects
      setLanes(prevLanes =>
        prevLanes.map(lane => ({
          ...lane,
          objects: lane.objects.map(obj => {
            let newX = obj.x + obj.speed * delta;

            // Wrap around
            if (newX > GAME_WIDTH + 50) newX = -obj.width;
            if (newX < -obj.width - 50) newX = GAME_WIDTH;

            return { ...obj, x: newX };
          }),
        }))
      );

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameOver, won]);

  // Collision detection
  useEffect(() => {
    if (gameOver || won) return;

    const frogCenterX = frogX + FROG_SIZE / 2;
    const frogCenterY = frogY + FROG_SIZE / 2;
    const laneIndex = Math.floor((GAME_HEIGHT - frogY) / CELL_SIZE) - 1;

    if (laneIndex < 0 || laneIndex >= lanes.length) return;

    const currentLane = lanes[laneIndex];

    // Check for goal
    if (currentLane?.type === 'goal') {
      setWon(true);
      setScore(prev => prev + 500);
      onWin?.(score + 500);
      return;
    }

    // Check water lanes
    if (currentLane?.type === 'water') {
      let onLog = false;
      let logSpeed = 0;

      for (const obj of currentLane.objects) {
        if (
          frogCenterX > obj.x &&
          frogCenterX < obj.x + obj.width &&
          Math.abs(frogCenterY - (obj.y + CELL_SIZE / 2)) < CELL_SIZE / 2
        ) {
          onLog = true;
          logSpeed = obj.speed;
          break;
        }
      }

      setIsOnObject(onLog);

      if (onLog) {
        // Move frog with log
        setFrogX(prev => {
          const newX = prev + logSpeed * 0.5;
          if (newX < -FROG_SIZE || newX > GAME_WIDTH) {
            // Fell off screen
            return prev;
          }
          return newX;
        });
      } else {
        // Fell in water
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            onGameOver?.(score);
          } else {
            resetFrog();
          }
          return newLives;
        });
      }
    } else {
      setIsOnObject(false);
    }

    // Check road collisions (cars would go here)
    if (currentLane?.type === 'road') {
      for (const obj of currentLane.objects) {
        if (
          frogCenterX > obj.x &&
          frogCenterX < obj.x + obj.width &&
          Math.abs(frogCenterY - (obj.y + CELL_SIZE / 2)) < CELL_SIZE / 2
        ) {
          // Hit by car
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameOver(true);
              onGameOver?.(score);
            } else {
              resetFrog();
            }
            return newLives;
          });
          break;
        }
      }
    }
  }, [frogX, frogY, lanes, gameOver, won, score, onGameOver, onWin, resetFrog]);

  // Check bounds
  useEffect(() => {
    if (frogX < -FROG_SIZE / 2 || frogX > GAME_WIDTH - FROG_SIZE / 2) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
          onGameOver?.(score);
        } else {
          resetFrog();
        }
        return newLives;
      });
    }
  }, [frogX, score, onGameOver, resetFrog]);

  const restartGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    resetFrog();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score and Lives */}
      <div className="flex gap-8 text-lg font-bold">
        <div className="text-forest-300">
          Score: <span className="text-gold-400">{score}</span>
        </div>
        <div className="text-forest-300">
          Lives: <span className="text-red-400">{'🐸'.repeat(lives)}</span>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameRef}
        className="relative overflow-hidden rounded-xl border-4 border-forest-600 shadow-2xl"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        tabIndex={0}
      >
        {/* Background layers */}
        {lanes.map((lane, index) => (
          <div
            key={index}
            className={`absolute w-full ${
              lane.type === 'goal'
                ? 'bg-gradient-to-t from-emerald-800 to-emerald-600'
                : lane.type === 'safe'
                ? 'bg-gradient-to-b from-green-700 to-green-800'
                : lane.type === 'water'
                ? 'bg-blue-600'
                : 'bg-gray-700'
            }`}
            style={{
              top: lane.y,
              height: CELL_SIZE,
            }}
          >
            {/* Water ripples */}
            {lane.type === 'water' && (
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
              </div>
            )}
            {/* Goal decorations (trees) */}
            {lane.type === 'goal' && (
              <div className="absolute inset-0 flex justify-around items-center text-2xl">
                🌲🌳🌲🌳🌲🌳🌲🌳🌲🌳🌲🌳🌲
              </div>
            )}
          </div>
        ))}

        {/* Objects (logs, cars, etc.) */}
        {lanes.map(lane =>
          lane.objects.map(obj => (
            <motion.div
              key={obj.id}
              className={`absolute rounded ${
                lane.type === 'water'
                  ? obj.type === 'turtle'
                    ? 'bg-green-700'
                    : 'bg-amber-800'
                  : 'bg-red-600'
              } flex items-center justify-center`}
              style={{
                left: obj.x,
                top: obj.y + 4,
                width: obj.width,
                height: CELL_SIZE - 8,
              }}
            >
              {lane.type === 'water' ? (
                obj.type === 'turtle' ? (
                  <span className="text-lg">🐢🐢</span>
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-amber-700 to-amber-900 rounded flex items-center justify-center">
                    <div className="text-amber-600 text-xs">~~~</div>
                  </div>
                )
              ) : (
                <span className="text-xl">{obj.speed > 0 ? '🚗' : '🚙'}</span>
              )}
            </motion.div>
          ))
        )}

        {/* Frog */}
        <motion.div
          className="absolute z-20 flex items-center justify-center text-3xl"
          style={{
            left: frogX,
            top: frogY,
            width: FROG_SIZE,
            height: FROG_SIZE,
          }}
          animate={{
            scale: isOnObject ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          🐸
        </motion.div>

        {/* Game Over Overlay */}
        {(gameOver || won) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30"
          >
            <div className={`text-4xl font-bold mb-4 ${won ? 'text-gold-400' : 'text-red-500'}`}>
              {won ? '🎉 YOU MADE IT! 🎉' : '💀 GAME OVER 💀'}
            </div>
            <div className="text-2xl text-forest-300 mb-6">
              Final Score: <span className="text-gold-400">{score}</span>
            </div>
            <button
              onClick={restartGame}
              className="px-6 py-3 bg-forest-600 hover:bg-forest-500 text-white rounded-xl font-bold text-lg transition-all"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </div>

      {/* Controls hint */}
      <div className="text-forest-400 text-sm text-center">
        Use <span className="text-forest-200 font-bold">Arrow Keys</span> or{' '}
        <span className="text-forest-200 font-bold">WASD</span> to move
      </div>
    </div>
  );
}
