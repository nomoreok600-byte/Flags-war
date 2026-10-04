import React, { useState, useEffect } from 'react';
import { Country } from '../types/game';
import { ALL_COUNTRY_LIST } from '../data/countries';
import { soundEngine } from '../utils/audio';
import { Dices, Sparkles, Swords } from 'lucide-react';

interface CountryRouletteModalProps {
  isOpen: boolean;
  onSelectionComplete: (selected: Country[]) => void;
  onClose?: () => void;
}

export const CountryRouletteModal: React.FC<CountryRouletteModalProps> = ({
  isOpen,
  onSelectionComplete,
}) => {
  const [slotItems, setSlotItems] = useState<Country[]>([
    ALL_COUNTRY_LIST[0],
    ALL_COUNTRY_LIST[1],
    ALL_COUNTRY_LIST[2],
    ALL_COUNTRY_LIST[3],
  ]);
  const [lockedSlots, setLockedSlots] = useState<boolean[]>([false, false, false, false]);
  const [finalSelected, setFinalSelected] = useState<Country[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setLockedSlots([false, false, false, false]);
      setCountdown(null);
      return;
    }

    // Pick 4 unique random target countries
    const pool = [...ALL_COUNTRY_LIST].sort(() => 0.5 - Math.random());
    const targets = pool.slice(0, 4);
    setFinalSelected(targets);
    setLockedSlots([false, false, false, false]);
    setCountdown(null);

    let tickCount = 0;
    const spinInterval = setInterval(() => {
      tickCount++;
      soundEngine.playRouletteTick();

      setSlotItems((prev) =>
        prev.map((item, idx) => {
          if (lockedSlots[idx]) return item;
          // Random country during spin
          return ALL_COUNTRY_LIST[Math.floor(Math.random() * ALL_COUNTRY_LIST.length)];
        })
      );
    }, 80);

    // Lock in slot 0 after 1.0s
    const timer0 = setTimeout(() => {
      setSlotItems((prev) => [targets[0], prev[1], prev[2], prev[3]]);
      setLockedSlots([true, false, false, false]);
      soundEngine.playRouletteLock();
    }, 1100);

    // Lock in slot 1 after 1.8s
    const timer1 = setTimeout(() => {
      setSlotItems((prev) => [targets[0], targets[1], prev[2], prev[3]]);
      setLockedSlots([true, true, false, false]);
      soundEngine.playRouletteLock();
    }, 1900);

    // Lock in slot 2 after 2.6s
    const timer2 = setTimeout(() => {
      setSlotItems((prev) => [targets[0], targets[1], targets[2], prev[3]]);
      setLockedSlots([true, true, true, false]);
      soundEngine.playRouletteLock();
    }, 2700);

    // Lock in slot 3 after 3.4s
    const timer3 = setTimeout(() => {
      clearInterval(spinInterval);
      setSlotItems(targets);
      setLockedSlots([true, true, true, true]);
      soundEngine.playRouletteLock();
      soundEngine.playBallSpawn();

      // Start countdown to match
      setCountdown(3);
    }, 3500);

    return () => {
      clearInterval(spinInterval);
      clearTimeout(timer0);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  // Countdown timer once all locked
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      onSelectionComplete(finalSelected);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, finalSelected, onSelectionComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/80 rounded-3xl p-6 shadow-2xl shadow-indigo-500/20 text-center flex flex-col items-center gap-5">
        {/* Header */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <Dices className="w-4 h-4 animate-spin" />
            <span>World Country Draft</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>DRAFTING NEXT BATTLE</span>
            <Sparkles className="w-6 h-6 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400">
            Selecting 4 random nations from worldwide roster for the next match
          </p>
        </div>

        {/* 4 Slot Machine Wheels */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {slotItems.map((country, idx) => {
            const isLocked = lockedSlots[idx];
            return (
              <div
                key={idx}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 min-h-[140px] overflow-hidden ${
                  isLocked
                    ? 'bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20 scale-100'
                    : 'bg-slate-950/70 border-indigo-500/50 animate-pulse scale-95'
                }`}
              >
                {/* Slot index tag */}
                <div className="absolute top-2 left-2 text-[10px] font-black text-slate-500">
                  SLOT #{idx + 1}
                </div>

                {/* Country Flag & Emoji */}
                <div className="text-4xl sm:text-5xl mb-2 transition-transform duration-100">
                  {country.emoji}
                </div>

                {/* Country Name */}
                <div className="text-sm font-black text-white truncate max-w-[120px]">
                  {country.name}
                </div>

                <div className="text-[11px] font-semibold text-slate-400">
                  {country.region}
                </div>

                {/* Status indicator */}
                <div className="mt-2">
                  {isLocked ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase">
                      ✓ LOCKED IN
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                      ROLLING...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Countdown / Ready State */}
        {countdown !== null ? (
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center gap-2 text-amber-400 font-black text-lg sm:text-xl">
              <Swords className="w-5 h-5" />
              <span>BATTLE COMMENCING IN {countdown}...</span>
            </div>
            <button
              onClick={() => onSelectionComplete(finalSelected)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              Start Instantly
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-mono animate-pulse">
            Drafting country balls...
          </div>
        )}
      </div>
    </div>
  );
};
