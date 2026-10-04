import React from 'react';
import { Country, GameMode } from '../types/game';
import { Volume2, VolumeX, Maximize2, Radio, Globe, Dices, Layers, HelpCircle, Mic } from 'lucide-react';

interface BroadcastHeaderProps {
  mode: GameMode;
  onToggleMode: (newMode: GameMode) => void;
  matchNumber: number;
  elapsedSeconds: number;
  countries: Country[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  obsCleanMode: boolean;
  onToggleObsMode: () => void;
  onTriggerRoulette: () => void;
  onOpenRdpGuide: () => void;
  onOpenCpanelGuide: () => void;
}

export const BroadcastHeader: React.FC<BroadcastHeaderProps> = ({
  mode,
  onToggleMode,
  matchNumber,
  elapsedSeconds,
  countries,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  obsCleanMode,
  onToggleObsMode,
  onTriggerRoulette,
  onOpenRdpGuide,
  onOpenCpanelGuide,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2.5 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Stream Badge & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-950/80 border border-red-700/60 px-2.5 py-1 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-black tracking-wider text-red-200 uppercase">
              LIVE 24/7
            </span>
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>FLAG WARS</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                MATCH #{matchNumber}
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Game Mode Selector & Quick Draft */}
        <div className="flex items-center gap-2">
          {/* Game Mode Switch */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onToggleMode('classic_4')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'classic_4'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>4 Nations</span>
            </button>
            <button
              onClick={() => onToggleMode('mega_world')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'mega_world'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>16 Nations Royale</span>
            </button>
          </div>

          {/* Quick Draft Button for 4-country or 16-country mode */}
          <button
            onClick={onTriggerRoulette}
            title={mode === 'mega_world' ? 'Draft 16 New Random World Nations' : 'Draft 4 New Random Nations'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-transform active:scale-95"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {mode === 'mega_world' ? 'Draft 16 New' : 'Draft 4'}
            </span>
          </button>
        </div>

        {/* Right: Round Timer, Audio, Voice, RDP Guide & OBS Clean View */}
        <div className="flex items-center gap-2">
          {/* Timer */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-300">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {/* SFX Audio */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Voice Commentary Toggle */}
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Disable Live Voice Commentary' : 'Enable Live Voice Commentary'}
            className={`p-2 rounded-lg transition-colors ${
              voiceEnabled ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-500'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* RDP & OBS Guide Button */}
          <button
            onClick={onOpenRdpGuide}
            title="How to stream 24/7 with RDP & OBS Studio"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">RDP Setup</span>
          </button>

          {/* cPanel Hosting Guide Button */}
          <button
            onClick={onOpenCpanelGuide}
            title="How to host this game on a cPanel website"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">cPanel Host</span>
          </button>

          {/* OBS Clean Mode Toggle */}
          <button
            onClick={onToggleObsMode}
            title={obsCleanMode ? 'Exit OBS Clean Mode' : 'OBS Broadcast Mode (Clean)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              obsCleanMode
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{obsCleanMode ? 'EXIT OBS' : 'OBS VIEW'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
