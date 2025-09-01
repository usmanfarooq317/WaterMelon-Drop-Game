
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

// Responsive canvas dimensions
const BASE_WIDTH = 400;
const BASE_HEIGHT = 600;
const ORIGINAL_ASPECT_RATIO = BASE_HEIGHT / BASE_WIDTH; // 1.5
const ASPECT_RATIO = ORIGINAL_ASPECT_RATIO * 0.7; // Reduce height by 30% => 1.05
const CUP_TOP = 50;
const GRAVITY = 0.2;
const FRICTION = 0.98;
const ELASTICITY = 0.5;

const FRUIT_TYPES = [
  { name: 'Cherry', radius: 10, color: 'hsl(0, 100%, 50%)' },
  { name: 'Strawberry', radius: 15, color: 'hsl(10, 100%, 50%)' },
  { name: 'Grape', radius: 20, color: 'hsl(270, 100%, 50%)' },
  { name: 'Dekopon', radius: 25, color: 'hsl(30, 100%, 50%)' },
  { name: 'Persimmon', radius: 30, color: 'hsl(20, 100%, 50%)' },
  { name: 'Apple', radius: 35, color: 'hsl(0, 100%, 60%)' },
  { name: 'Pear', radius: 40, color: 'hsl(60, 100%, 50%)' },
  { name: 'Peach', radius: 45, color: 'hsl(15, 100%, 70%)' },
  { name: 'Pineapple', radius: 50, color: 'hsl(50, 100%, 50%)' },
  { name: 'Melon', radius: 55, color: 'hsl(120, 100%, 50%)' },
  { name: 'Watermelon', radius: 60, color: 'hsl(120, 100%, 30%)' },
];

interface Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: number;
  radius: number;
}

const WatermelonDropGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver' | 'waiting'>('waiting');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('watermelon-highScore') || '0');
  });
  const [rating, setRating] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: BASE_WIDTH, height: BASE_WIDTH * ASPECT_RATIO });

  const gameStateRef = useRef(gameState);
  const fruitsRef = useRef<Fruit[]>([]);
  const scoreRef = useRef(0);
  const nextFruitTypeRef = useRef(Math.floor(Math.random() * 5));
  const scaleRef = useRef(1); // Scaling factor for responsive canvas

  // Update canvas size on mount and resize
  const updateCanvasSize = useCallback(() => {
    const maxWidth = Math.min(window.innerWidth * 0.9, BASE_WIDTH);
    const height = maxWidth * ASPECT_RATIO; // Reduced height
    setCanvasSize({ width: maxWidth, height });
    scaleRef.current = maxWidth / BASE_WIDTH;
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  const getRating = (score: number) => {
    if (score > 1000) return 'A';
    if (score > 500) return 'B';
    if (score > 200) return 'C';
    if (score > 100) return 'D';
    return 'F';
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = scaleRef.current;
    const CUP_LEFT = 0;
    const CUP_RIGHT = canvasSize.width;
    const CUP_BOTTOM = canvasSize.height;
    const SCALED_CUP_TOP = CUP_TOP * scale;

    // Scale canvas for high-DPI displays
    canvas.width = canvasSize.width * window.devicePixelRatio;
    canvas.height = canvasSize.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
    gradient.addColorStop(0, 'hsl(220, 13%, 8%)');
    gradient.addColorStop(1, 'hsl(220, 13%, 12%)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    ctx.fillStyle = 'hsl(193, 76%, 56%)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % canvasSize.width;
      const y = (i * 41) % canvasSize.height;
      ctx.fillRect(x, y, 1 * scale, 1 * scale);
    }

    ctx.shadowColor = 'hsl(271, 81%, 56%)';
    ctx.shadowBlur = 10 * scale;
    ctx.strokeStyle = 'hsl(271, 81%, 56%)';
    ctx.lineWidth = 5 * scale;
    ctx.beginPath();
    ctx.moveTo(CUP_LEFT, CUP_BOTTOM);
    ctx.lineTo(CUP_LEFT, SCALED_CUP_TOP);
    ctx.moveTo(CUP_RIGHT, CUP_BOTTOM);
    ctx.lineTo(CUP_RIGHT, SCALED_CUP_TOP);
    ctx.moveTo(CUP_LEFT, CUP_BOTTOM);
    ctx.lineTo(CUP_RIGHT, CUP_BOTTOM);
    ctx.stroke();

    ctx.strokeStyle = 'hsl(0, 100%, 50%)';
    ctx.beginPath();
    ctx.moveTo(CUP_LEFT, SCALED_CUP_TOP);
    ctx.lineTo(CUP_RIGHT, SCALED_CUP_TOP);
    ctx.stroke();

    ctx.shadowBlur = 0;

    fruitsRef.current.forEach(fruit => {
      ctx.shadowColor = FRUIT_TYPES[fruit.type].color;
      ctx.shadowBlur = 15 * scale;
      ctx.fillStyle = FRUIT_TYPES[fruit.type].color;
      ctx.beginPath();
      ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    if (gameStateRef.current === 'playing') {
      const nextType = nextFruitTypeRef.current;
      ctx.fillStyle = FRUIT_TYPES[nextType].color;
      ctx.beginPath();
      ctx.arc(canvasSize.width / 2, 20 * scale, FRUIT_TYPES[nextType].radius * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    if (gameStateRef.current === 'gameOver') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      
      ctx.fillStyle = 'hsl(271, 81%, 56%)';
      ctx.font = `${32 * scale}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvasSize.width / 2, canvasSize.height / 2 - 40 * scale);
      
      ctx.fillStyle = 'hsl(193, 76%, 56%)';
      ctx.font = `${16 * scale}px monospace`;
      ctx.fillText(`Score: ${scoreRef.current}`, canvasSize.width / 2, canvasSize.height / 2);
      ctx.fillText(`Rating: ${rating}`, canvasSize.width / 2, canvasSize.height / 2 + 30 * scale);
    }

    ctx.fillStyle = 'hsl(322, 81%, 56%)';
    ctx.font = `bold ${24 * scale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(scoreRef.current.toString(), canvasSize.width / 2, SCALED_CUP_TOP);
  }, [rating, canvasSize]);

  const update = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    const scale = scaleRef.current;
    const CUP_LEFT = 0;
    const CUP_RIGHT = canvasSize.width;
    const CUP_BOTTOM = canvasSize.height;
    const SCALED_CUP_TOP = CUP_TOP * scale;
    const SCALED_GRAVITY = GRAVITY * scale;

    fruitsRef.current.forEach(fruit => {
      fruit.vy += SCALED_GRAVITY;
      fruit.x += fruit.vx;
      fruit.y += fruit.vy;
      fruit.vx *= FRICTION;
      fruit.vy *= FRICTION;

      if (fruit.x - fruit.radius < CUP_LEFT) {
        fruit.x = CUP_LEFT + fruit.radius;
        fruit.vx = -fruit.vx * ELASTICITY;
      }
      if (fruit.x + fruit.radius > CUP_RIGHT) {
        fruit.x = CUP_RIGHT - fruit.radius;
        fruit.vx = -fruit.vx * ELASTICITY;
      }
      if (fruit.y + fruit.radius > CUP_BOTTOM) {
        fruit.y = CUP_BOTTOM - fruit.radius;
        fruit.vy = -fruit.vy * ELASTICITY;
      }

      if (fruit.y - fruit.radius < SCALED_CUP_TOP) {
        setGameState('gameOver');
        gameStateRef.current = 'gameOver';
        setRating(getRating(scoreRef.current));
        return;
      }
    });

    for (let i = 0; i < fruitsRef.current.length; i++) {
      for (let j = i + 1; j < fruitsRef.current.length; j++) {
        const f1 = fruitsRef.current[i];
        const f2 = fruitsRef.current[j];
        const dx = f1.x - f2.x;
        const dy = f1.y - f2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < f1.radius + f2.radius) {
          if (f1.type === f2.type && f1.type < 10) {
            const newType = f1.type + 1;
            const newX = (f1.x + f2.x) / 2;
            const newY = (f1.y + f2.y) / 2;
            const newFruit: Fruit = {
              x: newX,
              y: newY,
              vx: (f1.vx + f2.vx) / 2,
              vy: (f1.vy + f2.vy) / 2,
              type: newType,
              radius: FRUIT_TYPES[newType].radius * scale,
            };
            fruitsRef.current.splice(j, 1);
            fruitsRef.current.splice(i, 1);
            fruitsRef.current.push(newFruit);
            scoreRef.current += newType * 10;
            setScore(scoreRef.current);
            if (scoreRef.current > highScore) {
              setHighScore(scoreRef.current);
              localStorage.setItem('watermelon-highScore', scoreRef.current.toString());
            }
            return;
          } else {
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const vx1 = f1.vx * cos + f1.vy * sin;
            const vy1 = f1.vy * cos - f1.vx * sin;
            const vx2 = f2.vx * cos + f2.vy * sin;
            const vy2 = f2.vy * cos - f2.vx * sin;
            const vx1Final = vx2 * ELASTICITY;
            const vx2Final = vx1 * ELASTICITY;
            f1.vx = vx1Final * cos - vy1 * sin;
            f1.vy = vy1 * cos + vx1Final * sin;
            f2.vx = vx2Final * cos - vy2 * sin;
            f2.vy = vy2 * cos + vx2Final * sin;
            const overlap = f1.radius + f2.radius - dist;
            f1.x += (dx / dist) * overlap / 2;
            f1.y += (dy / dist) * overlap / 2;
            f2.x -= (dx / dist) * overlap / 2;
            f2.y -= (dy / dist) * overlap / 2;
          }
        }
      }
    }
  }, [highScore, canvasSize]);

  const gameLoop = useCallback(() => {
    update();
    draw();
  }, [update, draw]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 16);
    return () => clearInterval(interval);
  }, [gameLoop]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const dropFruit = useCallback((x: number) => {
    if (gameStateRef.current === 'playing') {
      const scale = scaleRef.current;
      const type = nextFruitTypeRef.current;
      const radius = FRUIT_TYPES[type].radius * scale;
      fruitsRef.current.push({
        x: Math.max(0 + radius, Math.min(x, canvasSize.width - radius)),
        y: (CUP_TOP + FRUIT_TYPES[type].radius + 10) * scale,
        vx: 0,
        vy: 0,
        type,
        radius,
      });
      nextFruitTypeRef.current = Math.floor(Math.random() * 5);
    }
  }, [canvasSize]);

  const handleClick = useCallback((e: MouseEvent | TouchEvent) => {
    if (gameStateRef.current !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = canvasSize.width / canvas.offsetWidth;
    const x = (('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left) * scale;
    dropFruit(x);
  }, [dropFruit, canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick as any);
      canvas.addEventListener('touchstart', handleClick as any);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('click', handleClick as any);
        canvas.removeEventListener('touchstart', handleClick as any);
      }
    };
  }, [handleClick]);

  const startGame = () => {
    fruitsRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setRating('');
    nextFruitTypeRef.current = Math.floor(Math.random() * 5);
    setGameState('playing');
    gameStateRef.current = 'playing';
  };

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      gameStateRef.current = 'paused';
    } else if (gameState === 'paused') {
      setGameState('playing');
      gameStateRef.current = 'playing';
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    gameStateRef.current = 'waiting';
    fruitsRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setRating('');
    draw();
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 sm:p-6 bg-gaming-dark rounded-lg w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row justify-between w-full text-center gap-4">
        <div>
          <div className="text-xs sm:text-sm text-muted-foreground">Score</div>
          <div className="text-lg sm:text-2xl font-bold text-gaming-cyan">{score}</div>
        </div>
        <div>
          <div className="text-xs sm:text-sm text-muted-foreground">High Score</div>
          <div className="text-lg sm:text-2xl font-bold text-gaming-purple">{highScore}</div>
        </div>
      </div>

      <div className="relative border-2 border-border rounded-lg overflow-hidden neon-glow w-full" style={{ maxWidth: '400px' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="block cursor-pointer w-full"
          style={{ height: `${canvasSize.height}px` }}
        />
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full justify-center">
        {gameState === 'waiting' && (
          <Button onClick={startGame} className="bg-primary hover:bg-primary/80 neon-glow text-xs sm:text-sm py-2 sm:py-2 px-3 sm:px-4">
            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Start Game
          </Button>
        )}
        
        {(gameState === 'playing' || gameState === 'paused') && (
          <>
            <Button onClick={togglePause} variant="outline" className="border-primary text-primary text-xs sm:text-sm py-2 sm:py-2 px-3 sm:px-4">
              {gameState === 'playing' ? <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />}
              {gameState === 'playing' ? 'Pause' : 'Resume'}
            </Button>
            <Button onClick={resetGame} variant="outline" className="border-destructive text-destructive text-xs sm:text-sm py-2 sm:py-2 px-3 sm:px-4">
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Reset
            </Button>
          </>
        )}

        {gameState === 'gameOver' && (
          <>
            <Button onClick={startGame} className="bg-primary hover:bg-primary/80 neon-glow text-xs sm:text-sm py-2 sm:py-2 px-3 sm:px-4">
              <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Play Again
            </Button>
            <Button onClick={resetGame} variant="outline" className="border-secondary text-secondary-foreground text-xs sm:text-sm py-2 sm:py-2 px-3 sm:px-4">
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Reset
            </Button>
          </>
        )}
      </div>

      <div className="text-center text-xs sm:text-sm text-muted-foreground w-full">
        <p>Tap to drop fruits. Merge same types to make bigger ones!</p>
        <p>Avoid overflowing the cup. Aim for Watermelon and A rank!</p>
      </div>
    </div>
  );
};

export default WatermelonDropGame;