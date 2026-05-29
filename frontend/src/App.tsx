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

      <main className="flex-1 p-3 sm:p-5 lg:p-8 z-10 relative">

        {/* ── Responsive Grid ────────────────────────────────────────────
            Mobile  (< sm):  1 column, all widgets stacked
            Tablet  (sm–lg): 2 columns
            Desktop (≥ lg):  12-column — original layout
        ──────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-8">

          {/* ── PulseMonitor: full width on mobile/tablet, 8/12 on desktop ── */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-8 min-h-[260px] sm:min-h-[300px] lg:min-h-[340px]">
            <PulseMonitor events={events} status={status} />
          </div>

          {/* ── Sidebar Widgets: each full on mobile, stacked in col on desktop ── */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-4 flex flex-col gap-4 sm:gap-5 lg:gap-8">
            <ThreatAlert events={events} status={status} />
            <div className="flex-1 min-h-[200px]">
              <AgentRegistry transitions={transitions} isStreaming={isStreaming} />
            </div>
          </div>

          {/* ── Bottom Row ─────────────────────────────────────────────── */}

          {/* Threat Resolution: full on mobile, 1 of 2 cols on tablet, 4/12 on desktop */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-4 min-h-[220px]">
            <ThreatResolutionReport events={events} isStreaming={isStreaming} />
          </div>

          {/* Decision Engine: full on mobile, 1 of 2 cols on tablet, 3/12 on desktop */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-3 min-h-[220px]">
            <DecisionEngine transitions={transitions} events={events} />
          </div>

          {/* Audit Log: full on mobile, spans 2 on tablet, 5/12 on desktop */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-5 min-h-[220px]">
            <AuditLog events={events} />
          </div>

        </div>
      </main>

      {/* Footer Branding Overlay */}
      <div className="relative lg:absolute lg:bottom-4 lg:left-8 pointer-events-none z-20 text-center lg:text-left pb-3 lg:pb-0">
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.4em] font-bold">
          SentryAgent · Autonomous Security Matrix · v4.2.0
        </span>
      </div>
    </div>
  );
}
