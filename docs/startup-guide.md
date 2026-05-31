# Startup Guide

## Architecture Overview

```
mock-score-api (FastAPI, :8000) ──► streaming-backend (Go, :8080 → :8081 via docker-compose) ──► streaming-frontend (Next.js, :3000)
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

**Basketball configuration** (set as environment variables):

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

**Soccer configuration** (set as environment variables):

| Variable | Default | Description |
|---|---|---|
| `SOCCER_TEAM_HOME` | `Barcelona` | Home team name |
| `SOCCER_TEAM_AWAY` | `Real Madrid` | Away team name |
| `SOCCER_HALF_MINUTES` | `45` | Simulated minutes per half |
| `SOCCER_HALFTIME_TICKS` | `3` | Number of requests spent at halftime |
| `SOCCER_HOME_ATTACK` | `80` | Home team attack rating |
| `SOCCER_HOME_DEFENSE` | `75` | Home team defense rating |
| `SOCCER_AWAY_ATTACK` | `72` | Away team attack rating |
| `SOCCER_AWAY_DEFENSE` | `70` | Away team defense rating |
| `SOCCER_HOME_ADVANTAGE` | `1.12` | Home advantage multiplier |

**Basketball endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/score` | Advance simulation and return current game state |
| `POST` | `/reset` | Reset game to initial state |
| `GET` | `/config` | Return current configuration |

**Soccer endpoints** (prefix with `/soccer`):

| Method | Path | Description |
|---|---|---|
| `GET` | `/soccer/score` | Advance simulation and return current game state |
| `POST` | `/soccer/reset` | Reset game to initial state |
| `GET` | `/soccer/config` | Return current configuration |

Run tests:
```bash
pytest -v
```

### 2b. Go Backend

```bash
cd streaming-app-backend
export MOCK_SCORE_API_URL=http://localhost:8000/score
go run main.go
```

The server starts on port `8080` internally. In docker-compose this is mapped to port `8081`.

Test the proxy:
```bash
curl http://localhost:8080/api/score
curl http://localhost:8080/api/sports
```

Run tests:
```bash
go test ./... -v
```

### 2c. Frontend

```bash
cd streaming-app-frontend
npm install
npm run dev
```

The dev server starts on http://localhost:3000. It fetches from the API URL configured via `NEXT_PUBLIC_API_URL` env var (defaults to `http://localhost:8080`). In docker-compose this is set to `http://localhost:8081` to match the backend port mapping.

Run tests:
```bash
npm test
```

---

## Quick sanity check

```bash
# 1. Start mock API
cd mock-score-api && uvicorn app:app --host 0.0.0.0 --port 8000 &

# 2. Start Go backend
cd streaming-app-backend && MOCK_SCORE_API_URL=http://localhost:8000/score go run main.go &

# 3. Start frontend (uses NEXT_PUBLIC_API_URL, defaults to http://localhost:8080)
cd streaming-app-frontend && npm run dev

# 4. Alternatively, run the frontend with explicit API URL:
#    NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev

# 5. Open http://localhost:3000
```
