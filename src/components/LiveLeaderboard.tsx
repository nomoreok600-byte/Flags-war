import React, { useState } from 'react';
import { Country, GameMode } from '../types/game';
import { Trophy, ShieldAlert, Skull, Zap, Globe, Search } from 'lucide-react';

interface LiveLeaderboardProps {
  mode: GameMode;
  countries: Country[];
  territoryPercentages: Record<string, number>;
  ballCounts: Record<string, number>;
  eliminated: Record<string, boolean>;
  winner: Country | null;
  history: {
    matchNumber: number;
    winner: Country;
    duration: string;
  }[];
  winCounts: Record<string, number>;
  obsCleanMode?: boolean;
  onToggleMode?: (newMode: GameMode) => void;
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  mode,
  countries,
  territoryPercentages,
  ballCounts,
  eliminated,
  winner,
  history,
  winCounts,
  obsCleanMode = false,
  onToggleMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sort countries by territory percentage descending
  const sorted = [...countries].sort((a, b) => {
    const pctA = territoryPercentages[a.id] || 0;
    const pctB = territoryPercentages[b.id] || 0;
    return pctB - pctA;
  });

  const filtered = searchQuery.trim() && !obsCleanMode
    ? sorted.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sorted;

  const aliveCount = countries.filter(
    (c) => !eliminated[c.id] && (territoryPercentages[c.id] || 0) > 0
  ).length;

  return (
    <div
      className={`bg-slate-900/95 border border-slate-800 rounded-2xl flex flex-col gap-2 select-none h-full p-2.5 sm:p-3 min-h-0 justify-between shadow-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
              {mode === 'mega_world' ? 'World Domination' : 'Territory Control'}
            </h2>
            <div className="text-[10px] sm:text-[11px] text-slate-400">
              <span className="text-emerald-400 font-bold">{aliveCount}</span> / {countries.length} Nations Active
            </div>
          </div>
        </div>

        {onToggleMode && (
          <button
            onClick={() => onToggleMode(mode === 'mega_world' ? 'classic_4' : 'mega_world')}
            title="Click to toggle between 4 Nations and 16 Nations World Royale"
            className="flex items-center gap-1 bg-slate-950 hover:bg-slate-800 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] sm:text-[11px] font-bold text-emerald-400 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
          >
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
            <span>{mode === 'mega_world' ? '16 Nations' : '4 Nations'}</span>
          </button>
        )}
      </div>

      {/* Search Bar for Mega World mode (hidden in OBS mode for clean broadcast) */}
      {mode === 'mega_world' && !obsCleanMode && (
        <div className="relative shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country in this match..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Country Rows (scrollable in Mega World mode, fills available height in OBS mode) */}
      <div
        className={`flex flex-col gap-2 overflow-y-auto ${
          obsCleanMode ? 'flex-1 pr-1 min-h-0' : mode === 'mega_world' ? 'max-h-[460px] pr-1' : ''
        }`}
      >
        {filtered.map((country) => {
          const rank = sorted.findIndex((c) => c.id === country.id);
          const pct = territoryPercentages[country.id] || 0;
          const balls = ballCounts[country.id] || 0;
          const isElim = eliminated[country.id] || pct <= 0;
          const isWinner = winner?.id === country.id;
          const wins = winCounts[country.id] || 0;

          return (
            <div
              key={country.id}
              className={`p-1.5 sm:p-2.5 rounded-xl border transition-all ${
                isWinner
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-500/10'
                  : isElim
                  ? 'bg-rose-950/30 border-rose-900/60 opacity-60'
                  : rank === 0
                  ? 'bg-indigo-950/40 border-indigo-500/60'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-black text-slate-500 w-4 sm:w-5 shrink-0">
                    #{rank + 1}
                  </span>
                  <span className="text-lg sm:text-xl shrink-0">{country.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 truncate">
                      <span
                        className={`text-xs font-bold tracking-wide truncate ${
                          isElim ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {country.name}
                      </span>
                      {wins > 0 && (
                        <span className="text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          👑 {wins}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`text-xs sm:text-sm font-black font-mono ${
                        isElim ? 'text-slate-500' : 'text-white'
                      }`}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[9px] sm:text-[10px] font-bold text-slate-300">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                    <span>{balls} {balls === 1 ? 'Ball' : 'Balls'}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-1.5 sm:h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, pct))}%`,
                    backgroundColor: country.primaryColor,
                    boxShadow: `0 0 8px ${country.accentColor || country.primaryColor}88`,
                  }}
                />
              </div>

              {/* Status footer for row */}
              <div className="mt-1 flex items-center justify-between text-[9px] sm:text-[10px]">
                {isWinner ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> MATCH WINNER
                  </span>
                ) : isElim ? (
                  <span className="text-red-500 font-bold flex items-center gap-1">
                    <Skull className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> ELIMINATED
                  </span>
                ) : pct <= 10 ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500" /> DANGER (&lt;8% ELIM)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">ACTIVE</span>
                )}

                <span className="text-slate-500 font-mono text-[9px] sm:text-[10px]">
                  {country.region}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Match History */}
      {history.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
            Recent Champions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {history.slice(-6).reverse().map((h) => (
              <span
                key={h.matchNumber}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300"
              >
                <span>{h.winner.emoji}</span>
                <span className="text-[10px] text-slate-400 font-mono">M#{h.matchNumber}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
