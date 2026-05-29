import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Cpu, Terminal, Filter, MoreHorizontal } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { StreamEvent, SessionStatus, AgentTransition } from '../lib/types';
import { useTypewriter } from '../hooks/useTypewriter';

export const ThreatResolutionReport: React.FC<{ events: StreamEvent[], isStreaming: boolean }> = ({ events, isStreaming }) => {
  const latestEvent = events[events.length - 1];
  const isMalicious = latestEvent?.verdict.status === 'Malicious';
  const hasKillEvent = !!latestEvent?.kill_event;
  
  const reasonText = latestEvent?.verdict.reason || (isStreaming ? 'SentryAgent is active. Analyzing live matrix streams...' : 'System in Standby. Awaiting log input.');
  const typedReason = useTypewriter(reasonText, 15);

  return (
    <div className="glass-card p-6 h-full relative overflow-hidden group shadow-2xl flex flex-col min-h-[250px]">
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Threat Resolution Report</h3>
        <span className={cn(
          "px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border",
          isMalicious ? (hasKillEvent ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-rose-500/10 text-rose-300 border-rose-500/20") : "bg-white/10 text-white border-white/10"
        )}>
          {isMalicious ? (hasKillEvent ? "SOLVED & CLOSED" : "THREAT ACTIVE") : "NOMINAL STATE"}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between font-mono text-[10px] space-y-4 relative z-10">
        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex-1 min-h-[100px]">
          <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-2">Analysis Explanation</div>
          <div className="text-slate-200 leading-relaxed text-xs">
            {typedReason}
            <span className="animate-pulse font-bold ml-1 text-indigo-400">|</span>
          </div>
        </div>

        {isMalicious && latestEvent?.kill_event && (
          <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-500/20 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="text-[8px] text-rose-400 font-bold uppercase tracking-wider mb-1">Sanity Enforcer Actions</div>
            <p className="text-white text-xs leading-normal font-sans">
              Deploying <strong className="font-mono text-rose-400">kill_switch</strong> tool. Session for rogue agent <strong className="font-mono text-rose-400">{latestEvent.kill_event.agent_id}</strong> revoked immediately due to <span className="underline decoration-rose-500/50">{latestEvent.kill_event.action_blocked}</span>. System returned to nominal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const DecisionEngine: React.FC<{ transitions: AgentTransition[], events: StreamEvent[] }> = ({ transitions, events }) => {
  const latestTransition = transitions[transitions.length - 1];
  const latestEvent = events[events.length - 1];

  let outputDecision = "AWAITING_INPUT";
  let isMalicious = false;
  let isAnalyzing = false;

  if (latestTransition && (!latestEvent || latestTransition.log_id !== latestEvent.log_entry.id)) {
    // Currently analyzing an event that hasn't finished yet
    outputDecision = "ANALYZING...";
    isAnalyzing = true;
  } else if (latestEvent) {
    if (latestEvent.verdict.status === "Malicious") {
       outputDecision = "KILL_SWITCH_ARMED";
       isMalicious = true;
    } else {
       outputDecision = "ALLOW_TRAFFIC";
    }
  }

  return (
    <div className="glass-card p-6 h-full flex flex-col items-center shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none rounded-3xl" />
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 self-start mb-6">AI Decision Engine</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4 relative z-10 w-full">
        <div className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest group hover:bg-white/10 transition-all cursor-default text-center px-2">
          {latestTransition ? latestTransition.from_agent : "INPUT_VECTOR"}
        </div>
        <div className="w-0.5 h-6 bg-gradient-to-b from-white/10 to-indigo-500/30" />
        <div className="w-full h-14 border border-indigo-500/30 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-[10px] font-bold text-indigo-300 uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.1)] group hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all cursor-default text-center px-2">
          {latestTransition ? latestTransition.to_agent : "POLICY_ANALYSIS"}
        </div>
        <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500/30 to-emerald-500/30" />
        
        <div className={cn(
          "w-full py-4 border-2 rounded-2xl text-center transition-all cursor-default",
          isMalicious ? "border-rose-400/40 bg-rose-400/10 shadow-[0_0_30px_rgba(251,113,133,0.15)] group hover:bg-rose-400/20" :
          isAnalyzing ? "border-indigo-400/40 bg-indigo-400/10 shadow-[0_0_30px_rgba(99,102,241,0.15)] group hover:bg-indigo-400/20" :
          "border-emerald-400/40 bg-emerald-400/10 shadow-[0_0_30px_rgba(52,211,153,0.15)] group hover:bg-emerald-400/20"
        )}>
           <div className={cn(
             "text-[8px] font-bold uppercase tracking-widest mb-1",
             isMalicious ? "text-rose-400/60" : isAnalyzing ? "text-indigo-400/60" : "text-emerald-400/60"
           )}>Decision_Output</div>
           <div className={cn(
             "text-base font-display font-bold tracking-tight",
             isMalicious ? "text-rose-400" : isAnalyzing ? "text-indigo-400" : "text-emerald-400"
           )}>{outputDecision}</div>
        </div>
      </div>

      <div className="mt-6 w-full flex justify-between items-center text-slate-500">
        <span className="text-[9px] font-bold uppercase tracking-wider">Engine: Sentry-v4</span>
        <MoreHorizontal className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
      </div>
    </div>
  );
};


interface AuditLogProps {
  events: StreamEvent[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ events }) => {

  return (
    <div className="glass-card p-6 h-full flex flex-col shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-slate-500" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Audit Log</h3>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500/40" />
          <div className="w-2 h-2 rounded-full bg-amber-500/40" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-3 mb-6 scrollbar-thin px-1">
        <AnimatePresence mode="popLayout">
          {events.map((event) => {
            const isMalicious = event.verdict.status === 'Malicious';
            const isNormal = event.verdict.status === 'Normal';
            const logId = event.log_entry.id;
            const timestamp = event.log_entry.timestamp.split('T')[1]?.substring(0, 8) || event.log_entry.timestamp;
            const message = `${event.log_entry.action}: ${event.log_entry.resource}`;

            return (
            <motion.div 
              key={logId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 group"
            >
              <span className={cn(
                "whitespace-nowrap font-bold",
                isMalicious ? "text-rose-400" : "text-emerald-400"
              )}>{timestamp}</span>
              <span className="flex-1">
                {isMalicious ? (
                  <span className="text-white group-hover:text-rose-100 transition-colors">
                    <span className="text-rose-400 font-bold mr-2 uppercase tracking-tight">{event.log_entry.agent_id}</span>
                    <span className="bg-rose-500/10 px-1.5 py-0.5 rounded-lg border border-rose-500/10">{message}</span>
                  </span>
                ) : (
                  <span className="text-slate-300 group-hover:text-white transition-colors">
                    <span className={cn(
                      "font-bold mr-2 uppercase tracking-tight",
                      "text-emerald-400"
                    )}>{event.log_entry.agent_id}</span>
                    <span className="opacity-70">{message}</span>
                  </span>
                )}
              </span>
            </motion.div>
          )})}
        </AnimatePresence>
      </div>

      <div className="relative">
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Filter matrix logs..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-10 py-3 text-[10px] font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
        />
      </div>
    </div>
  );
};
