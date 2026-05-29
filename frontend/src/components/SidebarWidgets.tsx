import React from 'react';
import { ShieldAlert, ShieldOff, ShieldCheck, AlertTriangle, Cpu } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { StreamEvent, AgentTransition, SessionStatus } from '../lib/types';

/* ── Severity System ──────────────────────────────────────────── */
type Severity = 'nominal' | 'elevated' | 'high' | 'critical';

function getSeverity(maliciousCount: number, totalEvents: number): Severity {
  if (maliciousCount === 0 || totalEvents === 0) return 'nominal';
  const rate = (maliciousCount / totalEvents) * 100;
  if (rate < 15) return 'elevated';
  if (rate < 40) return 'high';
  return 'critical';
}

const SEVERITY_CONFIG = {
  nominal: {
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-500/15 border-emerald-500/40',
    iconColor: 'text-emerald-400',
    glow: 'bg-emerald-500/8',
    sweep: 'via-emerald-400/40',
    shimmer: 'via-emerald-400/6',
    ring: 'border-emerald-500',
    radar: 'rgba(45,212,167,0.25)',
    label: 'text-emerald-400',
    badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    btn: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    btnText: '● System Nominal',
    statusText: 'No Active Threats',
    subText: 'Scanning Vectors',
    Icon: ShieldCheck,
  },
  elevated: {
    border: 'border-l-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-400/40',
    iconColor: 'text-amber-400',
    glow: 'bg-amber-500/10',
    sweep: 'via-amber-400/40',
    shimmer: 'via-amber-400/6',
    ring: 'border-amber-400',
    radar: 'rgba(251,191,36,0.25)',
    label: 'text-amber-400',
    badge: 'bg-amber-500/10 border-amber-400/30 text-amber-300',
    btn: 'bg-amber-500/10 border-amber-400/30 text-amber-400',
    btnText: '⚠ Threat Activity Detected',
    statusText: 'Elevated Alert',
    subText: 'Anomalies Detected',
    Icon: AlertTriangle,
  },
  high: {
    border: 'border-l-orange-500',
    iconBg: 'bg-orange-500/15 border-orange-500/40',
    iconColor: 'text-orange-400',
    glow: 'bg-orange-500/12',
    sweep: 'via-orange-400/50',
    shimmer: 'via-orange-400/6',
    ring: 'border-orange-500',
    radar: 'rgba(249,115,22,0.30)',
    label: 'text-orange-400',
    badge: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    btn: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    btnText: '🔴 High Threat Volume',
    statusText: 'High Risk State',
    subText: 'Multiple Threats Logged',
    Icon: ShieldOff,
  },
  critical: {
    border: 'border-l-rose-500',
    iconBg: 'bg-rose-500/20 border-rose-500/40',
    iconColor: 'text-rose-400',
    glow: 'bg-rose-500/15',
    sweep: 'via-rose-400/60',
    shimmer: 'via-rose-400/8',
    ring: 'border-rose-500',
    radar: 'rgba(244,63,94,0.35)',
    label: 'text-rose-400',
    badge: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    btn: 'bg-rose-600 border-rose-500/30 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]',
    btnText: '⚡ CRITICAL — Kill Switch Armed',
    statusText: 'CRITICAL INCIDENT',
    subText: 'Immediate Action Required',
    Icon: ShieldOff,
  },
};

/* ── ThreatAlert ──────────────────────────────────────────────── */
export const ThreatAlert: React.FC<{ events: StreamEvent[], status: SessionStatus }> = ({ events, status }) => {
  // events[0] = newest event (prepended in useLogStream)
  const latestEvent = events[0];
  const isKilled = !!latestEvent?.kill_event;

  const severity = getSeverity(status.malicious_count, status.events_processed);
  const cfg = SEVERITY_CONFIG[severity];
  const threatRate = status.events_processed > 0
    ? ((status.malicious_count / status.events_processed) * 100).toFixed(1)
    : '0.0';

  const { Icon } = cfg;

  return (
    <div className={cn('glass-card p-4 sm:p-5 border-l-4 shadow-2xl relative overflow-hidden transition-all duration-700', cfg.border)}>
      {/* Ambient glow */}
      <div className={cn('absolute top-[-30%] right-[-15%] w-[60%] h-[120%] blur-[80px] rounded-full pointer-events-none animate-glow-breathe', cfg.glow)} />
      {/* Scan sweep */}
      <div className={cn('absolute left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent pointer-events-none animate-scan-sweep', cfg.sweep)} />
      {/* Shimmer */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className={cn('absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent to-transparent animate-shimmer skew-x-[-20deg]', cfg.shimmer)} />
      </div>

      <div className="relative z-10">
        {/* Header: radar icon + title */}
        <div className="flex items-center gap-4 mb-4">
          {/* Animated radar ring */}
          <div className="relative flex-shrink-0 w-14 h-14 flex items-center justify-center">
            <div className={cn('absolute inset-0 rounded-full border animate-ring-expand', cfg.ring)} />
            <div className={cn('absolute inset-0 rounded-full border animate-ring-expand-2 opacity-60', cfg.ring)} />
            <div className={cn('absolute inset-0 rounded-full border animate-ring-expand-3 opacity-30', cfg.ring)} />
            <div
              className="absolute inset-0 rounded-full animate-radar-sweep"
              style={{ background: `conic-gradient(from 0deg, transparent 300deg, ${cfg.radar} 360deg)` }}
            />
            <div className={cn('w-10 h-10 rounded-full border flex items-center justify-center z-10', cfg.iconBg)}>
              <Icon className={cn('w-5 h-5', cfg.iconColor)} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn('text-[9px] font-bold uppercase tracking-widest mb-0.5', cfg.label)}>System Status</h3>
            <p className="text-sm font-bold text-white tracking-tight">{cfg.statusText}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <div className={cn('w-1 h-1 rounded-full animate-pulse', cfg.iconColor)} style={{ animationDelay: '0ms' }} />
              <div className={cn('w-1 h-1 rounded-full animate-pulse', cfg.iconColor)} style={{ animationDelay: '200ms' }} />
              <div className={cn('w-1 h-1 rounded-full animate-pulse', cfg.iconColor)} style={{ animationDelay: '400ms' }} />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider ml-1">{cfg.subText}</span>
            </div>
          </div>
        </div>

        {/* Severity stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Events', value: status.events_processed },
            { label: 'Threats', value: status.malicious_count },
            { label: 'Rate', value: `${threatRate}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/4 rounded-xl p-2 border border-white/6 text-center">
              <div className="text-[8px] text-slate-600 uppercase tracking-wider mb-0.5">{label}</div>
              <div className={cn('text-sm font-bold', label === 'Threats' && status.malicious_count > 0 ? cfg.label : label === 'Rate' && parseFloat(threatRate) > 0 ? cfg.label : 'text-white')}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Kill switch indicator */}
        {isKilled && (
          <div className="mb-3 px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-[9px] text-rose-300 font-bold uppercase tracking-widest animate-pulse">
            ⚡ Kill switch deployed — session revoked
          </div>
        )}

        {/* Status button */}
        <div className={cn('w-full py-2.5 border text-[9px] font-bold uppercase tracking-widest rounded-2xl text-center cursor-default transition-all duration-700', cfg.btn)}>
          {cfg.btnText}
        </div>
      </div>
    </div>
  );
};


