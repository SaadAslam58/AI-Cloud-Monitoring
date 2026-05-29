"""
SSE Router — the live stream endpoint.
GET /api/logs/stream  → Server-Sent Events (agent_transition, verdict, error)
GET /api/logs/status  → Current session state JSON
GET /api/logs/history → Returns all StreamEvent objects
POST /api/logs/reset  → Clears session for demo replay
"""

import asyncio

from fastapi import APIRouter, HTTPException, status
from sse_starlette.sse import EventSourceResponse

from app.agents.runner import analyze_log
from app.models.schemas import ErrorEvent, StreamEvent
from app.services.log_reader import load_logs
from app.services.session_manager import session

router = APIRouter(prefix="/api/logs", tags=["logs"])

# Delay between log entries — slowed down to 6.0s to respect Gemini API 15 RPM free tier limits
# (Each log takes 2-3 agent API calls, so 6s = ~25 API calls/min, avoiding 429 quotas)
STREAM_DELAY = 6.0


async def _event_generator():
    """
    Async generator that drives the SSE stream.
    Processes each log entry through the 3-agent chain and yields events.
    Session is always cleaned up on exit (disconnect, error, or normal completion).
    """
    logs = load_logs()

    try:
        for seq, entry in enumerate(logs, start=1):
            # Run the agent chain
            verdict, kill_event, transitions = await analyze_log(entry)

            # Emit live agent transitions (frontend animates the pipeline)
            for t in transitions:
                if t.to_agent == "Error" or t.to_agent == "Timeout":
                    error_event = ErrorEvent(
                        log_id=entry.id,
                        error_type="TIMEOUT" if t.to_agent == "Timeout" else "API_ERROR",
                        message=t.message,
                        fallback_verdict=verdict,
                    )
                    yield {
                        "event": "error",
                        "id": str(seq),
                        "data": error_event.model_dump_json(),
                    }
                else:
                    yield {
                        "event": "agent_transition",
                        "id": str(seq),
                        "data": t.model_dump_json(),
                    }

            # Build and emit the final verdict event
            stream_event = StreamEvent(
                sequence=seq,
                log_entry=entry,
                verdict=verdict,
                kill_event=kill_event,
            )
            yield {
                "event": "verdict",
                "id": str(seq),
                "data": stream_event.model_dump_json(),
            }

            # Update session counters and history
            session.record_event(stream_event)

            # Pace the stream for the demo
            await asyncio.sleep(STREAM_DELAY)

        session.complete()

        # Signal stream end
        yield {
            "event": "complete",
            "data": session.status.model_dump_json(),
        }

    except Exception:
        # Client disconnected or an unhandled error — unlock the session
        session.reset()
        raise


@router.get("/stream")
async def stream_logs():
    """SSE endpoint — streams agent analysis in real-time."""
    logs = load_logs()
    # Acquire lock for the session
    if not session.start(total=len(logs)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A log analysis stream is already running.",
        )
        
    return EventSourceResponse(_event_generator())


@router.get("/status")
async def get_status():
    """Returns the current session state."""
    return session.status


@router.get("/history")
async def get_history():
    """Returns all recorded StreamEvent objects from the current session."""
    return session.history


@router.post("/reset")
async def reset_session():
    """Clears the session state for a demo replay."""
    session.reset()
    return {"status": "reset_successful"}
