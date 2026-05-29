import React from 'react';
import { Shield } from 'lucide-react';

interface HeaderProps {
  onStart: () => void;
  onReset: () => void;
  isStreaming: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onStart, onReset, isStreaming }) => {
  return (
    <header className="glass-header px-8 py-4 flex items-center justify-between z-20">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-400 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-display">SentryAgent</span>
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold -mt-0.5">Autonomous Security Matrix</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Live status pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${isStreaming ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-white/5 border-white/10 text-slate-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,167,0.8)]' : 'bg-slate-600'}`} />
          {isStreaming ? 'Live' : 'Idle'}
        </div>

        {!isStreaming ? (
          <button
            onClick={onStart}
            className="px-5 py-2 bg-indigo-600/80 hover:bg-indigo-500/90 text-white border border-indigo-400/30 rounded-xl text-xs font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
          >
            Start Monitoring
          </button>
        ) : (
          <div className="px-5 py-2 bg-indigo-600/30 text-indigo-300 border border-indigo-400/20 rounded-xl text-xs font-bold tracking-wide cursor-default">
            Monitoring...
          </div>
        )}

        <button
          onClick={onReset}
          className="px-5 py-2 bg-white/5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 rounded-xl text-xs font-bold tracking-wide transition-all"
        >
          Reset
        </button>
      </div>
    </header>
  );
};
