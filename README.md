# 🛡️ SentryAgent — Real-time AI Agent Behavior Monitor

> A Multi-Agent enforcement platform that monitors autonomous AI agents in real-time,
> detects policy violations, and autonomously terminates rogue agents using the OpenAI Agents SDK.

---

## 🧠 System Architecture

```
Log Feed → Orchestrator → Logic Monitor → Sanity Enforcer (kill_switch) → SSE → Frontend Dashboard
```

| Agent | Role | Model |
|---|---|---|
| Orchestrator | Entry point — triages logs, routes for deep analysis | Configurable via `.env` (`gpt-4o` / `gpt-4o-mini` / `gpt-5`) |
| Logic Monitor | Deep behavioral analysis — checks action vs assigned scope | Configurable via `.env` |
| Sanity Enforcer | Final confirmation — owns `kill_switch` tool, prevents false positives | Configurable via `.env` |

### Agent Flow Per Log Entry

**Normal log (short-circuits at Monitor):**
```
📥 Log → 🔵 Orchestrator: "Routing..." → 🟡 Monitor: "Within scope — Normal" → ✅ Done
```

**Malicious log (full chain):**
```
📥 Log → 🔵 Orchestrator: "Routing..." → 🟡 Monitor: "Anomaly detected — escalating..."
     → 🔴 Sanity: "Confirmed — calling kill_switch()" → 💀 Agent Terminated
```

### Communication Protocol

- **Backend → Frontend:** Server-Sent Events (SSE) at `/api/logs/stream`
- **Why SSE?** Unidirectional stream. No WebSocket overhead. Browser-native `EventSource`.
- **Session ownership:** `GET /api/logs/stream` initializes + owns the session lifecycle. No separate start endpoint (prevents race conditions).
- **Three SSE event types on the wire:**
  - `event: agent_transition` — fires **during** the chain (live pipeline on UI)
  - `event: verdict` — fires when chain completes (final result)
  - `event: error` — fires on GPT timeout or API failure

---

## 📁 Project Structure

```
Hackathon-SHU/
├── backend/                            ← You own this
│   ├── .python-version                 ← pins Python version for uv
│   ├── pyproject.toml                  ← uv project config + all dependencies
│   ├── uv.lock                         ← auto-generated lockfile (commit this)
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml              ← Multi-container orchestration
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI app, CORS, lifespan, router mount
│   │   │
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── orchestrator.py         # Agent 1 — triage + route
│   │   │   ├── logic_monitor.py        # Agent 2 — deep analysis
│   │   │   ├── sanity_enforcer.py      # Agent 3 — confirm + kill_switch tool
│   │   │   └── runner.py               # Assembles chain, runs Runner.run()
│   │   │
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   └── kill_switch.py          # @function_tool — enforcement action
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── log_reader.py           # Async generator: yields LogEntry with delay
│   │   │   └── session_manager.py      # Singleton: tracks active stream + history
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py              # Pydantic v2: all shared data models
│   │   │
│   │   └── routers/
│   │       ├── __init__.py
│   │       └── logs.py                 # SSE stream + status + history + reset
│   │
│   └── data/
│       └── audit_logs.json             # Mock agent action feed
│
├── frontend/                           ← Teammate owns this
│   ├── src/
│   │   ├── components/                 # React UI widgets
│   │   │   ├── PulseMonitor.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── BottomWidgets.tsx
│   │   │   └── SidebarWidgets.tsx
│   │   ├── hooks/
│   │   │   └── useLogStream.ts         # SSE custom hook
│   │   ├── lib/
│   │   │   ├── types.ts                # Mirrors backend schemas.py
│   │   │   └── utils.ts
│   │   ├── App.tsx                     # Main application view
│   │   ├── main.tsx                    # Vite React entry point
│   │   └── index.css                   # Tailwind styles
│   ├── vite.config.ts                  # Vite configuration
│   ├── Dockerfile                      # Dev server dockerization
│   └── package.json
│
├── .gitignore
└── README.md
```

> ⚠️ Every directory under `app/` **must** have `__init__.py` or Python cannot resolve imports.

---

## ⚙️ Setup (uv + Python 3.11+)

> ⚠️ With `uv` you **do NOT need to activate the venv manually**.
> `uv add` and `uv run` handle everything automatically.

### Prerequisites