/* ── AgentItem ────────────────────────────────────────────────── */
interface AgentProps {
  name: string;
  status: 'green' | 'red';
  id: string;
  isStreaming: boolean;
}

const AgentItem: React.FC<AgentProps> = ({ name, status, id, isStreaming }) => {
  const isActive = status === 'red';
  const dotColor = isActive ? '#fb7185' : '#34d399';
  const lineColor = isActive ? '#fb7185' : '#34d399';
  const normalPath = 'M0 10 Q 12 2, 25 10 T 50 10 T 75 10 T 100 10';
  const activePath = 'M0 10 L10 4 L20 16 L30 4 L40 16 L50 10 L60 4 L70 16 L80 4 L90 16 L100 10';

  return (
    <div className={cn(
      'flex items-center justify-between py-2.5 px-2 rounded-xl transition-all',
      isActive ? 'bg-rose-500/8 border border-rose-500/15' : 'hover:bg-white/5'
    )}>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: dotColor,
              boxShadow: `0 0 ${isActive ? '14px' : '8px'} ${dotColor}99`,
              animation: isActive ? 'pulse 0.8s ease-in-out infinite' : 'pulse 2.5s ease-in-out infinite',
            }}
          />
          {isActive && (
            <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: dotColor, opacity: 0.4 }} />
          )}
        </div>
        <span className={cn('text-sm font-semibold tracking-tight transition-colors', isActive ? 'text-white' : 'text-slate-300 hover:text-white')}>
          {name}
        </span>
        {isActive && (
          <span className="text-[8px] font-bold uppercase tracking-widest text-rose-400 bg-rose-400/10 border border-rose-400/20 px-1.5 py-0.5 rounded-md animate-pulse">
            Active
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <svg className="w-16 h-5" viewBox="0 0 100 20">
          <path
            d={isActive ? activePath : normalPath}
            fill="none"
            stroke={lineColor}
            strokeWidth={isActive ? '2.5' : '2'}
            strokeLinecap="round"
            className={isStreaming ? 'animate-wave-draw' : ''}
            style={!isStreaming ? { opacity: 0.3 } : {}}
          />
        </svg>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter w-14 text-right font-mono">
          {id}
        </span>
      </div>
    </div>
  );
};


/* ── AgentRegistry ────────────────────────────────────────────── */
export const AgentRegistry: React.FC<{ transitions: AgentTransition[], isStreaming: boolean }> = ({ transitions, isStreaming }) => {
  const latestTransition = transitions[transitions.length - 1];
  const activeAgent = isStreaming ? (latestTransition ? latestTransition.to_agent : 'Orchestrator') : null;

  return (
    <div className="glass-card p-4 sm:p-6 flex flex-col h-full shadow-2xl relative overflow-hidden">
      {!isStreaming && (
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400/20 to-transparent pointer-events-none animate-scan-sweep" />
      )}

      <div className="flex justify-between items-center mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-slate-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Pipeline</h3>
        </div>
        <span className={cn(
          'text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border',
          isStreaming
            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            : 'text-slate-500 bg-slate-400/8 border-slate-600/30'
        )}>
          {isStreaming ? '⚡ Active' : '◉ Standby'}
        </span>
      </div>

      <div className="space-y-1 flex-1 relative z-10">
        {(['Orchestrator', 'LogicMonitor', 'SanityEnforcer'] as const).map((agent, i) => (
          <AgentItem
            key={agent}
            name={agent}
            status={activeAgent === agent ? 'red' : 'green'}
            id={`AGENT_${i + 1}`}
            isStreaming={isStreaming}
          />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Pipeline Agents</div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-sm font-bold text-white">3 Loaded</div>
        </div>
      </div>
    </div>
  );
};
