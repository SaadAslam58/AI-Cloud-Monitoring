import React from 'react';
import { ComposedChart, Area, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { StreamEvent, SessionStatus } from '../lib/types';

interface PulseMonitorProps {
  events: StreamEvent[];
  status: SessionStatus | null;
}

// Custom glowing dot for the active end of each line
const GlowDot = ({ cx, cy, color }: { cx?: number; cy?: number; color: string }) => {
  if (cx === undefined || cy === undefined) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={color} opacity={0.9} />
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.2} />
      <circle cx={cx} cy={cy} r={16} fill={color} opacity={0.07} />
    </g>
  );
};

export const PulseMonitor: React.FC<PulseMonitorProps> = ({ events, status }) => {
  const maxPoints = 30;
  // events[0] = newest (prepended in useLogStream). Reverse slice for chronological chart.
  const recentEvents = events.slice(0, maxPoints).reverse();

  // Build dual data series: normalSignal + threatSignal per time slot
  const chartData = Array.from({ length: maxPoints }, (_, i) => {
    const eventIndex = recentEvents.length - maxPoints + i;
    if (eventIndex >= 0) {
      const event = recentEvents[eventIndex];
      const isMalicious = event.verdict.status === 'Malicious';
      return {
        time: i,
        normalSignal: isMalicious
          ? 10 + Math.random() * 5
          : 28 + Math.sin(i * 0.7) * 8 + Math.random() * 6,
        threatSignal: isMalicious
          ? 75 + Math.random() * 22
          : 5 + Math.random() * 2,
      };
    }
    return {
      time: i,
      normalSignal: 28 + Math.sin(i * 0.7) * 8,
      threatSignal: 5 + Math.random() * 2,
    };
  });

  // events[0] is newest
  const latestEvent = events[0];
  const isLatestMalicious = latestEvent?.verdict.status === 'Malicious';

  const activeAgentsCount = new Set(events.map(e => e.log_entry.agent_id)).size;
  const anomalyPercent =
    status && status.events_processed > 0
      ? ((status.malicious_count / status.events_processed) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="glass-card p-4 sm:p-6 lg:p-8 h-full flex flex-col shadow-2xl">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 sm:mb-6 lg:mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
              style={{
                backgroundColor: isLatestMalicious ? '#f87171' : '#2dd4a7',
                boxShadow: isLatestMalicious
                  ? '0 0 12px rgba(248,113,113,0.7)'
                  : '0 0 12px rgba(45,212,167,0.6)',
              }}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              System Pulse Monitor
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {isLatestMalicious ? 'Anomaly Detected' : 'Network Integrity Stable'}
          </h2>
        </div>

        {/* Stats — scrollable row on very small screens */}
        <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-1 sm:pb-0 flex-shrink-0">
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Agents</div>
            <div className="text-xl sm:text-2xl font-bold tracking-tighter text-teal-400">{activeAgentsCount}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Events</div>
            <div className="text-xl sm:text-2xl font-bold tracking-tighter text-white">{status?.events_processed ?? 0}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Threat Rate</div>
            <div
              className="text-xl sm:text-2xl font-bold tracking-tighter"
              style={{ color: parseFloat(anomalyPercent) > 0 ? '#f87171' : '#2dd4a7' }}
            >
              {anomalyPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,167,0.7)]" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Normal Traffic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.7)]" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Threat Signal</span>
        </div>
      </div>

      {/* Dual-line chart */}
      <div className="flex-1 min-h-[160px] sm:min-h-[200px] relative">
        {/* Ambient floor glow */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-teal-500/5 to-transparent pointer-events-none rounded-b-xl" />
        {isLatestMalicious && (
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-red-500/8 to-transparent pointer-events-none rounded-t-xl" />
        )}

        {/* Idle overlay — shown before any events arrive */}
        {events.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent animate-scan-sweep" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">Awaiting Signal</span>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
            <defs>
              {/* Green fill gradient */}
              <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2dd4a7" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#2dd4a7" stopOpacity={0} />
              </linearGradient>
              {/* Red fill gradient */}
              <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#f87171" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
              {/* Glow filter for red line */}
              <filter id="redGlow" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Subtle glow for green line */}
              <filter id="greenGlow" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <YAxis domain={[0, 100]} hide />

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(6,11,24,0.92)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '11px',
                padding: '8px 12px',
              }}
              cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1, strokeDasharray: '4 4' }}
              formatter={(value: number, name: string) => [
                value?.toFixed(1),
                name === 'normalSignal' ? '🟢 Normal' : '🔴 Threat',
              ]}
            />

            {/* Green normal traffic area */}
            <Area
              type="monotone"
              dataKey="normalSignal"
              stroke="#2dd4a7"
              strokeWidth={2}
              fill="url(#normalGrad)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 4, fill: '#2dd4a7', stroke: 'rgba(45,212,167,0.4)', strokeWidth: 6 }}
              animationDuration={300}
              filter="url(#greenGlow)"
              connectNulls
            />

            {/* Red threat signal area — only visible when threat exists */}
            <Area
              type="monotone"
              dataKey="threatSignal"
              stroke="#f87171"
              strokeWidth={2.5}
              fill="url(#threatGrad)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 5, fill: '#f87171', stroke: 'rgba(248,113,113,0.4)', strokeWidth: 8 }}
              animationDuration={200}
              filter="url(#redGlow)"
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
