'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

const GAME_WIDTH = 560;
const GAME_HEIGHT = 520;
const CELL_SIZE = 40;
const FROG_SIZE = 32;
const ROWS = 13;

// Row types from bottom (0) to top (12)
const ROW_TYPES = [
  'safe',   // 0 - Start
  'road',   // 1
  'road',   // 2
  'road',   // 3
  'safe',   // 4 - Middle safe
  'water',  // 5
  'water',  // 6
  'water',  // 7
  'water',  // 8
  'water',  // 9
  'safe',   // 10 - Pre-goal safe
  'goal',   // 11 - Goal
  'goal',   // 12 - Decoration
];

interface MovingObject {
  id: number;
  x: number;
  width: number;
  speed: number;
}

interface FroggerGameProps {
  onGameOver?: (score: number) => void;
  onWin?: (score: number) => void;
}

export function FroggerGame({ onGameOver, onWin }: FroggerGameProps) {
  const [frogRow, setFrogRow] = useState(0);
  const [frogCol, setFrogCol] = useState(7); // Start in middle (0-13 columns)
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [maxRow, setMaxRow] = useState(0);

  // Moving objects per row
  const [objects, setObjects] = useState<Record<number, MovingObject[]>>({});
  const gameLoopRef = useRef<number>();

  // Initialize objects
  useEffect(() => {
    const initialObjects: Record<number, MovingObject[]> = {};

    // Road rows (1-3) - cars
    initialObjects[1] = [
      { id: 1, x: 0, width: 60, speed: 2 },
      { id: 2, x: 200, width: 60, speed: 2 },
      { id: 3, x: 400, width: 60, speed: 2 },
    ];
    initialObjects[2] = [
      { id: 4, x: 100, width: 80, speed: -2.5 },
      { id: 5, x: 350, width: 80, speed: -2.5 },
    ];
    initialObjects[3] = [
      { id: 6, x: 50, width: 60, speed: 1.5 },
      { id: 7, x: 250, width: 60, speed: 1.5 },
      { id: 8, x: 450, width: 60, speed: 1.5 },
    ];

    // Water rows (5-9) - logs
    initialObjects[5] = [
      { id: 10, x: 0, width: 120, speed: -1.5 },
      { id: 11, x: 250, width: 120, speed: -1.5 },
      { id: 12, x: 450, width: 90, speed: -1.5 },
    ];
    initialObjects[6] = [
      { id: 13, x: 50, width: 100, speed: 2 },
      { id: 14, x: 280, width: 100, speed: 2 },
    ];
    initialObjects[7] = [
      { id: 15, x: 0, width: 150, speed: -1 },
      { id: 16, x: 300, width: 150, speed: -1 },
    ];
    initialObjects[8] = [
      { id: 17, x: 100, width: 90, speed: 2.5 },
      { id: 18, x: 350, width: 90, speed: 2.5 },
    ];
    initialObjects[9] = [
      { id: 19, x: 0, width: 130, speed: -1.5 },
      { id: 20, x: 220, width: 130, speed: -1.5 },
      { id: 21, x: 440, width: 100, speed: -1.5 },
    ];

    setObjects(initialObjects);
  }, []);

  // Game loop - move objects
  useEffect(() => {
    if (gameOver || won) return;

    const loop = () => {
      setObjects(prev => {
        const updated = { ...prev };
        for (const row in updated) {
          updated[row] = updated[row].map(obj => {
            let newX = obj.x + obj.speed;
            // Wrap around
            if (newX > GAME_WIDTH) newX = -obj.width;
            if (newX < -obj.width) newX = GAME_WIDTH;
            return { ...obj, x: newX };
          });
        }
        return updated;
      });
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameOver, won]);

  // Get frog pixel position
  const frogX = frogCol * CELL_SIZE;
  const frogY = GAME_HEIGHT - (frogRow + 1) * CELL_SIZE;

  // Check if frog is on a log (for water rows)
  const isOnLog = useCallback((row: number, pixelX: number): { onLog: boolean; logSpeed: number } => {
    const rowObjects = objects[row];
    if (!rowObjects) return { onLog: false, logSpeed: 0 };

    const frogLeft = pixelX;
    const frogRight = pixelX + FROG_SIZE;

    for (const obj of rowObjects) {
      const objLeft = obj.x;
      const objRight = obj.x + obj.width;

      // Check overlap with generous margin
      if (frogRight > objLeft + 5 && frogLeft < objRight - 5) {
        return { onLog: true, logSpeed: obj.speed };
      }
    }
    return { onLog: false, logSpeed: 0 };
  }, [objects]);

  // Check if frog hit a car
  const hitCar = useCallback((row: number, pixelX: number): boolean => {
    const rowObjects = objects[row];
    if (!rowObjects) return false;

    const frogLeft = pixelX + 4;
    const frogRight = pixelX + FROG_SIZE - 4;

    for (const obj of rowObjects) {
      const objLeft = obj.x + 4;
      const objRight = obj.x + obj.width - 4;

      if (frogRight > objLeft && frogLeft < objRight) {
        return true;
      }
    }
    return false;
  }, [objects]);

  // Handle death
  const die = useCallback(() => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameOver(true);
        onGameOver?.(score);
      }
      return newLives;
    });
    // Reset position
    setFrogRow(0);
    setFrogCol(7);
  }, [score, onGameOver]);

  // Collision detection - runs on movement, not every frame
  useEffect(() => {
    if (gameOver || won) return;

    const rowType = ROW_TYPES[frogRow];

    if (rowType === 'road') {
      if (hitCar(frogRow, frogX)) {
        die();
      }
    }

    if (rowType === 'goal' && frogRow >= 11) {
      setWon(true);
      setScore(prev => prev + 500);
      onWin?.(score + 500);
    }
  }, [frogRow, frogX, gameOver, won, hitCar, die, score, onWin]);

  // Water row - check if on log and move with it (runs every frame)
  const waterGraceRef = useRef<number>(0);

  useEffect(() => {
    if (gameOver || won) return;
    if (ROW_TYPES[frogRow] !== 'water') {
      waterGraceRef.current = 0;
      return;
    }

    // Small grace period when first entering water (150ms)
    waterGraceRef.current = 150;

    const checkWater = () => {
      const { onLog, logSpeed } = isOnLog(frogRow, frogX);

      if (!onLog) {
        // Reduce grace period
        if (waterGraceRef.current > 0) {
          waterGraceRef.current -= 16;
          return; // Don't die yet
        }
        die();
      } else {
        // On log - reset grace and move with it
        waterGraceRef.current = 50; // Small grace for timing issues
        setFrogCol(prev => {
          const newCol = prev + logSpeed / CELL_SIZE;
          if (newCol < -1 || newCol > 14) {
            setTimeout(die, 50);
            return prev;
          }
          return newCol;
        });
      }
    };

    const interval = setInterval(checkWater, 16); // ~60fps
    return () => clearInterval(interval);
  }, [frogRow, gameOver, won, isOnLog, frogX, die]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver || won) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setFrogRow(prev => {
            const newRow = Math.min(ROWS - 1, prev + 1);
            if (newRow > maxRow) {
              setMaxRow(newRow);
              setScore(s => s + 10);
            }
            return newRow;
          });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setFrogRow(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setFrogCol(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setFrogCol(prev => Math.min(13, prev + 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver, won, maxRow]);

  // Restart
  const restart = () => {
    setFrogRow(0);
    setFrogCol(7);
    setScore(0);
    setLives(3);
    setMaxRow(0);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* HUD */}
      <div className="flex gap-8 text-lg font-bold">
        <div className="text-forest-300">
          Score: <span className="text-gold-400">{score}</span>
        </div>
        <div className="text-forest-300">
          Lives: <span className="text-red-400">{'🐸'.repeat(Math.max(0, lives))}</span>
        </div>
      </div>

      {/* Game Board */}
      <div
        className="relative overflow-hidden rounded-xl border-4 border-forest-600"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Rows */}
        {ROW_TYPES.map((type, row) => (
          <div
            key={row}
            className={`absolute w-full ${
              type === 'goal' ? 'bg-gradient-to-b from-emerald-600 to-emerald-700' :
              type === 'safe' ? 'bg-green-700' :
              type === 'water' ? 'bg-blue-500' :
              'bg-gray-600'
            }`}
            style={{
              bottom: row * CELL_SIZE,
              height: CELL_SIZE,
            }}
          >
            {/* Goal decoration */}
            {type === 'goal' && (
              <div className="flex justify-around items-center h-full text-xl">
                🌲🌳🌲🌳🌲🌳🌲🌳🌲🌳🌲🌳🌲🌳
              </div>
            )}
          </div>
        ))}

        {/* Moving Objects */}
        {Object.entries(objects).map(([row, rowObjects]) =>
          rowObjects.map(obj => {
            const rowNum = parseInt(row);
            const isWater = ROW_TYPES[rowNum] === 'water';
            return (
              <div
                key={obj.id}
                className={`absolute rounded ${isWater ? 'bg-amber-700' : 'bg-red-500'}`}
                style={{
                  left: obj.x,
                  bottom: rowNum * CELL_SIZE + 4,
                  width: obj.width,
                  height: CELL_SIZE - 8,
                }}
              >
                {isWater ? (
                  <div className="w-full h-full flex items-center justify-center text-amber-900 text-xs">
                    ═══
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">
                    {obj.speed > 0 ? '🚗' : '🚙'}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Frog */}
        <motion.div
          className="absolute text-2xl flex items-center justify-center"
          style={{
            left: frogX,
            bottom: frogRow * CELL_SIZE + 4,
            width: FROG_SIZE,
            height: FROG_SIZE,
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.15 }}
          key={`${frogRow}-${Math.floor(frogCol)}`}
        >
          🐸
        </motion.div>

        {/* Game Over / Win Overlay */}
        {(gameOver || won) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            <div className={`text-3xl font-bold mb-4 ${won ? 'text-gold-400' : 'text-red-400'}`}>
              {won ? '🎉 YOU WON! 🎉' : '💀 GAME OVER 💀'}
            </div>
            <div className="text-xl text-white mb-4">Score: {score}</div>
            <button
              onClick={restart}
              className="px-6 py-3 bg-forest-600 hover:bg-forest-500 text-white rounded-xl font-bold"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-forest-400 text-sm">
        Arrow Keys or WASD to move
      </div>
    </div>
  );
}
