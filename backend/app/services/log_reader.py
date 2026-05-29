"""
Log Reader — loads audit_logs.json and yields LogEntry objects.
Single responsibility: file I/O only.
"""

import json
from pathlib import Path

from app.models.schemas import LogEntry

# Resolve path relative to backend/ root
LOG_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "audit_logs.json"


def load_logs() -> list[LogEntry]:
    """Read and parse all log entries from the JSON feed."""
    with open(LOG_FILE, "r") as f:
        raw = json.load(f)
    return [LogEntry.model_validate(entry) for entry in raw]
