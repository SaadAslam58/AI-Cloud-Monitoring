"""
Session Manager — tracks the state of the current stream session.
Used by the status endpoint and the SSE stream to stay in sync.
"""

from typing import List
from app.models.schemas import SessionStatus, StreamEvent


class SessionManager:
    """In-memory singleton tracking the active stream session."""

    def __init__(self) -> None:
        self._status = SessionStatus(state="idle")
        self._history: List[StreamEvent] = []

    def start(self, total: int) -> bool:
        """
        Attempt to start a session. Returns True if successful,
        False if a session is already running (concurrency lock).
        """
        if self._status.state == "running":
            return False
            
        from datetime import datetime
        self._status = SessionStatus(
            state="running",
            total_entries=total,
            events_processed=0,
            malicious_count=0,
            started_at=datetime.utcnow().isoformat() + "Z",
        )
        self._history = []
        return True

    def record_event(self, event: StreamEvent) -> None:
        """Update counters and history after processing one log entry."""
        self._history.append(event)
        self._status.events_processed += 1
        if event.verdict.status == "Malicious":
            self._status.malicious_count += 1

    def complete(self) -> None:
        """Mark session as completed."""
        self._status.state = "completed"

    def reset(self) -> None:
        """Reset to idle for a new stream."""
        self._status = SessionStatus(state="idle")
        self._history = []

    @property
    def status(self) -> SessionStatus:
        return self._status

    @property
    def history(self) -> List[StreamEvent]:
        return self._history


# Singleton instance — imported by router and stream
session = SessionManager()
