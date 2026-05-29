import { useState, useEffect, useCallback, useRef } from "react";
import { StreamEvent, AgentTransition, SessionStatus, KillEvent } from "../lib/types";

// Base URL is injected at build time via the VITE_BACKEND_URL env variable.
// - Local dev:  .env              → http://127.0.0.1:8000
// - Production: .env.production   → https://<your-hf-space>.hf.space
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";

export function useLogStream() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [activeTransition, setActiveTransition] = useState<AgentTransition | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    state: "idle",
    total_entries: 0,
    events_processed: 0,
    malicious_count: 0,
    started_at: null,
  });
  const [activeKillEvent, setActiveKillEvent] = useState<KillEvent | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback(async () => {
    // Prevent starting if already running
    if (sessionStatus.state === "running") return;

    // Optional: fetch history here if needed, but since we are starting fresh, we'll let SSE populate
    setEvents([]);
    setActiveTransition(null);
    setActiveKillEvent(null);
    setSessionStatus((prev) => ({ ...prev, state: "running" }));

    const es = new EventSource(`${BACKEND_URL}/api/logs/stream`);
    eventSourceRef.current = es;

    es.addEventListener("agent_transition", (e) => {
      const data = JSON.parse(e.data) as AgentTransition;
      setActiveTransition(data);
    });

    es.addEventListener("verdict", (e) => {
      const data = JSON.parse(e.data) as StreamEvent;
      setEvents((prev) => [data, ...prev]);
      setActiveTransition(null); // Clear transition when verdict arrives

      if (data.kill_event) {
        setActiveKillEvent(data.kill_event);
      }
      
      setSessionStatus((prev) => ({
        ...prev,
        events_processed: prev.events_processed + 1,
        malicious_count: prev.malicious_count + (data.verdict.status === "Malicious" ? 1 : 0),
      }));
    });

    es.addEventListener("error", (e) => {
      // In the SSE protocol, generic unhandled errors are also 'error' events, but we structured ours as custom data events.
      try {
        const data = JSON.parse((e as MessageEvent).data); // This is our ErrorEvent
        console.error("Stream error event:", data);
        setActiveTransition(null);
      } catch {
        // Native SSE connection error
        console.error("SSE connection error");
        es.close();
        setSessionStatus((prev) => ({ ...prev, state: "idle" }));
      }
    });

    es.addEventListener("complete", (e) => {
      const data = JSON.parse(e.data) as SessionStatus;
      setSessionStatus(data);
      es.close();
    });

    return () => {
      es.close();
    };
  }, [sessionStatus.state]);

  const resetStream = useCallback(async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    await fetch(`${BACKEND_URL}/api/logs/reset`, { method: "POST" });
    setEvents([]);
    setActiveTransition(null);
    setActiveKillEvent(null);
    setSessionStatus({
      state: "idle",
      total_entries: 0,
      events_processed: 0,
      malicious_count: 0,
      started_at: null,
    });
  }, []);

  const acknowledgeKillEvent = useCallback(() => {
    setActiveKillEvent(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    events,
    activeTransition,
    sessionStatus,
    activeKillEvent,
    startStream,
    resetStream,
    acknowledgeKillEvent,
  };
}
