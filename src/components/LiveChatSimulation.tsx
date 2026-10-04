import React, { useState, useEffect, useRef } from 'react';
import { Country } from '../types/game';
import { MessageSquare, Send, Heart, Flame } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  avatarColor: string;
  countryEmoji: string;
  text: string;
  badge?: string;
  timestamp: string;
}

interface LiveChatSimulationProps {
  countries: Country[];
}

const CHAT_USERS = [
  'AlexGamer_99', 'RifatStreamer', 'FlagMaster2026', 'SpeedyBall',
  'GeoNerd', 'LiveChatMod', 'UltraFan_AF', 'PersianEmpire',
  'TelAviv_Boy', 'DelhiKing_99', 'WorldCupFan', 'TacticalGamer',
  'OBS_Producer', 'PixelWarrior', 'CountryBallLover', 'VortexGaming'
];

const TEMPLATE_MESSAGES = [
  { t: (c: Country) => `${c.emoji} ${c.name.toUpperCase()} GO FOR THE WIN!!`, type: 'cheer' },
  { t: (c: Country) => `Wait ${c.emoji} just got another ball! ⚽`, type: 'ball' },
  { t: (c: Country) => `COMEBACK IS REAL FOR ${c.name}! ${c.emoji}${c.emoji}`, type: 'cheer' },
  { t: (c: Country) => `${c.emoji} territory expanding fast!`, type: 'analysis' },
  { t: (c: Country) => `Vote ${c.code} in the chat! 🔥`, type: 'vote' },
  { t: (c: Country) => `Let's gooo ${c.emoji}!!`, type: 'cheer' },
  { t: (c: Country) => `${c.emoji} 4 balls active right now!! Insane!`, type: 'ball' },
];

export const LiveChatSimulation: React.FC<LiveChatSimulationProps> = ({ countries }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedVoteCountry, setSelectedVoteCountry] = useState<Country>(countries[0] || null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Periodic automatic chat generation mimicking real YouTube stream chat
  useEffect(() => {
    const interval = setInterval(() => {
      if (countries.length === 0) return;

      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomUser = CHAT_USERS[Math.floor(Math.random() * CHAT_USERS.length)];
      const tmpl = TEMPLATE_MESSAGES[Math.floor(Math.random() * TEMPLATE_MESSAGES.length)];
      const text = tmpl.t(randomCountry);

      const newMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        user: randomUser,
        avatarColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][
          Math.floor(Math.random() * 6)
        ],
        countryEmoji: randomCountry.emoji,
        text,
        badge: Math.random() < 0.2 ? 'Member' : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setMessages((prev) => [...prev.slice(-30), newMsg]);
    }, 2800);

    return () => clearInterval(interval);
  }, [countries]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userCountry = selectedVoteCountry || countries[0];
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      user: 'You (Streamer)',
      avatarColor: '#10b981',
      countryEmoji: userCountry ? userCountry.emoji : '🌍',
      text: inputText.trim(),
      badge: 'Host',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setMessages((prev) => [...prev.slice(-30), newMsg]);
    setInputText('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[400px] lg:h-[480px] overflow-hidden select-none">
      {/* Top chat bar */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-200">
            Live Stream Chat
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>Active Viewers</span>
        </div>
      </div>

      {/* Country Vote Buttons for Viewers */}
      <div className="px-3 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight shrink-0">
          Cheer:
        </span>
        <div className="flex items-center gap-1.5">
          {countries.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedVoteCountry(c);
                setInputText(`${c.emoji} Let's go ${c.name}! #1`);
              }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1 transition-transform active:scale-95"
            >
              <span>{c.emoji}</span>
              <span className="text-[10px]">{c.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat scroll box */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs font-sans scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
            <Heart className="w-6 h-6 mb-2 text-slate-600 animate-pulse" />
            <p className="text-xs">Live stream chat connecting...</p>
            <p className="text-[10px] text-slate-600">Cheer for your country!</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-sm shrink-0">{m.countryEmoji}</span>
              <div className="flex-1 min-w-0">
                <span
                  className="font-bold text-[11px] mr-1.5"
                  style={{ color: m.avatarColor }}
                >
                  {m.user}
                </span>
                {m.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold mr-1.5 border border-emerald-500/30">
                    {m.badge}
                  </span>
                )}
                <span className="text-slate-200 break-words">{m.text}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input box */}
      <form
        onSubmit={handleSendMessage}
        className="p-2 border-t border-slate-800 bg-slate-950/80 flex items-center gap-1.5"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Cheer for your country in chat..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
