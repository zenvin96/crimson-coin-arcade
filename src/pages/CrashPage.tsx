import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameResultDialog from "@/components/ui/GameResultDialog";

type GameState = "waiting" | "in-progress" | "crashed";

interface SimulatedPlayer {
  name: string;
  bet: number;
  targetMultiplier: number;
  cashedOut: boolean;
  profit: number;
  crashed: boolean;
}

interface CashoutMarker {
  name: string;
  multiplier: number;
  time: number;
  worldX: number;
  worldY: number;
  opacity: number;
  scale: number;
  age: number;
}

const CrashPage = () => {
  const { t } = useTranslation();

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectsCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const countdownIntervalRef = useRef<NodeJS.Timeout>();
  const gameLoopRef = useRef<(timestamp: number) => void>();

  // Game state
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const crashPointRef = useRef<number>(0);
  const [balance, setBalance] = useState(1000);
  const [totalProfit, setTotalProfit] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState<number | undefined>();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [simulatedPlayers, setSimulatedPlayers] = useState<SimulatedPlayer[]>([]);
  const [resultDialog, setResultDialog] = useState<
    | { open: true; type: "win" | "lose"; amount?: number; multiplier?: number }
    | { open: false }
  >({ open: false });

  // Game constants
  const BETTING_COUNTDOWN_MS = 5000;
  const POST_CRASH_DELAY_MS = 3000;
  const GROWTH_RATE = 0.12;
  const HOUSE_EDGE = 0.03;
  const PADDING = 50;
  const RIGHT_MARGIN = 30;

  // Game refs for animation state
  const startTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Rocket state
  const rocketRef = useRef({
    x: 0,
    y: 0,
    angle: -Math.PI / 4,
    trail: [] as Array<{ x: number; y: number }>,
    shake: 0,
    enginePulse: 0,
    windowGlow: 0,
    thrusterIntensity: 1,
  });

  // View scaling
  const viewRef = useRef({
    currentYMax: 2.0,
    currentXMax: 3.0,
    targetYMax: 2.0,
    targetXMax: 3.0,
    cameraOffsetX: 0,
    cameraOffsetY: 0,
  });

  // Particle systems
  const particlesRef = useRef({
    flame: [] as Array<any>,
    spark: [] as Array<any>,
    smoke: [] as Array<any>,
    explosion: [] as Array<any>,
  });

  // Cashout markers
  const cashoutMarkersRef = useRef<CashoutMarker[]>([]);

  // Player names for simulation
  const playerNames = [
    'CryptoKing', 'MoonShot', 'DiamondHands', 'RocketMan', 'Lucky777',
    'ProGamer', 'BetMaster', 'CashKing', 'HighRoller', 'SafeBet'
  ];

  // Generate crash point
  const generateCrashPoint = useCallback(() => {
    const r = Math.random();
    if (r < 0.03) return 1.00; // Allow 1.00 like the demo
    const raw = (1 - HOUSE_EDGE) / (1 - r);
    return Math.max(1.01, Number(raw.toFixed(2)));
  }, []);

  // Generate simulated players
  const generateSimulatedPlayers = useCallback(() => {
    const count = 3 + Math.floor(Math.random() * 7);
    const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5);

    return shuffledNames.slice(0, count).map(name => ({
      name,
      bet: Math.floor(5 + Math.random() * 500),
      targetMultiplier: 1.5 + Math.random() * 8,
      cashedOut: false,
      profit: 0,
      crashed: false,
    }));
  }, []);

  // Resize canvas
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current || !effectsCanvasRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRef.current.getBoundingClientRect();

    canvasRef.current.width = rect.width * dpr;
    canvasRef.current.height = rect.height * dpr;
    effectsCanvasRef.current.width = rect.width * dpr;
    effectsCanvasRef.current.height = rect.height * dpr;

    const ctx = canvasRef.current.getContext("2d");
    const effectsCtx = effectsCanvasRef.current.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    if (effectsCtx) effectsCtx.scale(dpr, dpr);
  }, []);

  // Get point at time for rocket position
  const getPointAtTime = useCallback((timeSec: number) => {
    if (!canvasRef.current) return { x: PADDING, y: 0, worldX: 0, worldY: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    const viewWidth = rect.width;
    const viewHeight = rect.height;
    const innerWidth = Math.max(viewWidth - PADDING - RIGHT_MARGIN - PADDING, 10);
    const innerHeight = Math.max(viewHeight - 2 * PADDING, 10);

    const mult = Math.exp(GROWTH_RATE * timeSec);
    const worldX = timeSec * 80;
    const worldY = (mult - 1) * 50;

    const view = viewRef.current;

    // Update camera offset
    if (worldX > innerWidth * 0.75) {
      view.cameraOffsetX = worldX - innerWidth * 0.75;
    } else {
      view.cameraOffsetX = 0;
    }

    if (worldY > innerHeight * 0.4) {
      view.cameraOffsetY = worldY - innerHeight * 0.4;
    } else {
      view.cameraOffsetY = 0;
    }

    const screenX = PADDING + worldX - view.cameraOffsetX;
    const screenY = (viewHeight - PADDING) - (worldY - view.cameraOffsetY);

    return { x: screenX, y: screenY, worldX, worldY };
  }, []);

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, elapsed: number) => {
    const rect = ctx.canvas.getBoundingClientRect();
    const viewWidth = rect.width;
    const viewHeight = rect.height;

    ctx.save();

    const innerWidth = viewWidth - PADDING - RIGHT_MARGIN - PADDING;
    const innerHeight = viewHeight - 2 * PADDING;
    const left = PADDING;
    const right = PADDING + innerWidth;
    const bottom = viewHeight - PADDING;
    const top = PADDING;

    // Background
    const bgGradient = ctx.createLinearGradient(left, top, left, bottom);
    bgGradient.addColorStop(0, "rgba(10, 15, 30, 0.7)");
    bgGradient.addColorStop(1, "rgba(20, 25, 40, 0.5)");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(left, top, innerWidth, innerHeight);

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    const xGridCount = Math.min(20, Math.max(5, Math.floor(viewRef.current.currentXMax)));
    const yGridCount = 10;
    const scrollOffset = (elapsed % 1) * (innerWidth / xGridCount);

    // Vertical lines
    for (let i = 0; i <= xGridCount + 1; i++) {
      const x = left + (innerWidth / xGridCount) * i - scrollOffset;
      if (x >= left && x <= right) {
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
      }
    }

    // Horizontal lines
    for (let i = 0; i <= yGridCount; i++) {
      const y = top + (innerHeight / yGridCount) * i;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, top);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, sans-serif";

    // X-axis labels (time in seconds)
    const xStart = Math.max(0, elapsed - 3); // Start showing from 3 seconds ago
    for (let i = 0; i <= 5; i++) {
      const time = xStart + (elapsed > 3 ? (3 / 5) * i : (elapsed / 5) * i);
      const x = left + (innerWidth / 5) * i;
      const label = time < 10 ? time.toFixed(1) + "s" : time.toFixed(0) + "s";
      ctx.fillText(label, x - 10, bottom + 20);
    }

    // Y-axis labels (multiplier) - map screen position to multiplier value
    for (let i = 0; i <= 5; i++) {
      const y = bottom - (innerHeight / 5) * i;

      // Calculate what multiplier would be at this screen Y position
      // Based on the inverse of the rocket position calculation
      const screenYFromBottom = (innerHeight / 5) * i;
      const worldY = screenYFromBottom + viewRef.current.cameraOffsetY;
      const mult = (worldY / 50) + 1;

      const label = mult < 10 ? mult.toFixed(1) + "x" : mult.toFixed(0) + "x";

      // Skip the bottom label (1.0x) to avoid overlap with axis
      if (i > 0) {
        ctx.fillText(label, left - 40, y + 5);
      }
    }

    ctx.restore();
  }, []);

  // Draw rocket
  const drawRocket = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    const rocket = rocketRef.current;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Shake effect
    const shakeX = (Math.random() - 0.5) * rocket.shake;
    const shakeY = (Math.random() - 0.5) * rocket.shake;
    ctx.translate(shakeX, shakeY);

    // Scale based on speed
    const scale = 1 + Math.min(0.2, multiplier * 0.01);
    ctx.scale(scale, scale);

    // Rocket body
    const bodyGradient = ctx.createLinearGradient(-15, 0, 15, 0);
    bodyGradient.addColorStop(0, "#e74c3c");
    bodyGradient.addColorStop(0.3, "#c0392b");
    bodyGradient.addColorStop(0.7, "#e74c3c");
    bodyGradient.addColorStop(1, "#c0392b");

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.quadraticCurveTo(22, -8, 15, -10);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-15, -15);
    ctx.lineTo(-12, -10);
    ctx.lineTo(-20, -8);
    ctx.lineTo(-20, 8);
    ctx.lineTo(-12, 10);
    ctx.lineTo(-15, 15);
    ctx.lineTo(-10, 10);
    ctx.lineTo(15, 10);
    ctx.quadraticCurveTo(22, 8, 25, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Window
    ctx.fillStyle = `rgba(100, 200, 255, ${rocket.windowGlow})`;
    ctx.beginPath();
    ctx.arc(10, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Window shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(11, -1, 2, 0, Math.PI * 2);
    ctx.fill();

    // Thruster flame (only when in progress)
    if (gameState === "in-progress") {
      const flames = [
        { size: 1.2, color: "rgba(255, 255, 255, 0.9)", blur: 10 },
        { size: 1.5, color: "rgba(255, 200, 100, 0.8)", blur: 15 },
        { size: 1.8, color: "rgba(255, 150, 50, 0.6)", blur: 20 },
        { size: 2.0, color: "rgba(255, 100, 0, 0.4)", blur: 25 }
      ];

      flames.forEach(flame => {
        ctx.save();
        ctx.filter = `blur(${flame.blur}px)`;

        const flameLength = 20 * flame.size * rocket.thrusterIntensity;
        const flameWidth = 10 * flame.size;

        const gradient = ctx.createLinearGradient(-20, 0, -20 - flameLength, 0);
        gradient.addColorStop(0, flame.color);
        gradient.addColorStop(0.5, flame.color.replace(/[\d.]+\)/, "0.3)"));
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-20, -flameWidth / 2);
        ctx.quadraticCurveTo(
          -20 - flameLength / 2,
          (Math.random() - 0.5) * flameWidth,
          -20 - flameLength,
          0
        );
        ctx.quadraticCurveTo(
          -20 - flameLength / 2,
          (Math.random() - 0.5) * flameWidth,
          -20,
          flameWidth / 2
        );
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    }

    ctx.restore();
  }, [gameState, multiplier]);

  // Create explosion
  const createExplosion = useCallback((x: number, y: number) => {
    const particles = particlesRef.current;

    // Create explosion particles
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const speed = 100 + Math.random() * 200;
      particles.explosion.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: `hsl(${Math.random() * 60}, 100%, 50%)`,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
      });
    }

    rocketRef.current.shake = 15;
  }, []);

  // Add cashout marker
  const addCashoutMarker = useCallback((playerName: string, mult: number, timeSec: number) => {
    const pos = getPointAtTime(timeSec);

    cashoutMarkersRef.current.push({
      name: playerName,
      multiplier: mult,
      time: timeSec,
      worldX: pos.worldX || (timeSec * 80),
      worldY: pos.worldY || ((Math.exp(GROWTH_RATE * timeSec) - 1) * 50),
      opacity: 1.0,
      scale: 1.0,
      age: 0
    });

    // Keep only recent markers (max 20)
    if (cashoutMarkersRef.current.length > 20) {
      cashoutMarkersRef.current.shift();
    }
  }, [getPointAtTime, GROWTH_RATE]);

  // Draw cashout markers
  const drawCashoutMarkers = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();

    cashoutMarkersRef.current.forEach((marker) => {
      // Convert world coordinates to screen coordinates using camera offset
      const screenX = PADDING + marker.worldX - viewRef.current.cameraOffsetX;
      const screenY = (ctx.canvas.getBoundingClientRect().height - PADDING) - (marker.worldY - viewRef.current.cameraOffsetY);

      // Only draw if marker is visible on screen
      const viewWidth = ctx.canvas.getBoundingClientRect().width;
      const viewHeight = ctx.canvas.getBoundingClientRect().height;
      if (screenX < 0 || screenX > viewWidth || screenY < 0 || screenY > viewHeight) {
        return;
      }

      ctx.globalAlpha = marker.opacity;

      // Draw marker circle
      const markerSize = 6 * marker.scale;
      ctx.fillStyle = '#2ecc71';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, screenY, markerSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw player name and multiplier
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * marker.scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'left';

      const textX = screenX + 12;
      const textY = screenY - 5;

      // Background for text
      const text = `${marker.name} @ ${marker.multiplier.toFixed(2)}x`;
      const textWidth = ctx.measureText(text).width;

      ctx.fillStyle = `rgba(39, 174, 96, ${marker.opacity * 0.9})`;
      ctx.fillRect(textX - 3, textY - 12, textWidth + 6, 18);

      // Draw text
      ctx.fillStyle = '#fff';
      ctx.fillText(text, textX, textY);

      // Add connection line
      ctx.strokeStyle = `rgba(46, 204, 113, ${marker.opacity * 0.5})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(screenX + markerSize, screenY);
      ctx.lineTo(textX - 3, textY - 3);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    ctx.restore();
  }, []);

  // Update cashout markers
  const updateCashoutMarkers = useCallback((dt: number) => {
    // Update marker animations
    cashoutMarkersRef.current = cashoutMarkersRef.current.filter(marker => {
      marker.age += dt;

      // Animate scale
      if (marker.age < 0.3) {
        marker.scale = 1.0 + (marker.age / 0.3) * 0.3;
      } else {
        marker.scale = 1.3 - (marker.age - 0.3) * 0.1;
        marker.scale = Math.max(1.0, marker.scale);
      }

      // Fade out old markers
      if (marker.age > 10) {
        marker.opacity = Math.max(0, 1.0 - ((marker.age - 10) / 5));
      }

      // Remove after 15 seconds
      return marker.age < 15;
    });
  }, []);

  // Handle cashout logic inline to avoid circular dependency
  const handleCashoutLogic = useCallback(() => {
    if (gameState === "in-progress" && currentBet > 0) {
      const winnings = currentBet * multiplier;
      const profit = winnings - currentBet;

      setBalance(prev => prev + winnings);
      setTotalProfit(prev => prev + profit);

      setResultDialog({
        open: true,
        type: "win",
        amount: profit,
        multiplier: multiplier,
      });

      setCurrentBet(0);
    }
  }, [gameState, currentBet, multiplier]);

  // Game loop - store in ref to avoid circular dependency
  gameLoopRef.current = (timestamp: number) => {
    if (!canvasRef.current || !effectsCanvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    const effectsCtx = effectsCanvasRef.current.getContext("2d");
    if (!ctx || !effectsCtx) return;

    if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
    const dt = Math.min(0.05, (timestamp - lastFrameTimeRef.current) / 1000);
    lastFrameTimeRef.current = timestamp;

    const now = Date.now();
    const elapsed = Math.max(0, (now - startTimeRef.current) / 1000);

    // Update multiplier
    const currentMultiplier = Math.exp(GROWTH_RATE * elapsed);
    setMultiplier(currentMultiplier);

    // Check for crash (handle 1.00 crash point)
    if (crashPointRef.current === 1.00 || currentMultiplier >= crashPointRef.current) {
      setMultiplier(crashPointRef.current);
      setGameState("crashed");

      const pos = getPointAtTime(elapsed);
      createExplosion(pos.x, pos.y);

      // Crash all players
      setSimulatedPlayers(prev => prev.map(p => ({
        ...p,
        crashed: !p.cashedOut,
        profit: p.cashedOut ? p.profit : -p.bet
      })));

      if (currentBet > 0) {
        setTotalProfit(prev => prev - currentBet);
        setResultDialog({ open: true, type: "lose", amount: currentBet });
      }

      setCurrentBet(0);

      // Draw final crash state
      const rect = ctx.canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      effectsCtx.clearRect(0, 0, rect.width, rect.height);

      drawGrid(ctx, elapsed);
      drawCashoutMarkers(ctx);
      const rocket = rocketRef.current;
      drawRocket(ctx, rocket.x, rocket.y, rocket.angle);

      // Cancel the current animation frame to stop the game loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }

      setTimeout(() => {
        // Clear canvas before restarting
        if (canvasRef.current && effectsCanvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          const effectsCtx = effectsCanvasRef.current.getContext("2d");
          if (ctx && effectsCtx) {
            const rect = canvasRef.current.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);
            effectsCtx.clearRect(0, 0, rect.width, rect.height);
          }
        }

        // Reset view parameters for waiting state
        const view = viewRef.current;
        view.cameraOffsetX = 0;
        view.cameraOffsetY = 0;
        view.currentYMax = 2.0;
        view.currentXMax = 3.0;
        view.targetYMax = 2.0;
        view.targetXMax = 3.0;

        // Restart betting phase
        setGameState("waiting");
        setMultiplier(1.0);
        crashPointRef.current = 0;
        setCurrentBet(0);
        setSimulatedPlayers(generateSimulatedPlayers());

        // Clear and restart countdown
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }

        let timeLeft = BETTING_COUNTDOWN_MS;
        setCountdown(timeLeft);

        countdownIntervalRef.current = setInterval(() => {
          timeLeft -= 100;
          setCountdown(timeLeft);

          if (timeLeft <= 0) {
            clearInterval(countdownIntervalRef.current!);
            setCountdown(null);
            // Start new game inline to avoid circular dependency
            setGameState("in-progress");
            const newCrashPoint = generateCrashPoint();
            crashPointRef.current = newCrashPoint;
            startTimeRef.current = Date.now();
            lastFrameTimeRef.current = 0;
            setMultiplier(1.0);

            // Reset rocket
            const rocket = rocketRef.current;
            rocket.x = PADDING;
            rocket.y = 0;
            rocket.angle = -Math.PI / 4;
            rocket.trail = [];
            rocket.shake = 0;
            rocket.enginePulse = 0;

            // Reset view
            const view = viewRef.current;
            view.cameraOffsetX = 0;
            view.cameraOffsetY = 0;
            view.currentYMax = 2.0;
            view.currentXMax = 3.0;
            view.targetYMax = 2.0;
            view.targetXMax = 3.0;

            // Reset particles
            particlesRef.current = {
              flame: [],
              spark: [],
              smoke: [],
              explosion: [],
            };

            cashoutMarkersRef.current = [];

            resizeCanvas();
            if (gameLoopRef.current) {
              animationFrameRef.current = requestAnimationFrame(gameLoopRef.current);
            }
          }
        }, 100);
      }, POST_CRASH_DELAY_MS);

      return;
    }

    // Auto cashout
    if (autoCashout && currentMultiplier >= autoCashout && currentBet > 0) {
      handleCashoutLogic();
    }

    // Update rocket position (only if not crashed)
    if (gameState === "in-progress") {
      const pos = getPointAtTime(elapsed);
      const rocket = rocketRef.current;
      rocket.x = pos.x;
      rocket.y = pos.y;

      // Calculate rocket angle
      if (elapsed > 0.01) {
        const prevTime = Math.max(0, elapsed - 0.016);
        const prevPos = getPointAtTime(prevTime);
        const currPos = getPointAtTime(elapsed);

        if (currPos.worldX !== undefined && prevPos.worldX !== undefined) {
          const worldVelX = currPos.worldX - prevPos.worldX;
          const worldVelY = currPos.worldY - prevPos.worldY;

          if (worldVelX > 0 || worldVelY > 0) {
            rocket.angle = Math.atan2(-worldVelY, worldVelX);
          }
        }
      }

      // Update rocket animation
      rocket.enginePulse += dt * 10;
      rocket.windowGlow = 0.5 + Math.sin(rocket.enginePulse) * 0.3;
      rocket.thrusterIntensity = 0.8 + Math.random() * 0.4;

      // Update trail
      rocket.trail.push({ x: rocket.x, y: rocket.y });
      if (rocket.trail.length > 150) {
        rocket.trail.shift();
      }
    }

    // Update shake (always update, even when crashed)
    const rocket = rocketRef.current;
    if (rocket.shake > 0) {
      rocket.shake *= 0.95;
    }

    // Update view scale
    const view = viewRef.current;
    if (currentMultiplier < 2) {
      view.targetYMax = 2.5;
    } else if (currentMultiplier < 5) {
      view.targetYMax = currentMultiplier * 1.3;
    } else if (currentMultiplier < 20) {
      view.targetYMax = currentMultiplier * 1.2;
    } else {
      view.targetYMax = currentMultiplier * 1.1;
    }

    view.targetXMax = Math.max(5, elapsed + 2);

    const smoothFactor = currentMultiplier < 5 ? 0.15 : 0.1;
    view.currentYMax += (view.targetYMax - view.currentYMax) * smoothFactor;
    view.currentXMax += (view.targetXMax - view.currentXMax) * smoothFactor;

    // Check simulated players cashout
    setSimulatedPlayers(prev => prev.map(player => {
      if (!player.cashedOut && !player.crashed && currentMultiplier >= player.targetMultiplier) {
        // Add cashout marker for this player
        const currentTime = elapsed;
        addCashoutMarker(player.name, currentMultiplier, currentTime);

        return {
          ...player,
          cashedOut: true,
          profit: player.bet * currentMultiplier - player.bet
        };
      }
      return player;
    }));

    // Update markers
    updateCashoutMarkers(dt);

    // Clear canvas
    const rect = ctx.canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    effectsCtx.clearRect(0, 0, rect.width, rect.height);

    // Draw
    drawGrid(ctx, elapsed);
    drawCashoutMarkers(ctx);
    drawRocket(ctx, rocket.x, rocket.y, rocket.angle);

    if (gameLoopRef.current) {
      animationFrameRef.current = requestAnimationFrame(gameLoopRef.current);
    }
  };

  // Start game
  const startGame = useCallback(() => {
    setGameState("in-progress");
    const newCrashPoint = generateCrashPoint();
    crashPointRef.current = newCrashPoint;
    startTimeRef.current = Date.now();
    lastFrameTimeRef.current = 0;
    setMultiplier(1.0);

    // Reset rocket
    const rocket = rocketRef.current;
    rocket.x = PADDING;
    rocket.y = 0;
    rocket.angle = -Math.PI / 4;
    rocket.trail = [];
    rocket.shake = 0;
    rocket.enginePulse = 0;

    // Reset view
    const view = viewRef.current;
    view.cameraOffsetX = 0;
    view.cameraOffsetY = 0;
    view.currentYMax = 2.0;
    view.currentXMax = 3.0;
    view.targetYMax = 2.0;
    view.targetXMax = 3.0;

    // Reset particles
    particlesRef.current = {
      flame: [],
      spark: [],
      smoke: [],
      explosion: [],
    };

    cashoutMarkersRef.current = [];

    resizeCanvas();
    if (gameLoopRef.current) {
      animationFrameRef.current = requestAnimationFrame(gameLoopRef.current);
    }
  }, [generateCrashPoint, resizeCanvas, addCashoutMarker, updateCashoutMarkers, drawCashoutMarkers]);

  // Start betting phase
  const startBettingPhase = useCallback(() => {
    setGameState("waiting");
    setMultiplier(1.0);
    crashPointRef.current = 0;
    setCurrentBet(0);
    setSimulatedPlayers(generateSimulatedPlayers());

    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Start countdown
    let timeLeft = BETTING_COUNTDOWN_MS;
    setCountdown(timeLeft);

    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 100;
      setCountdown(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(countdownIntervalRef.current!);
        setCountdown(null);
        startGame();
      }
    }, 100);
  }, [generateSimulatedPlayers, startGame]);

  // Place bet
  const handlePlaceBet = useCallback(() => {
    if (gameState === "waiting" && betAmount > 0 && betAmount <= balance) {
      setCurrentBet(betAmount);
      setBalance(prev => prev - betAmount);
    }
  }, [gameState, betAmount, balance]);

  // Cash out
  const handleCashout = useCallback(() => {
    handleCashoutLogic();
  }, [handleCashoutLogic]);

  // Waiting animation
  useEffect(() => {
    if (gameState !== "waiting" || !canvasRef.current) return;

    const waitingAnimation = () => {
      if (!canvasRef.current || gameState !== "waiting") return;

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const rect = ctx.canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      drawGrid(ctx, 0);

      // Draw idle rocket
      const rocket = rocketRef.current;
      const idleOffset = Math.sin(Date.now() * 0.001) * 2;
      rocket.enginePulse += 0.05;
      rocket.windowGlow = 0.3 + Math.sin(rocket.enginePulse) * 0.2;

      const startPos = getPointAtTime(0);
      drawRocket(ctx, startPos.x, startPos.y + idleOffset, -Math.PI / 4);

      if (gameState === "waiting") {
        requestAnimationFrame(waitingAnimation);
      }
    };

    waitingAnimation();
  }, [gameState, getPointAtTime, drawGrid, drawRocket]);

  // Initialize
  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Start first betting phase
    const timer = setTimeout(() => {
      startBettingPhase();
    }, 1000);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      clearTimeout(timer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [resizeCanvas, startBettingPhase]);

  return (
    <>
      <div className="min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">CRASH</h1>
          <p className="text-muted-foreground">{t("crash.description")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-stretch">
          {/* Left Controls Panel */}
          <div className="flex flex-col gap-4">
            {/* Betting Controls */}
            <div className="bg-card/40 rounded-lg p-4 border border-border/40">
              <div className="space-y-4">
                {/* Bet Amount */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{t("crash.betAmount")}</div>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <div className="relative w-full">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <img src="/tether-usdt-logo.svg" alt="USDT" className="h-4 w-4" />
                        <span className="hidden sm:inline">USDT</span>
                      </span>
                      <Input
                        type="number"
                        className="pl-12 text-right font-semibold"
                        value={betAmount}
                        min={1}
                        max={1000}
                        onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                        disabled={gameState !== "waiting"}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.max(1, betAmount / 2))} disabled={gameState !== "waiting"}>
                      ½
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.min(1000, betAmount * 2))} disabled={gameState !== "waiting"}>
                      2x
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setBetAmount(1000)} disabled={gameState !== "waiting"}>
                      MAX
                    </Button>
                  </div>
                </div>

                {/* Auto Cashout */}
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {t("crash.autoCashout")}
                  </div>
                  <Input
                    type="number"
                    placeholder={t("crash.off")}
                    value={autoCashout || ""}
                    min={1.01}
                    step={0.01}
                    onChange={(e) => setAutoCashout(e.target.value ? parseFloat(e.target.value) : undefined)}
                    disabled={gameState !== "waiting"}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card/60 border border-border/40 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      {t("crash.balance")}
                    </div>
                    <div className="text-lg font-bold">${balance.toFixed(2)}</div>
                  </div>
                  <div className="bg-card/60 border border-border/40 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      {t("crash.profit")}
                    </div>
                    <div className={`text-lg font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={gameState === "waiting" ? handlePlaceBet : handleCashout}
                  disabled={
                    gameState === "waiting"
                      ? currentBet > 0 || betAmount <= 0 || betAmount > balance
                      : currentBet === 0
                  }
                >
                  {gameState === "waiting" ? (
                    currentBet > 0 ? t("crash.betPlaced", { amount: currentBet }) : t("crash.placeBet")
                  ) : (
                    currentBet > 0 ? t("crash.cashoutAt", { amount: (currentBet * multiplier).toFixed(2) }) : t("crash.watching")
                  )}
                </Button>
              </div>
            </div>

            {/* Live Players Panel */}
            <div className="bg-card/40 rounded-lg border border-border/40 overflow-hidden flex flex-col h-fit max-h-[300px]">
              <div className="p-3 border-b border-border/40">
                <div className="text-xs font-semibold">
                  {t("crash.livePlayers")} ({simulatedPlayers.length})
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {t("crash.totalBets")}: ${simulatedPlayers.reduce((sum, p) => sum + p.bet, 0).toFixed(0)}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {simulatedPlayers.map((player, index) => (
                  <div
                    key={`${player.name}-${index}`}
                    className={`p-2 rounded border text-xs ${
                      player.crashed
                        ? "bg-red-500/10 border-red-500/30"
                        : player.cashedOut
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-muted/20 border-border/40"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-[10px] text-muted-foreground">${player.bet}</div>
                      </div>
                      <div className="text-right">
                        {player.crashed ? (
                          <div className="text-red-500">
                            <div className="text-[10px]">{t("crash.crashed")}</div>
                            <div className="text-[10px]">-${player.bet.toFixed(0)}</div>
                          </div>
                        ) : player.cashedOut ? (
                          <div className="text-green-500">
                            <div className="text-[11px]">{multiplier.toFixed(2)}x</div>
                            <div className="text-[10px]">+${player.profit.toFixed(0)}</div>
                          </div>
                        ) : (
                          <div className="text-yellow-500 text-[10px]">{t("crash.playing")}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Game Canvas */}
          <div className="flex flex-col min-w-0">
            <div className="relative h-[500px] lg:h-[600px] bg-card/40 rounded-lg border border-border/40 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
                <div className={`text-5xl lg:text-6xl font-bold ${gameState === "crashed" ? "text-red-500" : "text-white"}`}>
                  {multiplier.toFixed(2)}x
                </div>
                {gameState === "crashed" && (
                  <div className="text-xl mt-2">{t("crash.crashed")}</div>
                )}
              </div>

              {countdown !== null && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-black/60 rounded">
                  {t("crash.nextRound")}: {(countdown / 1000).toFixed(1)}s
                </div>
              )}

              {gameState === "in-progress" && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-green-500/30 border border-green-500/50 rounded animate-pulse">
                  LIVE
                </div>
              )}

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />
              <canvas
                ref={effectsCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      <GameResultDialog
        open={resultDialog.open}
        onOpenChange={(open) => setResultDialog(open ? resultDialog : { open: false })}
        type={resultDialog.open ? resultDialog.type : "win"}
        title={
          resultDialog.open && resultDialog.type === "win"
            ? t("crash.dialog.winTitle")
            : t("crash.dialog.loseTitle")
        }
        description={
          resultDialog.open && resultDialog.type === "win"
            ? t("crash.dialog.winDesc")
            : t("crash.dialog.loseDesc")
        }
        amountText={
          resultDialog.open && resultDialog.amount !== undefined
            ? `$${resultDialog.amount.toFixed(2)}`
            : undefined
        }
        multiplierText={
          resultDialog.open && resultDialog.multiplier !== undefined
            ? `${resultDialog.multiplier.toFixed(2)}x`
            : undefined
        }
        autoCloseMs={1800}
      />
    </>
  );
};

export default CrashPage;