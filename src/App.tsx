import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Country, GameMode } from './types/game';
import {
  ALL_COUNTRIES,
  DEFAULT_PRESET,
  getRandom4Countries,
  getRandom16Countries,
} from './data/countries';
import { GameBoard } from './components/GameBoard';
import { LiveLeaderboard } from './components/LiveLeaderboard';
import { CommentaryTicker } from './components/CommentaryTicker';
import { PWAInstallButton } from './components/PWAInstallButton';
import { commentator } from './utils/commentator';
import { 
  Radio, Play, Square, Key, Check, AlertCircle, Eye, EyeOff, 
  Smartphone, Cpu, RefreshCw, Sparkles, Volume2, Users
} from 'lucide-react';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('classic_4');

  // Active participating countries
  const [countries, setCountries] = useState<Country[]>(() =>
    DEFAULT_PRESET.countries.map((code) => ALL_COUNTRIES[code])
  );

  const [matchNumber, setMatchNumber] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [territoryPercentages, setTerritoryPercentages] = useState<Record<string, number>>({});
  const [ballCounts, setBallCounts] = useState<Record<string, number>>({});
  const [eliminated, setEliminated] = useState<Record<string, boolean>>({});
  const [winner, setWinner] = useState<Country | null>(null);

  // Win counts & match history
  const [winCounts, setWinCounts] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<
    { matchNumber: number; winner: Country; duration: string }[]
  >([]);

  // ----------------------------------------------------
  // RTMP LIVE BROADCAST & YOUTUBE 9:16 SHORTS SETTINGS
  // ----------------------------------------------------
  const [showStreamPanel, setShowStreamPanel] = useState<boolean>(false);
  const [is916ShortsMode, setIs916ShortsMode] = useState<boolean>(true); // Default true for Shorts stream experience!
  const [isPotatoMode, setIsPotatoMode] = useState<boolean>(() =>
    localStorage.getItem('is_potato_mode') !== 'false'
  );
  const [streamUrl, setStreamUrl] = useState<string>(() => 
    localStorage.getItem('rtmp_server_url') || 'rtmp://a.rtmp.youtube.com/live2'
  );
  
  // Preconfigured default YouTube Stream Key!
  const [streamKey, setStreamKey] = useState<string>(() => 
    localStorage.getItem('rtmp_stream_key') || 'm3kx-5ae5-k3br-xr31-6h0w'
  );
  
  const [videoTitle, setVideoTitle] = useState<string>(() => 
    localStorage.getItem('stream_video_title') || '🏳️ FLAG WARS 24/7 LIVE BATTLE! ⚔️ World Domination'
  );
  const [videoDesc, setVideoDesc] = useState<string>(() => 
    localStorage.getItem('stream_video_desc') || 'Welcome to Flag Wars! Watch countries expand and battle in real-time.'
  );
  const [bitrate, setBitrate] = useState<string>('1000k'); 
  const [showKey, setShowKey] = useState<boolean>(false);
  
  // Streaming state machine
  const [streamStatus, setStreamStatus] = useState<'offline' | 'connecting' | 'live' | 'error'>('offline');
  const [streamLog, setStreamLog] = useState<string>('Stream system is ready to launch.');
  const [streamDuration, setStreamDuration] = useState<number>(0);

  // Sound levels visualizer simulation (flickers in response to stream status)
  const [audioBars, setAudioBars] = useState<number[]>([40, 50, 45, 60, 55, 70, 65, 80, 50, 60, 40]);

  // Streaming connections
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save stream settings when they change
  useEffect(() => {
    localStorage.setItem('rtmp_server_url', streamUrl);
    localStorage.setItem('rtmp_stream_key', streamKey);
    localStorage.setItem('stream_video_title', videoTitle);
    localStorage.setItem('stream_video_desc', videoDesc);
    localStorage.setItem('is_potato_mode', String(isPotatoMode));
  }, [streamUrl, streamKey, videoTitle, videoDesc, isPotatoMode]);

  // Handle stream ticker duration & audio bars animation
  useEffect(() => {
    let audioTimer: any = null;
    if (streamStatus === 'live') {
      streamTimerRef.current = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
      }, 1000);

      // Flickering volume bars
      audioTimer = setInterval(() => {
        setAudioBars(Array.from({ length: 11 }, () => 20 + Math.floor(Math.random() * 80)));
      }, 120);
    } else {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      setStreamDuration(0);
      setAudioBars([15, 20, 15, 10, 15, 25, 15, 20, 10, 15, 10]);
    }
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      if (audioTimer) clearInterval(audioTimer);
    };
  }, [streamStatus]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  // Enable commentator voice automatically
  useEffect(() => {
    commentator.setEnabled(true);
    commentator.unlockAudio();
  }, []);

  // Match timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [matchNumber]);

  // Handle switching between 4 Nations and 16 Nations World Royale
  const handleToggleMode = (newMode: GameMode) => {
    setGameMode(newMode);
    setMatchNumber((prev) => prev + 1);
    setElapsedSeconds(0);
    setWinner(null);

    if (newMode === 'mega_world') {
      setCountries(getRandom16Countries());
    } else {
      setCountries(getRandom4Countries());
    }
  };

  // Stats update callback from GameBoard
  const handleStatsUpdate = useCallback(
    (stats: {
      territoryCounts: Record<string, number>;
      territoryPercentages: Record<string, number>;
      ballCounts: Record<string, number>;
      eliminated: Record<string, boolean>;
      winner: Country | null;
    }) => {
      setTerritoryPercentages(stats.territoryPercentages);
      setBallCounts(stats.ballCounts);
      setEliminated(stats.eliminated);
      if (stats.winner) {
        setWinner(stats.winner);
      }
    },
    []
  );

  // Round finish callback: record winner in history and win counts
  const handleRoundFinish = useCallback(
    (roundWinner: Country) => {
      setWinner(roundWinner);
      setWinCounts((prev) => ({
        ...prev,
        [roundWinner.id]: (prev[roundWinner.id] || 0) + 1,
      }));

      const mins = Math.floor(elapsedSeconds / 60);
      const secs = elapsedSeconds % 60;
      const durationStr = `${mins}m ${secs}s`;

      setHistory((prev) => [
        ...prev,
        {
          matchNumber,
          winner: roundWinner,
          duration: durationStr,
        },
      ]);
    },
    [elapsedSeconds, matchNumber]
  );

  // Automatic match restart: triggers when victory countdown reaches 0
  const handleNextMatch = useCallback(() => {
    setElapsedSeconds(0);
    setWinner(null);
    setMatchNumber((prev) => prev + 1);

    if (gameMode === 'mega_world') {
      setCountries(getRandom16Countries());
    } else {
      setCountries(getRandom4Countries());
    }
  }, [gameMode]);

  // ----------------------------------------------------
  // CLIENT-SIDE CANVAS CAPTURE & WEBSOCKET STREAMING
  // ----------------------------------------------------
  const startStreaming = () => {
    if (!streamKey.trim()) {
      setStreamStatus('error');
      setStreamLog('Error: Please enter your YouTube Stream Key!');
      return;
    }

    const canvas = document.querySelector('canvas');
    if (!canvas) {
      setStreamStatus('error');
      setStreamLog('Error: Game canvas not found! Wait for page load.');
      return;
    }

    setStreamStatus('connecting');
    setStreamLog('Establishing secure stream handshake with local server...');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/stream?streamKey=${encodeURIComponent(streamKey)}&rtmpUrl=${encodeURIComponent(streamUrl)}&bitrate=${bitrate}&potatoMode=${isPotatoMode}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStreamStatus('live');
        setStreamLog('Handshake success! Broadcasting active canvas to YouTube...');
        
        // Capture game canvas element (15 FPS on Potato Mode, 30 FPS on Standard)
        const fps = isPotatoMode ? 15 : 30;
        const stream = canvas.captureStream(fps);

        // Record chunks dynamically every 200ms
        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm; codecs=vp8',
          videoBitsPerSecond: parseInt(bitrate) * 1000
        });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };

        recorder.start(200);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'status') {
            setStreamLog(data.message);
          } else if (data.type === 'error') {
            setStreamStatus('error');
            setStreamLog(`Error: ${data.message}`);
            stopStreaming();
          } else if (data.type === 'stopped') {
            setStreamStatus('offline');
            setStreamLog(`Broadcast stopped: ${data.message}`);
          }
        } catch (e) {
          setStreamLog(event.data.toString());
        }
      };

      ws.onerror = () => {
        setStreamStatus('error');
        setStreamLog('Error: Failed to connect to local streaming server. Is the executable running?');
        stopStreaming();
      };

      ws.onclose = () => {
        setStreamStatus('offline');
        setStreamLog('Stream connection closed gracefully.');
      };

    } catch (e: any) {
      setStreamStatus('error');
      setStreamLog(`Launch error: ${e.message}`);
      stopStreaming();
    }
  };

  const stopStreaming = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    mediaRecorderRef.current = null;

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
    }
    wsRef.current = null;

    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
    }
    streamTimerRef.current = null;

    setStreamStatus('offline');
  };

  const formatStreamTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // Render vertical 9:16 Shorts Streaming Layout
  const renderShortsLayout = () => (
    <div className="flex-1 h-full flex items-center justify-center relative overflow-hidden bg-slate-950 p-2 select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 z-0"></div>
      
      {/* 9:16 Shorts Frame Bounds with pulsing neon boundary lines */}
      <div className="relative w-full aspect-[9/16] max-w-[min(100vw-12px,55.5dvh)] h-full bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-[32px] shadow-[0_0_50px_rgba(79,70,229,0.15)] flex flex-col gap-2.5 p-2.5 z-10 overflow-hidden ring-4 ring-indigo-500/10">
        
        {/* Stream Banner Tag */}
        <div className="flex items-center justify-between bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-indigo-500/25 shrink-0 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse ring-4 ring-rose-500/30"></span>
            <span className="text-[11px] font-black uppercase text-rose-400 tracking-wider">LIVE</span>
            <span className="text-[10px] text-slate-400 font-bold">YOUTUBE SHORTS</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-300">
            MATCH #{matchNumber}
          </div>
        </div>

        {/* 1. Battle Arena Grid (Square, Full width) */}
        <div className="w-full aspect-square flex items-center justify-center shrink-0 min-h-0 relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-800">
          <GameBoard
            mode={gameMode}
            countries={countries}
            simSpeed={1.0}
            spawnThresholdPercent={gameMode === 'mega_world' ? 2 : 5}
            randomDropsEnabled={true}
            soundEnabled={true}
            soundVolume={0.7}
            autoRestart={true}
            restartCountdownSeconds={5}
            onStatsUpdate={handleStatsUpdate}
            onRoundFinish={handleRoundFinish}
            matchNumber={matchNumber}
            onNextMatch={handleNextMatch}
            potatoMode={isPotatoMode}
          />
        </div>

        {/* 2. Live Commentary Ticker */}
        <div className="w-full shrink-0">
          <CommentaryTicker
            voiceEnabled={true}
            onToggleVoice={() => {}}
            obsCleanMode={true}
          />
        </div>

        {/* Real-time audio peak meter visualizer */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 shrink-0">
          <Volume2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <div className="flex-1 h-3 flex items-center gap-0.5 min-w-0">
            {audioBars.map((h, i) => (
              <div 
                key={i} 
                style={{ height: `${h}%` }}
                className={`flex-1 rounded-sm transition-all duration-100 ${
                  h > 75 
                    ? 'bg-rose-500' 
                    : h > 50 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-400'
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0 select-none">AUDIO IN</span>
        </div>

        {/* 3. Territory Rankings Standings list */}
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <LiveLeaderboard
            mode={gameMode}
            countries={countries}
            territoryPercentages={territoryPercentages}
            ballCounts={ballCounts}
            eliminated={eliminated}
            winner={winner}
            history={history}
            winCounts={winCounts}
            obsCleanMode={true}
            onToggleMode={handleToggleMode}
          />
        </div>

        {/* Bottom stream subscriber loop marquee ticker */}
        <div className="w-full bg-indigo-950/40 border border-indigo-500/10 px-2 py-1 rounded-lg overflow-hidden shrink-0">
          <div className="animate-marquee whitespace-nowrap text-[9px] font-bold text-indigo-300 tracking-wide select-none">
            ⚔️ FLAG WARS WORLD DOMINATION! Watch countries expand, claim territories, and claim ultimate victory! 🏆 Drop items: LASER, FREEZE, SPEED, BOMB! 👉 Like & Subscribe to influence the drops! 🎉 Stream is fully automated.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-row font-sans select-none relative">
      
      {/* RTMP LIVE BROADCAST CONTROL PANEL */}
      <div 
        className={`absolute top-0 left-0 h-full w-[310px] sm:w-[350px] bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 flex flex-col p-4 shadow-2xl justify-between ${
          showStreamPanel ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">Broadcast Control</h2>
            </div>
            <button 
              onClick={() => setShowStreamPanel(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 leading-relaxed flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Optimized for Windows RDP</span>
            </div>
            <p>1. Toggle **9:16 Shorts Layout** to center the broadcast feed perfectly.</p>
            <p>2. Paste your **YouTube Stream Key** below.</p>
            <p>3. Tap **Start Stream** to broadcast directly to YouTube Shorts!</p>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Video Title</label>
              <input 
                type="text" 
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter live stream title..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <textarea 
                value={videoDesc}
                onChange={(e) => setVideoDesc(e.target.value)}
                placeholder="Enter live stream description..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-normal"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">YouTube Server URL</label>
              <input 
                type="text" 
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="rtmp://a.rtmp.youtube.com/live2"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>YouTube Stream Key</span>
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="text-[9px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                  <span>{showKey ? 'Hide' : 'Reveal'}</span>
                </button>
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input 
                  type={showKey ? 'text' : 'password'} 
                  value={streamKey}
                  onChange={(e) => setStreamKey(e.target.value)}
                  placeholder="Paste stream key (abcd-efgh-ijkl-mnop)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Stream Quality</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: '1000k', label: 'Mobile (1M)', desc: 'Phone Safe' },
                  { value: '1800k', label: 'Lite (1.8M)', desc: 'RDP Safe' },
                  { value: '2500k', label: 'Balanced', desc: 'Recommended' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setBitrate(item.value);
                    }}
                    className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      bitrate === item.value 
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-black">{item.label}</span>
                    <span className="text-[8px] opacity-75">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-200">YouTube 9:16 Shorts Layout</div>
                  <div className="text-[9px] text-slate-400">Fits vertical viewport stream perfectly</div>
                </div>
              </div>
              <input 
                type="checkbox"
                checked={is916ShortsMode}
                onChange={(e) => setIs916ShortsMode(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-500 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-200">SaaS Potato Mode (120 FPS Boost)</div>
                  <div className="text-[9px] text-slate-400">Zero-lag, ultra-lightweight high-performance grid</div>
                </div>
              </div>
              <input 
                type="checkbox"
                checked={isPotatoMode}
                onChange={(e) => setIsPotatoMode(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-500 accent-indigo-500 cursor-pointer"
              />
            </div>

            <PWAInstallButton />
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 flex flex-col gap-2 bg-slate-900 shrink-0">
          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="text-slate-400 font-bold uppercase">Broadcast Status:</span>
            {streamStatus === 'live' ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> LIVE ({formatStreamTime(streamDuration)})
              </span>
            ) : streamStatus === 'connecting' ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> CONNECTING...
              </span>
            ) : streamStatus === 'error' ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> ERROR
              </span>
            ) : (
              <span className="text-slate-500 font-bold">OFFLINE</span>
            )}
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[9px] font-mono text-indigo-300 h-11 overflow-y-auto leading-relaxed scrollbar-thin">
            {streamLog}
          </div>

          {streamStatus === 'live' || streamStatus === 'connecting' ? (
            <button
              onClick={stopStreaming}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-rose-600/10 flex items-center justify-center gap-2 text-xs"
            >
              <Square className="w-4 h-4 text-white fill-current" />
              <span>Terminate Live Broadcast</span>
            </button>
          ) : (
            <button
              onClick={startStreaming}
              className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold py-2 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-indigo-600/15 flex items-center justify-center gap-2 text-xs"
            >
              <Play className="w-4 h-4 text-white fill-current" />
              <span>Go Live on YouTube Shorts</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Trigger Button */}
      <button
        onClick={() => setShowStreamPanel(!showStreamPanel)}
        className="fixed bottom-3.5 left-3.5 z-40 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-3 rounded-full shadow-2xl transition-all cursor-pointer active:scale-95 group focus:outline-none flex items-center justify-center border border-indigo-400/20"
        title="Toggle Broadcast RTMP Settings"
      >
        <div className="relative">
          {streamStatus === 'live' && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border border-slate-950 animate-ping"></span>
          )}
          <Radio className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
        </div>
      </button>

      {/* Main Broadcast Screens Viewport */}
      {is916ShortsMode ? (
        renderShortsLayout()
      ) : (
        <div className="h-[100dvh] w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col md:flex-row p-1 sm:p-2 gap-1.5 sm:gap-2 font-sans select-none flex-1">
          <div className="w-full md:flex-1 h-auto md:h-full max-h-[50vh] sm:max-h-[54vh] md:max-h-none flex items-center justify-center shrink-0 min-h-0 relative">
            <GameBoard
              mode={gameMode}
              countries={countries}
              simSpeed={1.0}
              spawnThresholdPercent={gameMode === 'mega_world' ? 2 : 5}
              randomDropsEnabled={true}
              soundEnabled={true}
              soundVolume={0.7}
              autoRestart={true}
              restartCountdownSeconds={5}
              onStatsUpdate={handleStatsUpdate}
              onRoundFinish={handleRoundFinish}
              matchNumber={matchNumber}
              onNextMatch={handleNextMatch}
              potatoMode={isPotatoMode}
            />
          </div>

          <div className="md:hidden w-full shrink-0">
            <CommentaryTicker
              voiceEnabled={true}
              onToggleVoice={() => {}}
              obsCleanMode={true}
            />
          </div>

          <div className="w-full md:w-[320px] lg:w-[380px] flex-1 md:h-full flex flex-col gap-1.5 shrink-0 min-h-0 overflow-hidden">
            <div className="hidden md:block shrink-0">
              <CommentaryTicker
                voiceEnabled={true}
                onToggleVoice={() => {}}
                obsCleanMode={true}
              />
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <LiveLeaderboard
                mode={gameMode}
                countries={countries}
                territoryPercentages={territoryPercentages}
                ballCounts={ballCounts}
                eliminated={eliminated}
                winner={winner}
                history={history}
                winCounts={winCounts}
                obsCleanMode={true}
                onToggleMode={handleToggleMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
