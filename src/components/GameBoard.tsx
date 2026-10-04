import React, { useEffect, useRef, useCallback } from 'react';
import { Country, Ball, Particle, FloatingText, Drop, GameMode, DropType } from '../types/game';
import {
  drawCountryBall,
  drawTerritoryCell,
  drawTerritoryCenterEmblem,
  drawSectorBackgroundFlag,
  applyClothWaveLighting,
} from '../utils/flagRenderer';
import { soundEngine } from '../utils/audio';
import { commentator } from '../utils/commentator';
import confetti from 'canvas-confetti';

interface GameBoardProps {
  mode: GameMode;
  countries: Country[];
  simSpeed: number;
  spawnThresholdPercent: number;
  randomDropsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  autoRestart: boolean;
  restartCountdownSeconds: number;
  onStatsUpdate: (stats: {
    territoryCounts: Record<string, number>;
    territoryPercentages: Record<string, number>;
    ballCounts: Record<string, number>;
    eliminated: Record<string, boolean>;
    winner: Country | null;
  }) => void;
  onRoundFinish: (winner: Country) => void;
  matchNumber: number;
  onRegisterSpawnBall?: (spawnFn: (countryId: string) => void) => void;
  onNextMatch?: () => void;
  potatoMode?: boolean;
}

const BALL_RADIUS = 13;
const BASE_SPEED = 6.2;

