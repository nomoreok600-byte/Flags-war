export type GameMode = 'classic_4' | 'mega_world';

export interface Country {
  id: string;
  name: string;
  code: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  flagType: 'horizontal_3' | 'vertical_3' | 'israel' | 'india' | 'iran' | 'afghanistan' | 'japan' | 'custom';
  stripeColors?: [string, string, string];
  emblemText?: string;
  region: string;
}

export interface Ball {
  id: number;
  countryId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  rotation: number;
  vRot: number;
  trail: { x: number; y: number; alpha: number }[];
  supercharged?: boolean;
  frozenUntil?: number; // timestamp until when ball is frozen in place
  freezeOwnerId?: string; // id of country that froze it
}

export type DropType = 'bomb' | 'multi_ball' | 'speed' | 'laser' | 'freeze';

export interface Drop {
  id: number;
  type: DropType;
  x: number;
  y: number;
  radius: number;
  color: string;
  icon: string;
  label: string;
  createdAt: number;
  lifespan: number; // in seconds
  bobOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface MatchStats {
  matchNumber: number;
  startTime: number;
  elapsedSeconds: number;
  territoryCounts: Record<string, number>;
  territoryPercentages: Record<string, number>;
  ballCounts: Record<string, number>;
  totalTiles: number;
  eliminated: Record<string, boolean>;
  winner: Country | null;
  history: {
    matchNumber: number;
    winner: Country;
    duration: string;
    mode: GameMode;
  }[];
}

export interface GameSettings {
  mode: GameMode;
  simSpeed: number;
  autoRestart: boolean;
  restartCountdownSeconds: number;
  randomDropsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  obsCleanMode: boolean;
  showChatOverlay: boolean;
}
