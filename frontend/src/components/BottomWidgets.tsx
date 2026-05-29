import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Filter, MoreHorizontal, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { StreamEvent, SessionStatus, AgentTransition } from '../lib/types';
import { useTypewriter } from '../hooks/useTypewriter';

/* ── ThreatResolutionReport ───────────────────────────────────── */
export const ThreatResolutionReport: React.FC<{ events: StreamEvent[], isStreaming: boolean }> = ({ events, isStreaming }) => {
  // events[0] = newest (prepended in useLogStream)
  const latestEvent = events[0];
  const isMalicious = latestEvent?.verdict.status === 'Malicious';
  const hasKillEvent = !!latestEvent?.kill_event;

  const reasonText = latestEvent?.verdict.reason || (isStreaming ? 'SentryAgent is active. Analyzing live matrix streams...' : 'System in Standby. Awaiting log input.');
  const typedReason = useTypewriter(reasonText, 15);

  return (
    <div className="glass-card p-4 sm:p-6 h-full relative overflow-hidden group shadow-2xl flex flex-col min-h-[220px]">
      {/* Ambient glow */}
      <div className={cn(
        'absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none transition-colors duration-700',
        isMalicious ? 'bg-rose-500/10' : 'bg-indigo-500/8'
      )} />

      {/* Scan sweep bar */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent pointer-events-none animate-scan-sweep" />

      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Threat Resolution Report</h3>
        <span className={cn(
          'px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border',
          isMalicious
            ? (hasKillEvent ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border-rose-500/20')
            : 'bg-white/8 text-slate-400 border-white/10'
        )}>
          {isMalicious ? (hasKillEvent ? '✓ SOLVED' : '⚠ ACTIVE') : '◉ NOMINAL'}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between font-mono text-[10px] space-y-3 relative z-10">
        <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex-1 min-h-[80px]">
          <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <div className={cn('w-1 h-1 rounded-full', isStreaming ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600')} />
            Analysis Explanation
          </div>
          <div className="text-slate-200 leading-relaxed text-xs">
            {typedReason}
            <span className="animate-blink font-bold ml-0.5 text-indigo-400">|</span>
          </div>
        </div>

        {isMalicious && latestEvent?.kill_event && (
          <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-500/20 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="text-[8px] text-rose-400 font-bold uppercase tracking-wider mb-1">⚡ Sanity Enforcer Actions</div>
            <p className="text-white text-xs leading-normal font-sans">
              Deploying <strong className="font-mono text-rose-400">kill_switch</strong> tool. Session for{' '}
              <strong className="font-mono text-rose-400">{latestEvent.kill_event.agent_id}</strong> revoked due to{' '}
              <span className="underline decoration-rose-500/50">{latestEvent.kill_event.action_blocked}</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


/* ── DecisionEngine ───────────────────────────────────────────── */
export const DecisionEngine: React.FC<{ transitions: AgentTransition[], events: StreamEvent[] }> = ({ transitions, events }) => {
  // events[0] = newest (prepended in useLogStream)
  const latestTransition = transitions[transitions.length - 1];
  const latestEvent = events[0];

  let outputDecision = 'AWAITING_INPUT';
  let isMalicious = false;
  let isAnalyzing = false;

  if (latestTransition && (!latestEvent || latestTransition.log_id !== latestEvent.log_entry.id)) {
    outputDecision = 'ANALYZING...';
    isAnalyzing = true;
  } else if (latestEvent) {
    if (latestEvent.verdict.status === 'Malicious') {
      outputDecision = 'KILL_SWITCH_ARMED';
      isMalicious = true;
    } else {
      outputDecision = 'ALLOW_TRAFFIC';
    }
  }

  const accentColor = isMalicious ? '#fb7185' : isAnalyzing ? '#818cf8' : '#34d399';
  const accentRgba = isMalicious ? 'rgba(251,113,133,0.15)' : isAnalyzing ? 'rgba(129,140,248,0.15)' : 'rgba(52,211,153,0.15)';

  return (
    <div className="glass-card p-4 sm:p-6 h-full flex flex-col items-center shadow-2xl relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/4 to-transparent pointer-events-none rounded-3xl" />

      {/* Scan line */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/25 to-transparent pointer-events-none animate-scan-sweep" />

      <div className="flex items-center justify-between w-full mb-5 relative z-10">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Decision Engine</h3>
        <div className="flex items-center gap-1.5">
          <Zap className={cn('w-3 h-3', isAnalyzing ? 'text-indigo-400 animate-pulse' : isMalicious ? 'text-rose-400' : 'text-slate-600')} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-0 w-full relative z-10">
        {/* Input node */}
        <div className="w-full h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white/8 transition-all cursor-default text-center px-2 relative overflow-hidden">
          {/* Shimmer on this node */}
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/4 to-transparent animate-shimmer skew-x-[-20deg]" />
          </div>
          <span className="relative z-10">{latestTransition ? latestTransition.from_agent : 'INPUT_VECTOR'}</span>
        </div>

        {/* Connector with flowing dot */}
        <div className="relative w-0.5 h-7 bg-gradient-to-b from-white/10 to-indigo-500/30 mx-auto">
          <div
            className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full animate-dot-flow"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
          />
        </div>

        {/* Processing node */}
        <div className="w-full h-12 border border-indigo-500/30 bg-indigo-500/8 rounded-xl flex items-center justify-center text-[10px] font-bold text-indigo-300 uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all cursor-default text-center px-2 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-indigo-400/6 to-transparent animate-shimmer skew-x-[-20deg]" style={{ animationDelay: '1.2s' }} />
          </div>
          <span className="relative z-10">{latestTransition ? latestTransition.to_agent : 'POLICY_ANALYSIS'}</span>
        </div>

        {/* Connector with flowing dot */}
        <div className="relative w-0.5 h-7 bg-gradient-to-b from-indigo-500/30 to-emerald-500/30 mx-auto">
          <div
            className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full animate-dot-flow-2"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
          />
        </div>

        {/* Output node */}
        <div className={cn(
          'w-full py-4 border-2 rounded-xl text-center transition-all duration-500 cursor-default relative overflow-hidden',
          isMalicious
            ? 'border-rose-400/40 bg-rose-400/10 shadow-[0_0_30px_rgba(251,113,133,0.15)]'
            : isAnalyzing
            ? 'border-indigo-400/40 bg-indigo-400/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
            : 'border-emerald-400/40 bg-emerald-400/10 shadow-[0_0_30px_rgba(52,211,153,0.10)]'
        )}>
          {/* Breathing glow overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-xl animate-glow-breathe"
            style={{ background: accentRgba }}
          />
          <div className={cn('text-[8px] font-bold uppercase tracking-widest mb-1 relative z-10',
            isMalicious ? 'text-rose-400/60' : isAnalyzing ? 'text-indigo-400/60' : 'text-emerald-400/60'
          )}>Decision_Output</div>
          <div className={cn('text-sm font-display font-bold tracking-tight relative z-10',
            isMalicious ? 'text-rose-400' : isAnalyzing ? 'text-indigo-400' : 'text-emerald-400'
          )}>{outputDecision}</div>
        </div>
      </div>

      <div className="mt-4 w-full flex justify-between items-center text-slate-600 relative z-10">
        <span className="text-[9px] font-bold uppercase tracking-wider">Engine: Sentry-v4</span>
        <MoreHorizontal className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
      </div>
    </div>
  );
};


/* ── AuditLog ─────────────────────────────────────────────────── */
interface AuditLogProps {
  events: StreamEvent[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ events }) => {
  return (
    <div className="glass-card p-4 sm:p-6 h-full flex flex-col shadow-2xl relative overflow-hidden">
      {/* Scan sweep */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400/15 to-transparent pointer-events-none animate-scan-sweep" style={{ animationDelay: '1s' }} />

      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Audit Log</h3>
          {events.length > 0 && (
            <span className="text-[8px] font-bold text-slate-600 bg-white/5 border border-white/8 rounded-md px-1.5 py-0.5">
              {events.length} entries
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500/50" />
          <div className="w-2 h-2 rounded-full bg-amber-500/50" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2.5 mb-4 scrollbar-thin px-1 min-h-[80px]">
        {events.length === 0 ? (
          /* Empty state — animated terminal prompt */
          <div className="flex flex-col items-start justify-start h-full pt-1 space-y-2">
            <div className="text-slate-600 text-[10px]">
              <span className="text-emerald-600 font-bold">sentry@matrix</span>
              <span className="text-slate-700">:</span>
              <span className="text-indigo-600">~</span>
              <span className="text-slate-700">$ </span>
              <span className="text-slate-500">awaiting event stream</span>
              <span className="animate-blink text-indigo-400 font-bold">▌</span>
            </div>
            <div className="text-slate-700 text-[9px] italic">No events yet. Start monitoring to see live logs.</div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {events.map((event) => {
              const isMalicious = event.verdict.status === 'Malicious';
              const logId = event.log_entry.id;
              const timestamp = event.log_entry.timestamp.split('T')[1]?.substring(0, 8) || event.log_entry.timestamp;
              const message = `${event.log_entry.action}: ${event.log_entry.resource}`;

              return (
                <motion.div
                  key={logId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 group"
                >
                  <span className={cn('whitespace-nowrap font-bold flex-shrink-0', isMalicious ? 'text-rose-400' : 'text-emerald-400')}>
                    {timestamp}
                  </span>
                  <span className="flex-1 min-w-0 truncate">
                    {isMalicious ? (
                      <span className="text-white group-hover:text-rose-100 transition-colors">
                        <span className="text-rose-400 font-bold mr-1.5 uppercase tracking-tight">{event.log_entry.agent_id}</span>
                        <span className="bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/10">{message}</span>
                      </span>
                    ) : (
                      <span className="text-slate-300 group-hover:text-white transition-colors">
                        <span className="text-emerald-400 font-bold mr-1.5 uppercase tracking-tight">{event.log_entry.agent_id}</span>
                        <span className="opacity-70">{message}</span>
                      </span>
                    )}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="relative">
        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
        <input
          type="text"
          placeholder="Filter matrix logs..."
          className="w-full bg-white/4 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-bold text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
        />
      </div>
    </div>
  );
};
