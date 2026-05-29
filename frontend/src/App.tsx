/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Header } from '@/src/components/Header';
import { PulseMonitor } from '@/src/components/PulseMonitor';
import { ThreatAlert, AgentRegistry } from '@/src/components/SidebarWidgets';
import { ThreatResolutionReport, DecisionEngine, AuditLog } from '@/src/components/BottomWidgets';
import { useLogStream } from '@/src/hooks/useLogStream';

export default function App() {
  const { events, activeTransition, sessionStatus, startStream, resetStream } = useLogStream();
  const isStreaming = sessionStatus.state === "running";
  const transitions = activeTransition ? [activeTransition] : [];
  const status = sessionStatus;
  const resetSession = resetStream;
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-violet-500/30 relative overflow-hidden">
      {/* Ambient glow layers */}
      <div className="absolute top-[-20%] left-[-5%] w-[55%] h-[65%] bg-indigo-600/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[55%] bg-teal-500/8 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-[35%] right-[20%] w-[30%] h-[30%] bg-violet-600/6 blur-[120px] rounded-full pointer-events-none" />
      {/* Subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
      
      <Header onStart={startStream} onReset={resetSession} isStreaming={isStreaming} />
      
      <main className="flex-1 p-8 grid grid-cols-12 grid-rows-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 z-10 relative">
        {/* Top Row */}
        <div className="col-span-8">
          <PulseMonitor events={events} status={status} />
        </div>
        
        <div className="col-span-4 flex flex-col gap-8">
          <ThreatAlert events={events} />
          <div className="flex-1">
            <AgentRegistry transitions={transitions} isStreaming={isStreaming} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="col-span-4">
          <ThreatResolutionReport events={events} isStreaming={isStreaming} />
        </div>
        
        <div className="col-span-3">
          <DecisionEngine transitions={transitions} events={events} />
        </div>
        
        <div className="col-span-5">
          <AuditLog events={events} />
        </div>
      </main>

      {/* Footer Branding Overlay */}
      <div className="absolute bottom-4 left-8 pointer-events-none z-20">
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.5em] font-bold">
          SentryAgent · Autonomous Security Matrix · v4.2.0
        </span>
      </div>
    </div>
  );
}
