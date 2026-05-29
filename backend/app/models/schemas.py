"""
Pydantic v2 data models — the shared data contract.
Frontend mirrors these in types.ts. Any change here must be synced.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class LogEntry(BaseModel):
    """Raw agent action from the audit log feed."""
    id: str
    timestamp: str
    agent_id: str
    action: str
    resource: str
    assigned_scope: list[str]
    metadata: dict = Field(default_factory=dict)


class Verdict(BaseModel):
    """Agent classification output — used as output_type on agents."""
    status: Literal["Normal", "Malicious"]
    reason: str
    confidence: float = Field(ge=0.0, le=1.0)


class KillEvent(BaseModel):
    """Enforcement record — created when kill_switch tool fires."""
    agent_id: str
    terminated_at: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat() + "Z"
    )
    action_blocked: str
    enforcement: str = "SESSION_REVOKED"


class AgentTransition(BaseModel):
    """Emitted on each handoff — frontend shows live pipeline progress."""
    event_type: str = "agent_transition"
    from_agent: str
    to_agent: str
    log_id: str
    message: str


class StreamEvent(BaseModel):
    """Final SSE payload per log entry."""
    sequence: int
    log_entry: LogEntry
    verdict: Verdict
    kill_event: KillEvent | None = None


class ErrorEvent(BaseModel):
    """Emitted on GPT timeout or API failure."""
    log_id: str
    error_type: str
    message: str
    fallback_verdict: Verdict


class SessionStatus(BaseModel):
    """Response for GET /api/logs/status."""
    state: Literal["idle", "running", "completed"]
    total_entries: int = 0
    events_processed: int = 0
    malicious_count: int = 0
    started_at: str | None = None
