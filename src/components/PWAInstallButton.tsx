import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, CheckCircle, Info } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
    }
  };

  // If already running as an installed standalone app, show status or hide
  if (isInstalled || justInstalled) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        <div className="text-left leading-normal">
          <span className="font-bold block">App Installed & Active!</span>
          <span>Runs continuously in the background with zero speaker sound!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="text-left">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
            Install Standalone Mobile App ⚔️
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
            Install Flag Wars directly on your Android / iOS phone! It can stream in the background while your screen is off, with zero speakers audio!
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {isInstallable && (
          <button
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install on Android / PC</span>
          </button>
        )}

        {isIOS && (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Install on iOS Safari</span>
          </button>
        )}

        {!isInstallable && !isIOS && (
          <div className="flex-1 flex items-center gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-[10px]">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>To install on Android, tap the three dots in Chrome and click <strong>"Add to Home screen"</strong>.</span>
          </div>
        )}
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Install on iPhone / iPad 🍏</h3>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed text-left">
              1. Tap the <strong className="text-indigo-400">Share</strong> button in the bottom Safari toolbar.<br />
              2. Scroll down and select <strong className="text-indigo-400">Add to Home Screen</strong>.<br />
              3. Launch from your home screen to enjoy zero-audio background streaming!
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2 text-xs font-bold transition-colors cursor-pointer"
            >
              Done, got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
