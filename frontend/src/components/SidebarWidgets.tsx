import React from 'react';
import { AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '@/src/lib/utils';

import { StreamEvent, AgentTransition } from '../lib/types';

export const ThreatAlert: React.FC<{ events: StreamEvent[] }> = ({ events }) => {
  const latestEvent = events[events.length - 1];
  const isMalicious = latestEvent?.verdict.status === 'Malicious';
  const isKilled = !!latestEvent?.kill_event;
  
  if (!isMalicious) {
    return (
      <div className="glass-card p-6 border-l-4 border-l-emerald-500 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[100%] bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none transition-colors" />
        <div className="flex gap-5 items-start mb-4 relative z-10">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">System Status</h3>
            <p className="text-lg font-bold text-white tracking-tight truncate">No Active Threats</p>
          </div>
        </div>
        <button className="w-full py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-none relative z-10 cursor-default">
          Monitoring Active
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border-l-4 border-l-rose-500 shadow-2xl relative overflow-hidden group animate-in slide-in-from-right duration-500">
      <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[100%] bg-rose-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-rose-500/15 transition-colors" />
      <div className="flex gap-5 items-start mb-4 relative z-10">
        <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/20">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1 truncate" title={latestEvent.log_entry.action}>Threat: {latestEvent.log_entry.action}</h3>
          <p className="text-lg font-bold text-white tracking-tight truncate" title={latestEvent.log_entry.resource}>Target: {latestEvent.log_entry.resource}</p>
        </div>
      </div>
      <button className={`w-full py-3 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all relative z-10 ${isKilled ? 'bg-rose-600 shadow-[0_8px_20px_rgba(244,63,94,0.3)]' : 'bg-orange-500 shadow-[0_8px_20px_rgba(249,115,22,0.3)]'}`}>
        {isKilled ? "Kill Switch Deployed" : "Threat Detected"}
      </button>
    </div>
  );
};

interface AgentProps {
  name: string;
  status: 'green' | 'red';
  id: string;
}

const AgentItem: React.FC<AgentProps> = ({ name, status, id }) => (
  <div className="flex items-center justify-between group py-3 px-1 transition-all rounded-2xl hover:bg-white/5">
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-2.5 h-2.5 rounded-full",
        status === 'green' ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" : "bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.6)]"
      )} />
      <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors tracking-tight">{name}</span>
    </div>
    
    <div className="flex items-center gap-6">
      <svg className="w-20 h-6 opacity-40 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 20">
        <path 
          d={status === 'green' ? "M0 10 Q 25 2, 50 10 T 100 10" : "M0 10 L 10 5 L 20 15 L 30 5 L 40 15 L 50 10 L 60 15 L 70 5 L 80 15 L 90 5 L 100 10"} 
          fill="none" 
          stroke={status === 'green' ? "#34d399" : "#fb7185"} 
          strokeWidth="2"
        />
      </svg>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter w-16 text-right">ID: {id}</span>
    </div>
  </div>
);

export const AgentRegistry: React.FC<{ transitions: AgentTransition[], isStreaming: boolean }> = ({ transitions, isStreaming }) => {
  const latestTransition = transitions[transitions.length - 1];
  const activeAgent = isStreaming ? (latestTransition ? latestTransition.to_agent : 'Orchestrator') : null;

  return (
    <div className="glass-card p-6 flex flex-col h-full shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Pipeline Agents</h3>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${isStreaming ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-slate-400/10'}`}>
          {isStreaming ? 'Pipeline Active' : 'Standby'}
        </span>
      </div>
      
      <div className="space-y-4 flex-1">
        <AgentItem 
          name="Orchestrator" 
          status={activeAgent === 'Orchestrator' ? 'red' : 'green'} 
          id="AGENT_1" 
        />
        <AgentItem 
          name="LogicMonitor" 
          status={activeAgent === 'LogicMonitor' ? 'red' : 'green'} 
          id="AGENT_2" 
        />
        <AgentItem 
          name="SanityEnforcer" 
          status={activeAgent === 'SanityEnforcer' ? 'red' : 'green'} 
          id="AGENT_3" 
        />
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Pipeline Agents</div>
        <div className="text-sm font-bold text-white">3 Loaded</div>
      </div>
    </div>
  );
};
