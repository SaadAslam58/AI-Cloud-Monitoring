export interface LogEntry {
  id: string;
  timestamp: string;
  agent_id: string;
  action: string;
  resource: string;
  assigned_scope: string[];
  metadata: Record<string, any>;
}

export interface Verdict {
  status: "Normal" | "Malicious";
  reason: string;
  confidence: number;
}

export interface KillEvent {
  agent_id: string;
  terminated_at: string;
  action_blocked: string;
  enforcement: string;
}

export interface AgentTransition {
  event_type: string;
  from_agent: string;
  to_agent: string;
  log_id: string;
  message: string;
}

export interface StreamEvent {
  sequence: number;
  log_entry: LogEntry;
  verdict: Verdict;
  kill_event: KillEvent | null;
}

export interface ErrorEvent {
  log_id: string;
  error_type: string;
  message: string;
  fallback_verdict: Verdict;
}

export interface SessionStatus {
  state: "idle" | "running" | "completed";
  total_entries: number;
  events_processed: number;
  malicious_count: number;
  started_at: string | null;
}
