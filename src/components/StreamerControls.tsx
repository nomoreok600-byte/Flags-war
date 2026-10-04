import React from 'react';
import { Country, GameMode } from '../types/game';
import { MATCHUP_PRESETS, MatchupPreset } from '../data/countries';
import { RotateCcw, FastForward, Sliders, Sparkles, Volume2, Package, Dices, Globe, Layers } from 'lucide-react';

interface StreamerControlsProps {
  mode: GameMode;
  onSetMode: (mode: GameMode) => void;
  simSpeed: number;
  onSetSimSpeed: (speed: number) => void;
  autoRestart: boolean;
  onToggleAutoRestart: () => void;
  restartDelay: number;
  onSetRestartDelay: (delay: number) => void;
  randomDropsEnabled: boolean;
  onToggleRandomDrops: () => void;
  selectedPreset: MatchupPreset;
  onSelectPreset: (preset: MatchupPreset) => void;
  onTriggerRoulette: () => void;
  onResetMatch: () => void;
  onManualSpawnBall: (countryId: string) => void;
  countries: Country[];
  spawnThresholdPercent: number;
  onSetSpawnThreshold: (val: number) => void;
  soundVolume: number;
  onSetVolume: (vol: number) => void;
}

export const StreamerControls: React.FC<StreamerControlsProps> = ({
  mode,
  onSetMode,
  simSpeed,
  onSetSimSpeed,
  autoRestart,
  onToggleAutoRestart,
  restartDelay,
  onSetRestartDelay,
  randomDropsEnabled,
  onToggleRandomDrops,
  selectedPreset,
  onSelectPreset,
  onTriggerRoulette,
  onResetMatch,
  onManualSpawnBall,
  countries,
  spawnThresholdPercent,
  onSetSpawnThreshold,
  soundVolume,
  onSetVolume,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 select-none flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
            24/7 Streamer Control Deck
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'classic_4' && (
            <button
              onClick={onTriggerRoulette}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-transform active:scale-95"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Draft 4 Random Countries</span>
            </button>
          )}

          <button
            onClick={onResetMatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Match</span>
          </button>
        </div>
      </div>

      {/* Preset Matchups (Visible in Classic 4 mode) */}
      {mode === 'classic_4' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
              Select Battle Matchup Preset:
            </label>
            <span className="text-[11px] text-slate-500">Or use Draft to randomize from 70+ nations</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {MATCHUP_PRESETS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between mb-0.5">
                    <span className="truncate">{preset.name}</span>
                    {isSelected && <span className="text-[10px] text-indigo-400 font-black">ACTIVE</span>}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode and Toggles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Speed */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
            <span className="flex items-center gap-1">
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              Game Speed
            </span>
            <span className="font-mono text-amber-400">{simSpeed}x</span>
          </div>
          <div className="flex items-center gap-1">
            {[0.5, 1, 1.5, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSimSpeed(spd)}
                className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${
                  simSpeed === spd
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* 24/7 Auto Loop */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
            <span>24/7 Auto Loop</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                autoRestart
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {autoRestart ? 'ENABLED' : 'PAUSED'}
            </span>
          </div>
          <button
            onClick={onToggleAutoRestart}
            className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
              autoRestart
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {autoRestart ? 'Auto-Restart & Draft Next: ON' : 'Auto-Restart: OFF'}
          </button>
        </div>

        {/* Random Drops System */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-rose-400" />
              Random Drops
            </span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                randomDropsEnabled
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {randomDropsEnabled ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
          <button
            onClick={onToggleRandomDrops}
            className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
              randomDropsEnabled
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {randomDropsEnabled ? '💣 Power-Up Drops: ON' : 'Power-Up Drops: OFF'}
          </button>
        </div>

        {/* SFX Volume */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              SFX Volume
            </span>
            <span className="font-mono text-slate-400">{Math.round(soundVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soundVolume}
            onChange={(e) => onSetVolume(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Manual Live Interaction Buttons */}
      <div className="pt-2 border-t border-slate-800">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block mb-2">
          Streamer Live Interaction (Spawn Ball for Country):
        </label>
        <div className="flex flex-wrap gap-2">
          {countries.slice(0, 8).map((c) => (
            <button
              key={c.id}
              onClick={() => onManualSpawnBall(c.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>+1 Ball {c.emoji} {c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
