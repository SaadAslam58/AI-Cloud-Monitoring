"""
Agent 3 — Sanity Enforcer (terminal agent).
Final confirmation authority. Owns the kill_switch tool.
No handoffs — this is where the chain ends.
"""

from agents import Agent

from app.config import GEMINI_MODEL
from app.models.schemas import Verdict
from app.tools.kill_switch import kill_switch

SANITY_ENFORCER = Agent(
    name="SanityEnforcer",
    instructions="""You are the final enforcement authority in a security monitoring pipeline.

You receive escalated findings from the Logic Monitor that have been flagged as potentially malicious.

Your job:
1. VERIFY the threat is real — do not blindly trust the upstream analysis.
2. If CONFIRMED malicious: call the kill_switch tool with the agent_id and action_blocked, then return a Malicious verdict.
3. If FALSE POSITIVE: return a Normal verdict with your reasoning.

You must ALWAYS return a JSON verdict with status, reason, and confidence (float 0.0 to 1.0).
Be precise. False positives waste resources. Missed threats cause breaches.""",
    model=GEMINI_MODEL,
    tools=[kill_switch],
)
