"""
Kill Switch — the enforcement tool.
Only the Sanity Enforcer agent owns this tool.
The AGENT decides when to call it, not our code.

In production: this would call AWS IAM RevokeToken or K8s pod delete.
"""

from agents import function_tool

from app.models.schemas import KillEvent


@function_tool
def kill_switch(agent_id: str, action_blocked: str) -> str:
    """
    Terminate a rogue agent's session immediately.
    Call this ONLY after confirming the action is malicious.

    Args:
        agent_id: The ID of the agent to terminate.
        action_blocked: The specific action that triggered enforcement.

    Returns:
        JSON string of the KillEvent record.
    """
    event = KillEvent(agent_id=agent_id, action_blocked=action_blocked)
    return event.model_dump_json()