export const GameBoard: React.FC<GameBoardProps> = ({
  mode,
  countries,
  simSpeed,
  spawnThresholdPercent,
  randomDropsEnabled,
  soundEnabled,
  soundVolume,
  autoRestart,
  restartCountdownSeconds,
  onStatsUpdate,
  onRoundFinish,
  matchNumber,
  onRegisterSpawnBall,
  onNextMatch,
  potatoMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 36x36/48x48 for Potato Mode (saving up to 50% rendering calls), 48x48/64x64 for Quality Mode
  const gridCols = potatoMode 
    ? (mode === 'mega_world' ? 48 : 36) 
    : (mode === 'mega_world' ? 64 : 48);
  const gridRows = potatoMode 
    ? (mode === 'mega_world' ? 48 : 36) 
    : (mode === 'mega_world' ? 64 : 48);

  // Sound engine updates
  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
    soundEngine.setVolume(soundVolume);
  }, [soundEnabled, soundVolume]);

  const stateRef = useRef<{
    grid: Uint8Array;
    tileFlashes: Float32Array;
    balls: Ball[];
    drops: Drop[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    territoryCounts: Record<string, number>;
    territoryCenters: Record<string, { sumX: number; sumY: number; count: number }>;
    milestonesPassed: Record<string, Set<number>>;
    commentaryMilestonesPassed: Record<string, Set<number>>;
    eliminated: Record<string, boolean>;
    winner: Country | null;
    roundEnded: boolean;
    autoRestartCountdown: number;
    ballIdCounter: number;
    dropIdCounter: number;
    floatingIdCounter: number;
    lastDropSpawnTime: number;
    lastSoundConquerTime: number;
  }>({
    grid: new Uint8Array(gridCols * gridRows),
    tileFlashes: new Float32Array(gridCols * gridRows),
    balls: [],
    drops: [],
    particles: [],
    floatingTexts: [],
    territoryCounts: {},
    territoryCenters: {},
    milestonesPassed: {},
    commentaryMilestonesPassed: {},
    eliminated: {},
    winner: null,
    roundEnded: false,
    autoRestartCountdown: restartCountdownSeconds,
    ballIdCounter: 1,
    dropIdCounter: 1,
    floatingIdCounter: 1,
    lastDropSpawnTime: 0,
    lastSoundConquerTime: 0,
  });

  // Helper to spawn a new ball for a country
  const spawnBallForCountry = useCallback(
    (countryId: string, spawnX?: number, spawnY?: number) => {
      const country = countries.find((c) => c.id === countryId);
      if (!country) return;

      const canvasWidth = 720;
      const canvasHeight = 720;
      const x = spawnX ?? canvasWidth * 0.2 + Math.random() * canvasWidth * 0.6;
      const y = spawnY ?? canvasHeight * 0.2 + Math.random() * canvasHeight * 0.6;

      const angle = Math.random() * Math.PI * 2;
      const speed = BASE_SPEED;

      stateRef.current.balls.push({
        id: stateRef.current.ballIdCounter++,
        countryId: country.id,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: mode === 'mega_world' ? 10 : BALL_RADIUS,
        color: country.primaryColor,
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.1,
        trail: [],
      });

      // Floating indicator
      stateRef.current.floatingTexts.push({
        id: stateRef.current.floatingIdCounter++,
        text: `+1 BALL ${country.emoji}`,
        x,
        y: y - 20,
        color: country.accentColor || country.primaryColor,
        life: 0,
        maxLife: 60,
      });

      // Burst particles (Bypassed in Potato Mode for speed!)
      if (!potatoMode) {
        for (let i = 0; i < 14; i++) {
          const pAngle = (Math.PI * 2 * i) / 14;
          const pSpeed = 2 + Math.random() * 3.5;
          stateRef.current.particles.push({
            x,
            y,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed,
            color: country.primaryColor,
            size: 3 + Math.random() * 3,
            life: 0,
            maxLife: 25,
          });
        }
      }

      soundEngine.playBallSpawn();
      const currentCount = stateRef.current.balls.filter((b) => b.countryId === country.id).length;
      commentator.announceBallSpawn(country, currentCount);
    },
    [countries, mode]
  );

  // Initialize or Reset Match
  const resetMatch = useCallback(() => {
    const totalCells = gridCols * gridRows;
    const grid = new Uint8Array(totalCells);
    const tileFlashes = new Float32Array(totalCells);

    const counts: Record<string, number> = {};
    const milestones: Record<string, Set<number>> = {};
    const commMilestones: Record<string, Set<number>> = {};
    const elim: Record<string, boolean> = {};

    countries.forEach((c) => {
      counts[c.id] = 0;
      milestones[c.id] = new Set<number>();
      commMilestones[c.id] = new Set<number>();
      elim[c.id] = false;
    });

    const canvasWidth = 720;
    const canvasHeight = 720;
    const balls: Ball[] = [];
    let ballId = 1;

    if (mode === 'classic_4' && countries.length === 4) {
      const halfCols = Math.floor(gridCols / 2);
      const halfRows = Math.floor(gridRows / 2);

      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const isRight = c >= halfCols;
          const isBottom = r >= halfRows;
          let idx = 0;
          if (!isRight && !isBottom) idx = 0;
          else if (isRight && !isBottom) idx = 1;
          else if (!isRight && isBottom) idx = 2;
          else idx = 3;

          const cellIdx = r * gridCols + c;
          grid[cellIdx] = idx;
          const cId = countries[idx].id;
          counts[cId] = (counts[cId] || 0) + 1;
        }
      }

      const spawnPositions = [
        { x: canvasWidth * 0.25, y: canvasHeight * 0.25, angle: Math.PI * 0.25 },
        { x: canvasWidth * 0.75, y: canvasHeight * 0.25, angle: Math.PI * 0.75 },
        { x: canvasWidth * 0.25, y: canvasHeight * 0.75, angle: -Math.PI * 0.25 },
        { x: canvasWidth * 0.75, y: canvasHeight * 0.75, angle: -Math.PI * 0.75 },
      ];

      countries.forEach((country, idx) => {
        const pos = spawnPositions[idx];
        const angle = pos.angle + (Math.random() - 0.5) * 0.35;
        balls.push({
          id: ballId++,
          countryId: country.id,
          x: pos.x,
          y: pos.y,
          vx: Math.cos(angle) * BASE_SPEED,
          vy: Math.sin(angle) * BASE_SPEED,
          radius: BALL_RADIUS,
          color: country.primaryColor,
          rotation: 0,
          vRot: (Math.random() - 0.5) * 0.1,
          trail: [],
        });
      });
    } else {
      const numCountries = countries.length;
      const numColsDiv = Math.ceil(Math.sqrt(numCountries));
      const numRowsDiv = Math.ceil(numCountries / numColsDiv);

      const sectorCols = gridCols / numColsDiv;
      const sectorRows = gridRows / numRowsDiv;

      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const sCol = Math.min(numColsDiv - 1, Math.floor(c / sectorCols));
          const sRow = Math.min(numRowsDiv - 1, Math.floor(r / sectorRows));
          const countryIdx = (sRow * numColsDiv + sCol) % numCountries;

          const cellIdx = r * gridCols + c;
          grid[cellIdx] = countryIdx;
          const cId = countries[countryIdx].id;
          counts[cId] = (counts[cId] || 0) + 1;
        }
      }

      countries.forEach((country, idx) => {
        const sCol = idx % numColsDiv;
        const sRow = Math.floor(idx / numColsDiv);

        const sectorCenterX = ((sCol + 0.5) / numColsDiv) * canvasWidth;
        const sectorCenterY = ((sRow + 0.5) / numRowsDiv) * canvasHeight;
        const angle = Math.random() * Math.PI * 2;

        balls.push({
          id: ballId++,
          countryId: country.id,
          x: sectorCenterX,
          y: sectorCenterY,
          vx: Math.cos(angle) * BASE_SPEED,
          vy: Math.sin(angle) * BASE_SPEED,
          radius: 10,
          color: country.primaryColor,
          rotation: 0,
          vRot: (Math.random() - 0.5) * 0.1,
          trail: [],
        });
      });
    }

    stateRef.current = {
      grid,
      tileFlashes,
      balls,
      drops: [],
      particles: [],
      floatingTexts: [],
      territoryCounts: counts,
      territoryCenters: {},
      milestonesPassed: milestones,
      commentaryMilestonesPassed: commMilestones,
      eliminated: elim,
      winner: null,
      roundEnded: false,
      autoRestartCountdown: restartCountdownSeconds,
      ballIdCounter: ballId,
      dropIdCounter: 1,
      floatingIdCounter: 1,
      lastDropSpawnTime: performance.now(),
      lastSoundConquerTime: 0,
    };

    // Match Start Audio: Referee Whistle & Announcer Call
    soundEngine.playWhistle();
    commentator.announceMatchStart(countries.slice(0, 4));
  }, [mode, countries, gridCols, gridRows, restartCountdownSeconds]);

  // Connect manual spawn
  useEffect(() => {
    if (onRegisterSpawnBall) {
      onRegisterSpawnBall(spawnBallForCountry);
    }
  }, [onRegisterSpawnBall, spawnBallForCountry]);

  useEffect(() => {
    resetMatch();
  }, [matchNumber, mode, countries, resetMatch]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let lastTickTime = performance.now();
    let lastRafTime = performance.now();
    const cellW = canvas.width / gridCols;
    const cellH = canvas.height / gridRows;

    const gameLoop = (time: number, isBackup = false) => {
      lastTickTime = performance.now();
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = stateRef.current;
      const totalCells = gridCols * gridRows;

      // Handle Random Drops Spawning
      if (randomDropsEnabled && !state.roundEnded) {
        if (time - state.lastDropSpawnTime > 11000 && state.drops.length < 3) {
          state.lastDropSpawnTime = time;
          const dropTypes: { type: DropType; label: string; icon: string; color: string }[] = [
            { type: 'bomb', label: 'BOMB', icon: '💣', color: '#ef4444' },
            { type: 'multi_ball', label: '+2 BALLS', icon: '⚽', color: '#3b82f6' },
            { type: 'speed', label: 'SUPER SPEED', icon: '⚡', color: '#f59e0b' },
            { type: 'laser', label: 'LASER CROSS', icon: '💥', color: '#ec4899' },
            { type: 'freeze', label: 'BLIZZARD FREEZE', icon: '❄️', color: '#06b6d4' },
          ];

          const picked = dropTypes[Math.floor(Math.random() * dropTypes.length)];
          const margin = 80;
          const dropX = margin + Math.random() * (canvas.width - margin * 2);
          const dropY = margin + Math.random() * (canvas.height - margin * 2);

          state.drops.push({
            id: state.dropIdCounter++,
            type: picked.type,
            x: dropX,
            y: dropY,
            radius: 18,
            color: picked.color,
            icon: picked.icon,
            label: picked.label,
            createdAt: time,
            lifespan: 16,
            bobOffset: Math.random() * Math.PI * 2,
          });

          soundEngine.playDropSpawn();
        }
      }

      // Physics steps
      const steps = Math.max(1, Math.min(6, Math.ceil(simSpeed)));
      const stepSpeed = simSpeed / steps;

      if (!state.roundEnded) {
        for (let s = 0; s < steps; s++) {
          // Process balls
          for (let bIdx = 0; bIdx < state.balls.length; bIdx++) {
            const ball = state.balls[bIdx];
            const countryIdx = countries.findIndex((c) => c.id === ball.countryId);
            if (countryIdx === -1) continue;

            const isFrozen = !!(ball.frozenUntil && ball.frozenUntil > time);

            if (isFrozen) {
              // Shiver in ice block
              ball.x += (Math.random() - 0.5) * 0.3;
              ball.y += (Math.random() - 0.5) * 0.3;
            } else {
              // Ensure ball has active velocity when returning from freeze
              if (Math.hypot(ball.vx, ball.vy) < 1.0) {
                const ang = Math.random() * Math.PI * 2;
                ball.vx = Math.cos(ang) * BASE_SPEED;
                ball.vy = Math.sin(ang) * BASE_SPEED;
              }

              const currentBallSpeed = ball.supercharged ? stepSpeed * 1.5 : stepSpeed;
              ball.x += ball.vx * currentBallSpeed;
              ball.y += ball.vy * currentBallSpeed;
              ball.rotation += ball.vRot * currentBallSpeed;

              // Trail
              if (s === 0) {
                ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.6 });
                if (ball.trail.length > 7) {
                  ball.trail.shift();
                }
              }
            }

            // Screen boundaries
            let bounced = false;
            if (ball.x - ball.radius < 0) {
              ball.x = ball.radius;
              ball.vx = Math.abs(ball.vx);
              bounced = true;
            } else if (ball.x + ball.radius > canvas.width) {
              ball.x = canvas.width - ball.radius;
              ball.vx = -Math.abs(ball.vx);
              bounced = true;
            }

            if (ball.y - ball.radius < 0) {
              ball.y = ball.radius;
              ball.vy = Math.abs(ball.vy);
              bounced = true;
            } else if (ball.y + ball.radius > canvas.height) {
              ball.y = canvas.height - ball.radius;
              ball.vy = -Math.abs(ball.vy);
              bounced = true;
            }

            if (bounced && !isFrozen) {
              soundEngine.playBounce(220 + (countryIdx % 6) * 35);
            }

            // Check Collision with Random Drops
            if (s === 0 && randomDropsEnabled) {
              for (let dIdx = state.drops.length - 1; dIdx >= 0; dIdx--) {
                const drop = state.drops[dIdx];
                const distToDrop = Math.hypot(ball.x - drop.x, ball.y - drop.y);

                if (distToDrop < ball.radius + drop.radius) {
                  soundEngine.playDropCollect();
                  const country = countries[countryIdx];
                  commentator.announceDropCollected(country, drop.type);

                  if (drop.type === 'bomb') {
                    soundEngine.playBombExplosion();
                    const centerC = Math.floor(drop.x / cellW);
                    const centerR = Math.floor(drop.y / cellH);
                    const bombRadius = 6;

                    for (let r = Math.max(0, centerR - bombRadius); r <= Math.min(gridRows - 1, centerR + bombRadius); r++) {
                      for (let c = Math.max(0, centerC - bombRadius); c <= Math.min(gridCols - 1, centerC + bombRadius); c++) {
                        if (Math.hypot(c - centerC, r - centerR) <= bombRadius) {
                          const cIdx = r * gridCols + c;
                          const prevOwner = state.grid[cIdx];
                          if (prevOwner !== countryIdx) {
                            const prevId = countries[prevOwner]?.id;
                            if (prevId && state.territoryCounts[prevId] > 0) {
                              state.territoryCounts[prevId]--;
                            }
                            state.grid[cIdx] = countryIdx;
                            state.tileFlashes[cIdx] = 1.0;
                            state.territoryCounts[ball.countryId] = (state.territoryCounts[ball.countryId] || 0) + 1;
                          }
                        }
                      }
                    }

                    if (!potatoMode) {
                      for (let i = 0; i < 35; i++) {
                        const ang = Math.random() * Math.PI * 2;
                        const spd = 3 + Math.random() * 8;
                        state.particles.push({
                          x: drop.x,
                          y: drop.y,
                          vx: Math.cos(ang) * spd,
                          vy: Math.sin(ang) * spd,
                          color: country.primaryColor,
                          size: 4 + Math.random() * 4,
                          life: 0,
                          maxLife: 30,
                        });
                      }
                    }

                    state.floatingTexts.push({
                      id: state.floatingIdCounter++,
                      text: `💣 ${country.emoji} BOMB BLAST!`,
                      x: drop.x,
                      y: drop.y - 30,
                      color: '#ef4444',
                      life: 0,
                      maxLife: 70,
                    });
                  } else if (drop.type === 'multi_ball') {
                    spawnBallForCountry(ball.countryId, drop.x, drop.y);
                    spawnBallForCountry(ball.countryId, drop.x + 10, drop.y + 10);
                    state.floatingTexts.push({
                      id: state.floatingIdCounter++,
                      text: `⚽ ${country.emoji} +2 BALLS!`,
                      x: drop.x,
                      y: drop.y - 30,
                      color: '#38bdf8',
                      life: 0,
                      maxLife: 70,
                    });
                  } else if (drop.type === 'speed') {
                    ball.supercharged = true;
                    setTimeout(() => {
                      ball.supercharged = false;
                    }, 6000);
                    state.floatingTexts.push({
                      id: state.floatingIdCounter++,
                      text: `⚡ ${country.emoji} SUPERCHARGED!`,
                      x: drop.x,
                      y: drop.y - 30,
                      color: '#f59e0b',
                      life: 0,
                      maxLife: 70,
                    });
                  } else if (drop.type === 'laser') {
                    soundEngine.playLaserBeam();
                    const centerC = Math.floor(drop.x / cellW);
                    const centerR = Math.floor(drop.y / cellH);

                    for (let c = 0; c < gridCols; c++) {
                      const cIdx = centerR * gridCols + c;
                      const prevOwner = state.grid[cIdx];
                      if (prevOwner !== countryIdx) {
                        const prevId = countries[prevOwner]?.id;
                        if (prevId && state.territoryCounts[prevId] > 0) state.territoryCounts[prevId]--;
                        state.grid[cIdx] = countryIdx;
                        state.tileFlashes[cIdx] = 1.0;
                        state.territoryCounts[ball.countryId] = (state.territoryCounts[ball.countryId] || 0) + 1;
                      }
                    }
                    for (let r = 0; r < gridRows; r++) {
                      const cIdx = r * gridCols + centerC;
                      const prevOwner = state.grid[cIdx];
                      if (prevOwner !== countryIdx) {
                        const prevId = countries[prevOwner]?.id;
                        if (prevId && state.territoryCounts[prevId] > 0) state.territoryCounts[prevId]--;
                        state.grid[cIdx] = countryIdx;
                        state.tileFlashes[cIdx] = 1.0;
                        state.territoryCounts[ball.countryId] = (state.territoryCounts[ball.countryId] || 0) + 1;
                      }
                    }

                    state.floatingTexts.push({
                      id: state.floatingIdCounter++,
                      text: `💥 ${country.emoji} LASER CROSS!`,
                      x: drop.x,
                      y: drop.y - 30,
                      color: '#ec4899',
                      life: 0,
                      maxLife: 70,
                    });
                  } else if (drop.type === 'freeze') {
                    soundEngine.playFreeze();

                    // Freeze all other countries' balls for 6.5 seconds!
                    const freezeDuration = 6500;
                    state.balls.forEach((b) => {
                      if (b.countryId !== ball.countryId) {
                        b.frozenUntil = time + freezeDuration;
                        b.freezeOwnerId = ball.countryId;
                        if (Math.hypot(b.vx, b.vy) < 1.0) {
                          const ang = Math.random() * Math.PI * 2;
                          b.vx = Math.cos(ang) * BASE_SPEED;
                          b.vy = Math.sin(ang) * BASE_SPEED;
                        }
                      }
                    });

                    // Sparkling ice particle blast (Bypassed in Potato Mode)
                    if (!potatoMode) {
                      for (let i = 0; i < 45; i++) {
                        const ang = Math.random() * Math.PI * 2;
                        const spd = 2 + Math.random() * 8;
                        state.particles.push({
                          x: drop.x,
                          y: drop.y,
                          vx: Math.cos(ang) * spd,
                          vy: Math.sin(ang) * spd,
                          color: '#38bdf8',
                          size: 3 + Math.random() * 4,
                          life: 0,
                          maxLife: 40,
                        });
                      }
                    }

                    state.floatingTexts.push({
                      id: state.floatingIdCounter++,
                      text: `❄️ ${country.emoji} BLIZZARD! HIT TO SHATTER!`,
                      x: drop.x,
                      y: drop.y - 35,
                      color: '#38bdf8',
                      life: 0,
                      maxLife: 90,
                    });
                  }

                  state.drops.splice(dIdx, 1);
                }
              }
            }

            // Grid collision and territory conquering
            const minCol = Math.max(0, Math.floor((ball.x - ball.radius) / cellW));
            const maxCol = Math.min(gridCols - 1, Math.floor((ball.x + ball.radius) / cellW));
            const minRow = Math.max(0, Math.floor((ball.y - ball.radius) / cellH));
            const maxRow = Math.min(gridRows - 1, Math.floor((ball.y + ball.radius) / cellH));

            let conqueredAny = false;
            let normalX = 0;
            let normalY = 0;

            for (let r = minRow; r <= maxRow; r++) {
              for (let c = minCol; c <= maxCol; c++) {
                const cellIndex = r * gridCols + c;
                const cellOwner = state.grid[cellIndex];

                if (cellOwner !== countryIdx) {
                  const prevOwnerId = countries[cellOwner]?.id;
                  if (prevOwnerId && state.territoryCounts[prevOwnerId] > 0) {
                    state.territoryCounts[prevOwnerId]--;
                  }

                  state.grid[cellIndex] = countryIdx;
                  state.tileFlashes[cellIndex] = 1.0;
                  state.territoryCounts[ball.countryId] = (state.territoryCounts[ball.countryId] || 0) + 1;
                  conqueredAny = true;

                  const cellCenterX = (c + 0.5) * cellW;
                  const cellCenterY = (r + 0.5) * cellH;
                  const dx = ball.x - cellCenterX;
                  const dy = ball.y - cellCenterY;

                  if (Math.abs(dx) > Math.abs(dy)) {
                    normalX += dx > 0 ? 1 : -1;
                  } else {
                    normalY += dy > 0 ? 1 : -1;
                  }

                  if (!potatoMode && Math.random() < 0.3) {
                    state.particles.push({
                      x: cellCenterX,
                      y: cellCenterY,
                      vx: (Math.random() - 0.5) * 3,
                      vy: (Math.random() - 0.5) * 3,
                      color: countries[countryIdx].primaryColor,
                      size: 2 + Math.random() * 2,
                      life: 0,
                      maxLife: 15,
                    });
                  }
                }
              }
            }

            // Ball bounce
            if (conqueredAny && !ball.supercharged) {
              const now = performance.now();
              if (now - state.lastSoundConquerTime > 30) {
                soundEngine.playConquer(320 + (countryIdx % 8) * 35);
                state.lastSoundConquerTime = now;
              }

              if (normalX !== 0) ball.vx = normalX > 0 ? Math.abs(ball.vx) : -Math.abs(ball.vx);
              if (normalY !== 0) ball.vy = normalY > 0 ? Math.abs(ball.vy) : -Math.abs(ball.vy);
              if (normalX === 0 && normalY === 0) {
                if (Math.abs(ball.vx) > Math.abs(ball.vy)) ball.vx = -ball.vx;
                else ball.vy = -ball.vy;
              }

              const jitter = (Math.random() - 0.5) * 0.12;
              const currentAngle = Math.atan2(ball.vy, ball.vx) + jitter;
              const spd = Math.hypot(ball.vx, ball.vy);
              ball.vx = Math.cos(currentAngle) * spd;
              ball.vy = Math.sin(currentAngle) * spd;
            }
          }

          // Ball-to-Ball Collision & FATAL ICE SHATTER
          if (s === 0) {
            for (let i = 0; i < state.balls.length; i++) {
              const bA = state.balls[i];
              if (!bA) continue;
              const isFrozenA = !!(bA.frozenUntil && bA.frozenUntil > time);

              for (let j = i + 1; j < state.balls.length; j++) {
                const bB = state.balls[j];
                if (!bB) continue;
                const isFrozenB = !!(bB.frozenUntil && bB.frozenUntil > time);

                const dx = bB.x - bA.x;
                const dy = bB.y - bA.y;
                const dist = Math.hypot(dx, dy);
                const minDist = bA.radius + bB.radius;

                if (dist < minDist && dist > 0) {
                  // FATAL SHATTER CASE 1: bA is active, bB is frozen from a different country -> bB SHATTERS!
                  if (!isFrozenA && isFrozenB && bA.countryId !== bB.countryId) {
                    const attackerCountry = countries.find((c) => c.id === bA.countryId);
                    const victimCountry = countries.find((c) => c.id === bB.countryId);

                    soundEngine.playIceShatter();
                    if (attackerCountry && victimCountry) {
                      commentator.announceBallShatter(attackerCountry, victimCountry);
                    }

                    // Ice shards particle explosion
                    for (let p = 0; p < 36; p++) {
                      const ang = Math.random() * Math.PI * 2;
                      const spd = 3 + Math.random() * 8;
                      state.particles.push({
                        x: bB.x,
                        y: bB.y,
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd,
                        color: p % 2 === 0 ? '#7dd3fc' : (victimCountry?.primaryColor || '#ffffff'),
                        size: 3 + Math.random() * 4,
                        life: 0,
                        maxLife: 35,
                      });
                    }

                    state.floatingTexts.push({
                      id: state.floatingIdCounter++,
                      text: `💥 ${victimCountry?.name.toUpperCase()} SHATTERED!`,
                      x: bB.x,
                      y: bB.y - 25,
                      color: '#38bdf8',
                      life: 0,
                      maxLife: 80,
                    });

                    // Attacker captures territory splash around shatter point
                    if (attackerCountry) {
                      const centerC = Math.floor(bB.x / cellW);
                      const centerR = Math.floor(bB.y / cellH);
                      const splashR = 4;
                      const attIdx = countries.findIndex((c) => c.id === attackerCountry.id);
                      if (attIdx !== -1) {
                        for (let r = Math.max(0, centerR - splashR); r <= Math.min(gridRows - 1, centerR + splashR); r++) {
                          for (let c = Math.max(0, centerC - splashR); c <= Math.min(gridCols - 1, centerC + splashR); c++) {
                            if (Math.hypot(c - centerC, r - centerR) <= splashR) {
                              const cIdx = r * gridCols + c;
                              const prevOwner = state.grid[cIdx];
                              if (prevOwner !== attIdx) {
                                const prevId = countries[prevOwner]?.id;
                                if (prevId && state.territoryCounts[prevId] > 0) state.territoryCounts[prevId]--;
                                state.grid[cIdx] = attIdx;
                                state.tileFlashes[cIdx] = 1.0;
                                state.territoryCounts[attackerCountry.id] = (state.territoryCounts[attackerCountry.id] || 0) + 1;
                              }
                            }
                          }
                        }
                      }
                    }

                    const victimId = bB.countryId;
                    state.balls.splice(j, 1);

                    // If victim has 0 balls remaining and not eliminated, respawn after 3.5s
                    const remaining = state.balls.filter((b) => b.countryId === victimId);
                    if (remaining.length === 0 && !state.eliminated[victimId]) {
                      setTimeout(() => {
                        if (!state.eliminated[victimId] && !state.roundEnded) {
                          spawnBallForCountry(victimId);
                        }
                      }, 3500);
                    }
                    break;
                  }
                  // FATAL SHATTER CASE 2: bB is active, bA is frozen from a different country -> bA SHATTERS!
                  else if (!isFrozenB && isFrozenA && bA.countryId !== bB.countryId) {
                    const attackerCountry = countries.find((c) => c.id === bB.countryId);
                    const victimCountry = countries.find((c) => c.id === bA.countryId);

                    soundEngine.playIceShatter();
                    if (attackerCountry && victimCountry) {
                      commentator.announceBallShatter(attackerCountry, victimCountry);
                    }

                    for (let p = 0; p < 36; p++) {
                      const ang = Math.random() * Math.PI * 2;
                      const spd = 3 + Math.random() * 8;
                      state.particles.push({
                        x: bA.x,
                        y: bA.y,
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd,
                        color: p % 2 === 0 ? '#7dd3fc' : (victimCountry?.primaryColor || '#ffffff'),
                        size: 3 + Math.random() * 4,
                        life: 0,
                        maxLife: 35,
                      });
                    }

                    state.floatingTexts.push({
                      id: state.floatingIdCounter++,
                      text: `💥 ${victimCountry?.name.toUpperCase()} SHATTERED!`,
                      x: bA.x,
                      y: bA.y - 25,
                      color: '#38bdf8',
                      life: 0,
                      maxLife: 80,
                    });

                    if (attackerCountry) {
                      const centerC = Math.floor(bA.x / cellW);
                      const centerR = Math.floor(bA.y / cellH);
                      const splashR = 4;
                      const attIdx = countries.findIndex((c) => c.id === attackerCountry.id);
                      if (attIdx !== -1) {
                        for (let r = Math.max(0, centerR - splashR); r <= Math.min(gridRows - 1, centerR + splashR); r++) {
                          for (let c = Math.max(0, centerC - splashR); c <= Math.min(gridCols - 1, centerC + splashR); c++) {
                            if (Math.hypot(c - centerC, r - centerR) <= splashR) {
                              const cIdx = r * gridCols + c;
                              const prevOwner = state.grid[cIdx];
                              if (prevOwner !== attIdx) {
                                const prevId = countries[prevOwner]?.id;
                                if (prevId && state.territoryCounts[prevId] > 0) state.territoryCounts[prevId]--;
                                state.grid[cIdx] = attIdx;
                                state.tileFlashes[cIdx] = 1.0;
                                state.territoryCounts[attackerCountry.id] = (state.territoryCounts[attackerCountry.id] || 0) + 1;
                              }
                            }
                          }
                        }
                      }
                    }

                    const victimId = bA.countryId;
                    state.balls.splice(i, 1);

                    const remaining = state.balls.filter((b) => b.countryId === victimId);
                    if (remaining.length === 0 && !state.eliminated[victimId]) {
                      setTimeout(() => {
                        if (!state.eliminated[victimId] && !state.roundEnded) {
                          spawnBallForCountry(victimId);
                        }
                      }, 3500);
                    }
                    break;
                  }
                  // CASE 3: Normal elastic collision bounce between moving balls
                  else if (!isFrozenA && !isFrozenB) {
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const kx = bA.vx - bB.vx;
                    const ky = bA.vy - bB.vy;
                    const p = 2 * (nx * kx + ny * ky) / 2;
                    bA.vx -= p * nx;
                    bA.vy -= p * ny;
                    bB.vx += p * nx;
                    bB.vy += p * ny;
                    soundEngine.playBounce(320);
                  }
                }
              }
            }
          }
        }

        // Territory calculations & centers of mass
        const percentages: Record<string, number> = {};
        const activeBallsCount: Record<string, number> = {};
        const centers: Record<string, { sumX: number; sumY: number; count: number }> = {};

        countries.forEach((c) => {
          percentages[c.id] = ((state.territoryCounts[c.id] || 0) / totalCells) * 100;
          activeBallsCount[c.id] = state.balls.filter((b) => b.countryId === c.id).length;
          centers[c.id] = { sumX: 0, sumY: 0, count: 0 };
        });

        // Compute centers of mass for each country's active territory
        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            const ownerIdx = state.grid[r * gridCols + c];
            const country = countries[ownerIdx];
            if (country) {
              const cellCenterX = (c + 0.5) * cellW;
              const cellCenterY = (r + 0.5) * cellH;
              centers[country.id].sumX += cellCenterX;
              centers[country.id].sumY += cellCenterY;
              centers[country.id].count++;
            }
          }
        }
        state.territoryCenters = centers;

        // Spawning milestone check ("Gain more balls as more territory is captured!")
        const basePct = 100 / countries.length;
        const step = mode === 'mega_world' ? 2 : spawnThresholdPercent;

        countries.forEach((country) => {
          const pct = percentages[country.id] || 0;
          const milestones = state.milestonesPassed[country.id];
          const commMilestones = state.commentaryMilestonesPassed[country.id];

          // Commentary trigger when controlling large fraction
          [40, 60, 80].forEach((major) => {
            if (pct >= major && !commMilestones.has(major)) {
              commMilestones.add(major);
              commentator.announceDominance(country, pct);
            }
          });

          for (let thresh = Math.floor(basePct + step); thresh <= 95; thresh += step) {
            if (pct >= thresh && !milestones.has(thresh)) {
              milestones.add(thresh);
              spawnBallForCountry(country.id);
            }
          }

          // Decisive Country Elimination Check (<8% in 4-country mode, <1.5% in 16-country mode)
          const count = state.territoryCounts[country.id] || 0;
          const elimThreshold = mode === 'classic_4' ? 8.0 : 1.5;
          const minTileCount = mode === 'classic_4' ? 8 : 14;
          const isUnderThreshold = pct < elimThreshold || count <= minTileCount;

          if (isUnderThreshold && !state.eliminated[country.id] && countries.length > 1) {
            state.eliminated[country.id] = true;

            // Explode country balls (Bypassed in Potato Mode)
            if (!potatoMode) {
              const dyingBalls = state.balls.filter((b) => b.countryId === country.id);
              dyingBalls.forEach((b) => {
                for (let i = 0; i < 25; i++) {
                  const ang = Math.random() * Math.PI * 2;
                  const spd = 3 + Math.random() * 7;
                  state.particles.push({
                    x: b.x,
                    y: b.y,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    color: country.primaryColor,
                    size: 4 + Math.random() * 4,
                    life: 0,
                    maxLife: 35,
                  });
                }
              });
            }
            state.balls = state.balls.filter((b) => b.countryId !== country.id);

            // Clean Sweep: Absorb remaining stray tiles into the dominant leader
            const leader = countries.reduce((best, cur) =>
              (percentages[cur.id] || 0) > (percentages[best.id] || 0) && cur.id !== country.id
                ? cur
                : best,
              countries.find((c) => c.id !== country.id) || countries[0]
            );
            const leaderIdx = countries.findIndex((c) => c.id === leader.id);
            const targetCountryIdx = countries.findIndex((c) => c.id === country.id);

            if (leaderIdx !== -1 && targetCountryIdx !== -1) {
              for (let i = 0; i < totalCells; i++) {
                if (state.grid[i] === targetCountryIdx) {
                  state.grid[i] = leaderIdx;
                  state.tileFlashes[i] = 1.0;
                }
              }
              state.territoryCounts[leader.id] =
                (state.territoryCounts[leader.id] || 0) + (state.territoryCounts[country.id] || 0);
              state.territoryCounts[country.id] = 0;
            }

            // High-impact Audio: Boxing Bell, Bass Boom, Crowd Roar & Commentator
            soundEngine.playElimination();
            soundEngine.playCrowdCheer();
            commentator.announceElimination(country);

            state.floatingTexts.push({
              id: state.floatingIdCounter++,
              text: `☠️ ${country.name.toUpperCase()} ELIMINATED!`,
              x: canvas.width / 2,
              y: canvas.height * 0.35 + Math.random() * 60,
              color: '#ef4444',
              life: 0,
              maxLife: 90,
            });
          }
        });

        // Check for Winner
        const surviving = countries.filter(
          (c) => !state.eliminated[c.id] && (state.territoryCounts[c.id] || 0) > 0
        );
        let roundWinner: Country | null = null;

        if (surviving.length === 1 && countries.length > 1) {
          roundWinner = surviving[0];
        } else {
          const dominator = countries.find((c) => (percentages[c.id] || 0) >= 92);
          if (dominator) roundWinner = dominator;
        }

        if (roundWinner && !state.roundEnded) {
          state.roundEnded = true;
          state.winner = roundWinner;
          soundEngine.playVictory();
          commentator.announceVictory(roundWinner);

          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.6 },
            colors: [roundWinner.primaryColor, roundWinner.secondaryColor, roundWinner.accentColor],
          });

          onRoundFinish(roundWinner);
        }

        onStatsUpdate({
          territoryCounts: { ...state.territoryCounts },
          territoryPercentages: { ...percentages },
          ballCounts: { ...activeBallsCount },
          eliminated: { ...state.eliminated },
          winner: state.winner,
        });
      } else {
        // Auto-restart countdown
        if (autoRestart) {
          state.autoRestartCountdown -= dt;
          if (state.autoRestartCountdown <= 0) {
            state.roundEnded = false;
            state.winner = null;
            if (onNextMatch) {
              onNextMatch();
            } else {
              resetMatch();
            }
          }
        }
      }

      // Particles & Floating Text updates
      for (let pIdx = state.particles.length - 1; pIdx >= 0; pIdx--) {
        const p = state.particles[pIdx];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life >= p.maxLife) state.particles.splice(pIdx, 1);
      }

      for (let fIdx = state.floatingTexts.length - 1; fIdx >= 0; fIdx--) {
        const ft = state.floatingTexts[fIdx];
        ft.y -= 0.8;
        ft.life++;
        if (ft.life >= ft.maxLife) state.floatingTexts.splice(fIdx, 1);
      }

      for (let i = 0; i < totalCells; i++) {
        if (state.tileFlashes[i] > 0) {
          state.tileFlashes[i] = Math.max(0, state.tileFlashes[i] - 0.08);
        }
      }

      // --- RENDERING PHASE ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const timeSec = time * 0.001;

      // 1. RENDER REALISTIC WAVING BACKGROUND FLAGS (Skipped in Potato Mode for 120 FPS Boost!)
      if (!potatoMode) {
        if (mode === 'classic_4' && countries.length === 4) {
          const halfW = canvas.width / 2;
          const halfH = canvas.height / 2;
          drawSectorBackgroundFlag(ctx, countries[0], 0, 0, halfW, halfH, timeSec);
          drawSectorBackgroundFlag(ctx, countries[1], halfW, 0, halfW, halfH, timeSec);
          drawSectorBackgroundFlag(ctx, countries[2], 0, halfH, halfW, halfH, timeSec);
          drawSectorBackgroundFlag(ctx, countries[3], halfW, halfH, halfW, halfH, timeSec);
        } else {
          const numColsDiv = Math.ceil(Math.sqrt(countries.length));
          const numRowsDiv = Math.ceil(countries.length / numColsDiv);
          const secW = canvas.width / numColsDiv;
          const secH = canvas.height / numRowsDiv;
          countries.forEach((country, idx) => {
            const sCol = idx % numColsDiv;
            const sRow = Math.floor(idx / numColsDiv);
            drawSectorBackgroundFlag(ctx, country, sCol * secW, sRow * secH, secW, secH, timeSec);
          });
        }
      } else {
        // Plain dark solid background for high-contrast visibility
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. RENDER EXPANDING FLAG TERRITORY
      ctx.globalAlpha = 0.88;
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const cellIndex = r * gridCols + c;
          const ownerIdx = state.grid[cellIndex];
          const owner = countries[ownerIdx];
          if (!owner) continue;

          const x = c * cellW;
          const y = r * cellH;

          if (potatoMode) {
            // Potato Mode: Fill simple flat color - extreme performance boost!
            ctx.fillStyle = owner.primaryColor;
            ctx.fillRect(x, y, cellW, cellH);
          } else {
            // Quality Mode: Real cloth waving lighting offset rendered at infinite speed with NO individual save/restores!
            drawTerritoryCell(ctx, owner, x, y, cellW, cellH, c, r, 0);
          }
        }
      }
      ctx.globalAlpha = 1.0;

      // Apply the beautiful waving cloth folds once globally over the entire canvas (Saves 2,300+ separate drawing passes!)
      if (!potatoMode) {
        applyClothWaveLighting(ctx, 0, 0, canvas.width, canvas.height, timeSec);
      }

      // Draw Separating Hairline Grid (Bypassed in Potato Mode for 120 FPS Boost!)
      if (!potatoMode) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.07)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let r = 1; r < gridRows; r++) {
          ctx.moveTo(0, r * cellH);
          ctx.lineTo(canvas.width, r * cellH);
        }
        for (let c = 1; c < gridCols; c++) {
          ctx.moveTo(c * cellW, 0);
          ctx.lineTo(c * cellW, canvas.height);
        }
        ctx.stroke();
      }

      // Draw Conquer Flashes (Bypassed in Potato Mode to avoid heavy cell-loop calculations)
      if (!potatoMode) {
        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            const cellIndex = r * gridCols + c;
            const flash = state.tileFlashes[cellIndex];
            if (flash > 0) {
              ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.72})`;
              ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
            }
          }
        }
      }

      // 3. DYNAMIC FLOATING NATIONAL EMBLEMS OVER CENTER-OF-MASS
      // As a country's flag expands, its national emblem dynamically travels to the center of its territory!
      countries.forEach((country) => {
        const centerData = state.territoryCenters[country.id];
        if (centerData && centerData.count > 0 && !state.eliminated[country.id]) {
          const avgX = centerData.sumX / centerData.count;
          const avgY = centerData.sumY / centerData.count;
          const pct = ((centerData.count) / totalCells) * 100;
          // In Potato Mode, only draw emblems for countries with > 3% area to prevent overlaps and overhead
          if (!potatoMode || pct > 3) {
            drawTerritoryCenterEmblem(ctx, country, avgX, avgY, pct);
          }
        }
      });

      // 3. Glowing Arena Outer Border
      ctx.strokeStyle = state.winner ? state.winner.accentColor : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

      // 4. Draw Ball Trails
      state.balls.forEach((ball) => {
        const country = countries.find((c) => c.id === ball.countryId);
        if (!country) return;

        ball.trail.forEach((point, idx) => {
          ctx.beginPath();
          const r = ball.radius * (0.3 + (idx / ball.trail.length) * 0.5);
          ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
          ctx.fillStyle = ball.supercharged ? '#f59e0b' : country.primaryColor;
          ctx.globalAlpha = (idx / ball.trail.length) * 0.3;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });
      });

      // 5. Draw Random Drops / Power-Up Crates
      state.drops.forEach((drop) => {
        const elapsed = (time - drop.createdAt) / 1000;
        const bob = Math.sin(elapsed * 4 + drop.bobOffset) * 4;

        ctx.save();
        ctx.translate(drop.x, drop.y + bob);

        const pulseR = drop.radius + Math.sin(elapsed * 6) * 3;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR + 4, 0, Math.PI * 2);
        ctx.strokeStyle = drop.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = drop.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(0, 0, drop.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(drop.icon, 0, 1);

        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(drop.label, 0, -drop.radius - 8);

        ctx.restore();
      });

      // 6. Draw Particles
      state.particles.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.fill();
        ctx.restore();
      });

      // 7. Draw Country Balls (Extreme Potato High-Speed Renderer)
      state.balls.forEach((ball) => {
        const country = countries.find((c) => c.id === ball.countryId);
        if (country) {
          const isFrozen = !!(ball.frozenUntil && ball.frozenUntil > time);
          
          if (potatoMode) {
            ctx.save();
            // Crisp, simple 2D circle with no filter blurs or expensive gradients
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = isFrozen ? '#38bdf8' : country.primaryColor;
            ctx.fill();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Direct flat text overlay
            ctx.font = `bold ${Math.round(ball.radius * 1.15)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(country.emoji, ball.x, ball.y);
            ctx.restore();
          } else {
            drawCountryBall(
              ctx,
              country,
              ball.x,
              ball.y,
              ball.radius,
              ball.rotation,
              ball.vx,
              ball.vy,
              ball.supercharged,
              isFrozen
            );
          }
        }
      });

      // 8. Draw Floating Texts
      state.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, 1 - ft.life / ft.maxLife);
        // Double-draw shadow instead of expensive canvas shadowBlur
        ctx.fillStyle = '#000000';
        ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // 9. Victory Banner Overlay on Canvas
      if (state.roundEnded && state.winner) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cardW = 460;
        const cardH = 210;
        const cardX = (canvas.width - cardW) / 2;
        const cardY = (canvas.height - cardH) / 2;

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = state.winner.primaryColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('👑 WORLD CHAMPION 👑', canvas.width / 2, cardY + 50);

        ctx.font = 'bold 34px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${state.winner.emoji} ${state.winner.name.toUpperCase()}`, canvas.width / 2, cardY + 102);

        ctx.font = '15px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Full Grid Domination Achieved!', canvas.width / 2, cardY + 138);

        if (autoRestart) {
          ctx.font = 'bold 16px monospace';
          ctx.fillStyle = '#38bdf8';
          const cd = Math.max(0, Math.ceil(state.autoRestartCountdown));
          ctx.fillText(`Next Battle Starting in ${cd}s...`, canvas.width / 2, cardY + 175);
        }

        ctx.restore();
      }

      if (!isBackup) {
        lastRafTime = performance.now();
        animationFrameId = requestAnimationFrame((t) => gameLoop(t, false));
      }
    };

    animationFrameId = requestAnimationFrame((t) => gameLoop(t, false));

    // Watchdog fallback loop for background streaming (e.g. when RDP window is disconnected)
    const backupIntervalId = setInterval(() => {
      const now = performance.now();
      // If requestAnimationFrame is active, let it handle the loop exclusively to prevent clashes!
      if (now - lastRafTime < 250) {
        return;
      }
      if (now - lastTickTime > 150) {
        // requestAnimationFrame has been throttled or suspended! Force a tick to keep stream alive.
        gameLoop(now, true);
      }
    }, 100);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(backupIntervalId);
    };
  }, [
    mode,
    countries,
    gridCols,
    gridRows,
    simSpeed,
    spawnThresholdPercent,
    randomDropsEnabled,
    autoRestart,
    onRoundFinish,
    onStatsUpdate,
    resetMatch,
    spawnBallForCountry,
    onNextMatch,
  ]);

  return (
    <div className="relative flex items-center justify-center bg-slate-950 p-0 sm:p-1 rounded-xl shadow-2xl border border-slate-800/60 w-full aspect-square overflow-hidden">
      <canvas
        ref={canvasRef}
        width={720}
        height={720}
        className="w-full aspect-square rounded-lg shadow-inner cursor-crosshair select-none object-contain block"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const scale = 720 / rect.width;
          const clickX = (e.clientX - rect.left) * scale;
          const clickY = (e.clientY - rect.top) * scale;

          soundEngine.playBounce(440);
          for (let i = 0; i < 20; i++) {
            stateRef.current.particles.push({
              x: clickX,
              y: clickY,
              vx: (Math.random() - 0.5) * 7,
              vy: (Math.random() - 0.5) * 7,
              color: '#38bdf8',
              size: 3 + Math.random() * 3,
              life: 0,
              maxLife: 25,
            });
          }
        }}
      />
    </div>
  );
};