- Python 3.11+
- [uv](https://github.com/astral-sh/uv) package manager
- A valid `OPENAI_API_KEY`
- Docker Desktop (optional — for containerized deployment)

### Install uv (one-time)

```powershell
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Quick Start

```bash
cd backend

# Install all dependencies (uv creates .venv automatically)
uv sync

# Copy env and add your key
copy .env.example .env
# Edit .env → set OPENAI_API_KEY=sk-...

# Run the server
uv run uvicorn app.main:app --reload --port 8000
```

Backend at `http://localhost:8000` · API docs at `http://localhost:8000/docs`

### Adding Dependencies

```bash
uv add <package-name>       # Adds to pyproject.toml + updates uv.lock
uv add <package> --dev      # Dev-only (e.g. pytest)
```

**Never use `pip install` directly** — always go through `uv add`.

---

## ✅ Build Phases & Task Checklist

Work through phases **in order**. Do NOT skip ahead.

---

### 📦 Phase 1 — Project Scaffolding & Configuration
> Goal: Skeleton ready, dependencies installed, secrets configured.

- [ ] Initialize `uv` project in `backend/` with `uv init backend`
- [ ] `uv add fastapi uvicorn openai-agents openai pydantic python-dotenv sse-starlette`
- [ ] Create folders: `app/agents/`, `app/tools/`, `app/services/`, `app/models/`, `app/routers/`
- [ ] Add `__init__.py` to every folder under `app/`
- [ ] Create all empty `.py` files (no logic yet)
- [ ] Create `data/audit_logs.json` with sample entries
- [ ] Create `.env.example` with all env vars
- [ ] Create `.gitignore` (include `.env`, `.venv/`, `__pycache__/`)

---

### 📐 Phase 2 — Data Models & Schemas
> Goal: All Pydantic models defined. Frontend teammate can start building types.ts.

#### `app/models/schemas.py`

- [ ] `LogEntry` — raw agent action from the JSON feed
  ```python
  # Fields: id, timestamp, agent_id, action, resource, assigned_scope, metadata
  ```
- [ ] `Verdict` — agent's classification output
  ```python
  # Fields: status ("Normal" | "Malicious"), reason, confidence (0.0-1.0)
  ```
- [ ] `KillEvent` — enforcement record
  ```python
  # Fields: agent_id, terminated_at, action_blocked, enforcement
  ```
- [ ] `AgentTransition` — emitted on each handoff (for UI agent pipeline)
  ```python
  # Fields: event_type, from_agent, to_agent, log_id, message
  ```
- [ ] `StreamEvent` — final SSE payload
  ```python
  # Fields: sequence, log_entry, verdict, kill_event (nullable)
  ```
- [ ] `SessionStatus` — for GET /api/logs/status
  ```python
  # Fields: state, total_entries, events_processed, malicious_count, started_at
  ```
- [ ] `ErrorEvent` — emitted on GPT timeout / API failure
  ```python
  # Fields: log_id, error_type, message, fallback_verdict
  ```

---

### 🔧 Phase 3 — Kill Switch Tool
> Goal: The enforcement action registered as an Agents SDK `@function_tool`.

#### `app/tools/kill_switch.py`

- [ ] Implement `kill_switch(agent_id, action_blocked)` as `@function_tool`
- [ ] Returns `KillEvent` with `enforcement="SESSION_REVOKED"` and auto-timestamp
- [ ] In production: this would call AWS IAM RevokeToken or K8s pod delete
- [ ] Test standalone: call the function, verify KillEvent JSON output

---

### 🧠 Phase 4 — Agent Definitions
> Goal: All 3 agents defined with instructions, handoffs, and tools wired.

#### `app/agents/sanity_enforcer.py` (Agent 3 — build first, it's a leaf)

- [ ] Define `SANITY_ENFORCER` Agent
- [ ] System prompt: final confirmation authority, must verify before killing
- [ ] Owns `kill_switch` tool — only agent that can call it
- [ ] `output_type=Verdict`
- [ ] No handoffs (terminal agent)

#### `app/agents/logic_monitor.py` (Agent 2)

- [ ] Define `LOGIC_MONITOR` Agent
- [ ] System prompt: deep behavioral analysis, compare action vs `assigned_scope`
- [ ] `handoffs=[SANITY_ENFORCER]` — escalates on confirmed threat
- [ ] `output_type=Verdict`
- [ ] No tools (analyze only — separation of concerns)

#### `app/agents/orchestrator.py` (Agent 1 — entry point)

- [ ] Define `ORCHESTRATOR` Agent
- [ ] System prompt: triage routing, fast-path obvious normals
- [ ] `handoffs=[LOGIC_MONITOR]` — routes for deep analysis
- [ ] `output_type=Verdict`
- [ ] No tools (routing only)

#### `app/agents/runner.py` (Chain assembler)

- [ ] `async def analyze_log(entry: LogEntry) -> tuple[Verdict, KillEvent | None, list[AgentTransition]]`
- [ ] Calls `Runner.run(ORCHESTRATOR, input=entry.model_dump_json())`
- [ ] Wraps in `asyncio.wait_for(timeout=AGENT_TIMEOUT_SECONDS)`
- [ ] On timeout: returns safe fallback `Verdict(status="Normal", reason="Timeout", confidence=0.0)`
- [ ] Collects `AgentTransition` events from handoff chain
- [ ] Extracts `KillEvent` if kill_switch was called

---

### 📡 Phase 5 — Log Reader & Session Manager
> Goal: Async log streaming + singleton session state.

#### `app/services/log_reader.py`

- [ ] `async def stream_logs()` — async generator yielding `LogEntry` objects
- [ ] Reads from `data/audit_logs.json`
- [ ] Configurable delay between entries (`LOG_STREAM_DELAY` from `.env`)
- [ ] Production swap: replace JSON read with `httpx` call to CloudWatch/Azure Monitor

#### `app/services/session_manager.py`

- [ ] Singleton class tracking:
  - [ ] Active stream state (running / idle / completed)
  - [ ] Lock: max 1 concurrent stream (prevents duplicate API calls)
  - [ ] Event history list (for `GET /api/logs/history`)
  - [ ] Malicious counter
  - [ ] `reset()` method for demo replay

---

### 🌐 Phase 6 — API Endpoints (FastAPI Router + SSE)
> Goal: All endpoints functional, SSE stream working end-to-end.

#### `app/routers/logs.py`

- [ ] `GET /api/logs/stream` — SSE endpoint
  - [ ] Acquires session lock (409 if already running)
  - [ ] Iterates `stream_logs()` → calls `analyze_log()` per entry
  - [ ] Emits `event: agent_transition` **live during** each handoff (UI sees pipeline progress)
  - [ ] Emits `event: verdict` when chain completes (final result per log)
  - [ ] Emits `event: error` on timeout/failure (includes fallback verdict)
  - [ ] Includes `id:` field on each SSE event (enables reconnection resume)
- [ ] `GET /api/logs/status` — returns `SessionStatus`
- [ ] `GET /api/logs/history` — returns all `StreamEvent` objects
- [ ] `POST /api/logs/reset` — clears session for demo replay

#### `app/main.py`

- [ ] FastAPI app with CORS (allow `http://localhost:3000`)
- [ ] Mount logs router at `/api/logs`
- [ ] `GET /health` → `{"status": "ok", "model": "<OPENAI_MODEL>"}`
- [ ] Load `.env` via `python-dotenv` on startup

---

### 🐳 Phase 7 — Docker & Deployment
> Goal: One command to run the full stack.

#### `backend/Dockerfile`

- [ ] Python 3.11 slim base
- [ ] Install `uv`, copy `pyproject.toml` + `uv.lock`
- [ ] `uv sync --frozen` (reproducible install)
- [ ] Copy app code
- [ ] `CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`

#### `backend/docker-compose.yml`

- [ ] Backend service (port 8000)
- [ ] Frontend service (port 3000)
- [ ] Env file mount for backend

---

### 🎨 Phase 8 — Polish & Demo Prep
> Goal: Demo runs flawlessly in 90 seconds, judges can replay.

- [ ] Verify full stream: 12+ log entries, 3-4 malicious events
- [ ] Confirm `kill_switch` fires on every malicious log
- [ ] Confirm `POST /api/logs/reset` → replay works cleanly
- [ ] Confirm timeout fallback works (simulate slow GPT response)
- [ ] Confirm concurrent tab protection (second tab gets 409)
- [ ] Test SSE stream directly in browser at `/api/logs/stream`
- [ ] Final `audit_logs.json` tuning for demo narrative

---

## 📊 Data Contract (Shared with Frontend)

> 🔑 Both backend and frontend build against these shapes. Any change must be synced.

### `LogEntry`

```json
{
  "id": "log_007",
  "timestamp": "2026-05-12T10:15:33Z",
  "agent_id": "Maint-Bot-3",
  "action": "Create_Admin_Key",
  "resource": "IAM_Root",
  "assigned_scope": ["Read_Health", "Write_Health"],
  "metadata": { "ip": "10.0.0.42", "session_id": "sess_abc123" }
}
```

### `Verdict`

```json
{
  "status": "Malicious",
  "reason": "Agent Maint-Bot-3 attempted Create_Admin_Key on IAM_Root. Assigned scope is [Read_Health, Write_Health]. This is privilege escalation.",
  "confidence": 0.97
}
```

### `KillEvent` (null if Normal)

```json
{
  "agent_id": "Maint-Bot-3",
  "terminated_at": "2026-05-12T10:15:35Z",
  "action_blocked": "Create_Admin_Key",
  "enforcement": "SESSION_REVOKED"
}
```

### `AgentTransition` (emitted per handoff for UI pipeline)

```json
{
  "event_type": "agent_transition",
  "from_agent": "Orchestrator",
  "to_agent": "LogicMonitor",
  "log_id": "log_007",
  "message": "Suspicious action detected — escalating to deep analysis"
}
```

### `StreamEvent` (final SSE payload per log)

```json
{
  "sequence": 7,
  "log_entry": { "...LogEntry" },
  "verdict": { "...Verdict" },
  "kill_event": { "...KillEvent" } | null
}
```

### `ErrorEvent` (emitted on failure)

```json
{
  "log_id": "log_007",
  "error_type": "TIMEOUT",
  "message": "Agent analysis exceeded 8s timeout",
  "fallback_verdict": { "...Verdict" }
}
```

### SSE Wire Format (3 event types)

```
event: agent_transition
data: {"from_agent": "Orchestrator", "to_agent": "LogicMonitor", ...}

event: agent_transition
data: {"from_agent": "LogicMonitor", "to_agent": "SanityEnforcer", ...}

event: verdict
id: 7
data: {"sequence": 7, "log_entry": {...}, "verdict": {...}, "kill_event": {...}}

event: error
data: {"log_id": "log_008", "error_type": "TIMEOUT", ...}
```

---

## 🌐 API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check → `{"status": "ok", "model": "gpt-4o"}` |
| `GET` | `/api/logs/stream` | **SSE stream** — 3 event types: `agent_transition`, `verdict`, `error` |
| `GET` | `/api/logs/status` | `SessionStatus` with progress (`events_processed / total_entries`) |
| `GET` | `/api/logs/history` | All `StreamEvent` objects from current session |
| `POST` | `/api/logs/reset` | Clear session for demo replay |

---

## 🔧 Environment Variables

### `backend/.env` (copy from `.env.example`)

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o              # gpt-4o-mini | gpt-4o | gpt-5

# Stream
LOG_STREAM_DELAY=1.5              # Seconds between log entries
LOG_FILE_PATH=data/audit_logs.json
AGENT_TIMEOUT_SECONDS=8.0         # Hard timeout per Runner.run()

# App
ENVIRONMENT=development
MAX_CONCURRENT_STREAMS=1
```

---

## 🔑 Key Rules (Never Break These)

1. **OpenAI Agents SDK only** — no raw API calls, always use `Agent` + `Runner.run()`
2. **Kill Switch is a TOOL on the Agent** — our code never decides when to kill, the agent does
3. **Model is always configurable** — via `OPENAI_MODEL` env var, never hardcoded
4. **Only Sanity Enforcer owns the kill tool** — separation of analysis and enforcement
5. **Every agent transition must be logged** — visible on the frontend pipeline
6. **`uv` for all dependency management** — never use `pip install` directly

---

## 🖥️ Frontend Spec (Teammate Reference)

> Backend dev: do NOT touch this directory. Documented here for alignment only.

| Component | Source | Description |
|---|---|---|
| `PulseMonitor` | Recharts `<AreaChart>` | Green curve (Normal) → jagged red spikes (Malicious) |
| `LogConsole` | Scrolling JSON list | Raw entries, color-coded by verdict |
| `ThreatBadge` | Status chip | Shows current stream state |
| `EnforcementModal` | Overlay popup | Fires on KillEvent — shows violation details |
| `useLogStream` | SSE hook | Consumes `/api/logs/stream`, feeds all component state |

### Color Palette

| Token | Hex | Use |
|---|---|---|
| `background` | `#0A0A0F` | Dark base |
| `surface` | `#111118` | Cards |
| `emerald` | `#10B981` | Normal |
| `crimson` | `#EF4444` | Malicious |
| `amber` | `#F59E0B` | Warning |

---

## 🚀 Demo Flow

1. Open `http://localhost:3000`
2. Click **"Start Monitoring"**
3. Logs 1-3: Normal → green pulse, Orchestrator → Monitor pipeline visible
4. Log 4: Malicious → full chain: Orchestrator → Monitor → Sanity → Kill Switch
5. Enforcement Modal fires → "Acknowledge & Continue"
6. Logs 5-8: Mix of normal + 2 more malicious
7. Stream ends → session summary
8. Judge wants replay → **"Reset"** → clean from entry 1

**Demo runtime: ~90 seconds**

---

## 🗺️ Roadmap (Demo → Production)

| Current (Hackathon) | Production Upgrade |
|---|---|
| `audit_logs.json` feed | AWS CloudWatch / Azure Monitor live stream |
| Kill switch simulation | AWS IAM `RevokeToken` / K8s pod deletion |
| Single-file reader | Kafka consumer for high-throughput |
| `gpt-4o` via config | Fine-tuned model on org-specific policy |
| In-memory session | Redis for distributed state |
| Local Docker | AWS ECS / Cloud Run |
| 3 agents | Multi-tier: Triage → Investigator → Enforcer → Auditor |

---

*SentryAgent · SHU Hackathon 2026 · Built in 8 hours*
