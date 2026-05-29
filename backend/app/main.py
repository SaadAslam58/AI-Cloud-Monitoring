"""
SentryAgent — FastAPI entry point.
Run with: uv run uvicorn app.main:app --reload
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.logs import router as logs_router

# Load .env before defining the app
load_dotenv()

# Allow the Vercel frontend (or localhost in dev) to reach this backend.
# FRONTEND_URL in .env — for dev use http://localhost:3000
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app = FastAPI(
    title="SentryAgent",
    description="Autonomous multi-agent security monitoring framework",
    version="1.0.0",
)

# Build allowed origins: always include both localhost and 127.0.0.1 variants for dev
_origins = [FRONTEND_URL]
if "localhost" in FRONTEND_URL:
    _origins.append(FRONTEND_URL.replace("localhost", "127.0.0.1"))
elif "127.0.0.1" in FRONTEND_URL:
    _origins.append(FRONTEND_URL.replace("127.0.0.1", "localhost"))

# CORS — restrict to known frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the SSE router
app.include_router(logs_router)


@app.get("/")
async def root():
    return {
        "service": "SentryAgent",
        "status": "operational",
        "endpoints": ["/api/logs/stream", "/api/logs/status"],
    }
