import React, { useState, useEffect } from 'react';
import { commentator, VOICE_PRESETS } from '../utils/commentator';
import { Mic, Volume2, VolumeX, Sparkles, Zap } from 'lucide-react';

interface CommentaryTickerProps {
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  obsCleanMode?: boolean;
}

export const CommentaryTicker: React.FC<CommentaryTickerProps> = ({
  voiceEnabled,
  onToggleVoice,
  obsCleanMode = false,
}) => {
  const [subtitle, setSubtitle] = useState<string>(
    'Flag Wars 24/7 Live Stream! Watch countries expand and battle for world domination!'
  );
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedURI, setSelectedURI] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('esports');

  useEffect(() => {
    const unsubSubtitle = commentator.subscribeSubtitles((text) => {
      setSubtitle(text);
    });

    const unsubVoices = commentator.onVoicesUpdated((voices) => {
      setAvailableVoices(voices);
      setSelectedURI(commentator.getSelectedVoiceURI());
    });

    // Initial check
    const currentVoices = commentator.getAvailableVoices();
    if (currentVoices.length > 0) {
      setAvailableVoices(currentVoices);
      setSelectedURI(commentator.getSelectedVoiceURI());
    }

    return () => {
      unsubSubtitle();
      unsubVoices();
    };
  }, []);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uri = e.target.value;
    setSelectedURI(uri);
    commentator.setVoiceByURI(uri);
    commentator.unlockAudio();
    commentator.speak('Commentator voice updated! Welcome to Flag Wars!', true, true);
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    setSelectedPresetId(presetId);
    commentator.setPreset(presetId);
    commentator.unlockAudio();
    commentator.speak('Announcer style tuned for live broadcast!', true, true);
  };

  const handleTestVoice = () => {
    commentator.unlockAudio();
    commentator.speak('UNBELIEVABLE PLAY! Direct hit on the enemy frontier!', true, true);
  };

  // OBS Clean Mode / Broadcast Ticker: Full subtitles, no truncation!
  if (obsCleanMode) {
    return (
      <div className="w-full bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-2 text-xs select-none shadow-md">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider shrink-0 self-center">
          <Mic
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
              voiceEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
            }`}
          />
          <span>Live Caster</span>
        </div>

        <p className="text-[10px] sm:text-xs text-slate-100 font-medium italic flex-1 whitespace-normal break-words leading-tight">
          "{subtitle}"
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[760px] bg-slate-900/95 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2 text-xs select-none shadow-lg">
      {/* Top Row: Live Subtitle Banner */}
      <div className="flex items-center gap-2.5 min-w-0 w-full">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider shrink-0">
          <Mic
            className={`w-3.5 h-3.5 ${
              voiceEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
            }`}
          />
          <span>Live Caster</span>
        </div>

        <p className="text-xs text-slate-100 font-medium truncate italic flex-1">
          "{subtitle}"
        </p>
      </div>

      {/* Bottom Row: Voice Selector, Style Preset, Test Button & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Voice Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Voice:</span>
            <select
              value={selectedURI}
              onChange={handleVoiceChange}
              title="Select Announcer Voice"
              className="bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-200 rounded-lg px-2 py-1 max-w-[150px] sm:max-w-[200px] truncate focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {availableVoices.length === 0 ? (
                <option value="">Default System Caster</option>
              ) : (
                availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name.replace(/Microsoft |Google |Online \(Natural\)|\(Natural\)/gi, '').trim()}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Style Preset Dropdown */}
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <select
              value={selectedPresetId}
              onChange={handlePresetChange}
              title="Commentator Delivery Style"
              className="bg-slate-950 border border-slate-800 text-[11px] font-semibold text-amber-300 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {VOICE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Test Button */}
          {voiceEnabled && (
            <button
              onClick={handleTestVoice}
              title="Preview Commentator Speech"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-transform active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Test Voice</span>
            </button>
          )}

          {/* Voice On/Off Toggle */}
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Mute AI Announcer Voice' : 'Enable AI Announcer Voice'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              voiceEnabled
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
