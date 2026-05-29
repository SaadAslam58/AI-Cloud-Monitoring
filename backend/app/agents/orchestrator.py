"""
Agent 1 — Orchestrator (entry point).
Triage routing — receives raw log entries, routes to Logic Monitor.
No tools — routing only.
"""

from agents import Agent

from app.config import GEMINI_MODEL
from app.models.schemas import Verdict
from app.agents.logic_monitor import LOGIC_MONITOR

ORCHESTRATOR = Agent(
    name="Orchestrator",
    instructions="""You are the entry-point triage agent in a security monitoring pipeline.

You receive raw agent audit log entries in JSON format.

Your job:
1. Parse the log entry and understand what action was performed.
2. Hand off EVERY log entry to the LogicMonitor for deep analysis.
   The LogicMonitor will determine if the action is within the agent's assigned scope.

Do NOT attempt to analyze threats yourself — your role is routing only.
Always hand off to LogicMonitor with the full log context.
If you must return a verdict, ensure confidence is a float between 0.0 and 1.0.""",
    model=GEMINI_MODEL,
    handoffs=[LOGIC_MONITOR],
)
