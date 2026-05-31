# Startup Guide

## Architecture Overview

```
mock-score-api (FastAPI, :8000) ──► streaming-backend (Go, :8081) ──► streaming-frontend (Next.js, :3000)
```

The frontend polls the Go backend every 3s, which proxies through to the mock API.

---

## Option 1: Docker Compose (all services)

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8081/api/score |
| Mock API | http://localhost:8000/score |

---

## Option 2: Run individually (for development)

### 2a. Mock Score API

```bash
cd mock-score-api
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Test it:
```bash
curl http://localhost:8000/score
```

Run tests:
```bash
pytest -v
```

**Configuration** (set as environment variables):

| Variable | Default | Description |
|---|---|---|
| `TEAM_HOME` | `Lakers` | Home team name |
| `TEAM_AWAY` | `Warriors` | Away team name |
| `SCORE_INIT_HOME` | `0` | Starting score for home team |
| `SCORE_INIT_AWAY` | `0` | Starting score for away team |
| `QUARTER_SECONDS` | `720` | Game-seconds per quarter |
| `TICK_SECONDS_MIN` | `10` | Minimum game-seconds per tick |
| `TICK_SECONDS_MAX` | `60` | Maximum game-seconds per tick |
| `HALFTIME_TICKS` | `3` | Number of requests spent at halftime |

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/score` | Advance simulation and return current game state |
| `POST` | `/reset` | Reset game to initial state |
| `GET` | `/config` | Return current configuration |

### 2b. Go Backend

```bash
cd streaming-app-backend
export MOCK_SCORE_API_URL=http://localhost:8000/score
go run main.go
```

The server starts on port `8080`. The frontend expects it on port `8081` — either change the env or run with:

```bash
# In docker-compose the port mapping is 8081:8080
# For local dev, run the frontend with a different API URL
```

Test the proxy:
```bash
curl http://localhost:8080/api/score
```

### 2c. Frontend

```bash
cd streaming-app-frontend
npm install
npm run dev
```

The dev server starts on http://localhost:3000. It hardcodes `http://localhost:8081/api/score` as the fetch target, so make sure the Go backend is running on that port.

---

## Quick sanity check

```bash
# 1. Start mock API
cd mock-score-api && uvicorn app:app --host 0.0.0.0 --port 8000 &

# 2. Start Go backend
cd streaming-app-backend && MOCK_SCORE_API_URL=http://localhost:8000/score go run main.go &

# 3. Start frontend
cd streaming-app-frontend && npm run dev

# 4. Open http://localhost:3000
```
