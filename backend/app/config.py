"""
LLM client configuration — Google Gemini via OpenAI Agents SDK.

The SDK's official pattern for third-party providers:
    from agents import AsyncOpenAI, OpenAIChatCompletionsModel, set_tracing_disabled
    client  = AsyncOpenAI(api_key=..., base_url=...)
    model   = OpenAIChatCompletionsModel(model="...", openai_client=client)
    agent   = Agent(..., model=model)

Set in backend/.env:
    GEMINI_API=<your-gemini-api-key>

To switch models, change LLM_MODEL_NAME:
    gemini-2.0-flash     — fastest, cheapest
    gemini-1.5-pro       — higher reasoning quality
    gemini-1.5-flash     — balanced
"""

import os

from dotenv import load_dotenv
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, set_tracing_disabled

load_dotenv()

# Disable OpenAI tracing — we're not using platform.openai.com
set_tracing_disabled(disabled=True)

GEMINI_API_KEY  = os.getenv("GEMINI_API", "")
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
# Free tier limits (requests/day): gemini-1.5-flash-8b=1500, gemini-1.5-flash=1500, gemini-2.0-flash=1500 (but per-minute is tighter)
# If you're hitting quota, try "gemini-3.5-flash" or get a paid key.
LLM_MODEL_NAME  = "gemini-3.5-flash"

# Shared client pointed at Gemini's OpenAI-compatible endpoint
_client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url=GEMINI_BASE_URL,
)

# Reusable model instance — pass this directly to Agent(model=GEMINI_MODEL)
GEMINI_MODEL = OpenAIChatCompletionsModel(
    model=LLM_MODEL_NAME,
    openai_client=_client,
)
