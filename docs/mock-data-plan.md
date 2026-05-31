# Mock Data Generator Improvement Plan

## Current State
`mock-score-api/app.py` is a 14-line FastAPI app that returns random scores (80–120) for Lakers vs Warriors with `status: "In Progress"`. Every request is stateless — scores can bounce wildly (e.g., 120→81).

## Goals
1. **Stateful game simulation** — scores progress realistically over time
2. **Configurable via environment variables** — teams, sport, score range
3. **Game lifecycle** — full game states (Scheduled → In Progress → Halftime → Final)
4. **More realistic basketball scoring** — increment by 1–3 points per request
5. **Test coverage** — pytest suite for the improved API

---

## Implementation Plan

### 1. Add Game State (in-memory, per-game)

Introduce a `GameState` dataclass tracked in memory:

```python
@dataclass
class GameState:
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    status: str          # "Scheduled" | "In Progress" | "Halftime" | "Final"
    quarter: int         # 1–4
    clock: str           # "12:00" → "0:00"
    last_update: float   # timestamp
```

On app startup, initialize based on env vars. On each `/score` request, advance the simulation:

- **If Scheduled:** transition to In Progress (Q1, 12:00) after first request
- **If In Progress:** increment scores by realistic amounts, decrement clock
  - Basketball scoring: +1 (free throw), +2 (field goal), +3 (three-pointer)
  - Occasionally: no score (missed shot, turnover)
- **If clock hits 0:00:** advance quarter (or move to Halftime after Q2, or Final after Q4)
- **If Halftime:** after ~3 requests, advance to Q3
- **If Final:** scores freeze, return 200 with `"status": "Final"`

### 2. Configuration via Environment Variables

| Env Var | Default | Description |
|---|---|---|
| `TEAM_HOME` | `Lakers` | Home team name |
| `TEAM_AWAY` | `Warriors` | Away team name |
| `SPORT` | `basketball` | Sport type (affects scoring logic) |
| `SCORE_INIT_HOME` | `0` | Starting score for home team |
| `SCORE_INIT_AWAY` | `0` | Starting score for away team |
| `QUARTER_LENGTH` | `120` | Game ticks per quarter (simulated) |

### 3. New/Modified Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/score` | Returns current game state (existing, now stateful) |
| `POST` | `/reset` | Resets game to initial state (new) |
| `GET` | `/config` | Returns current game configuration (new) |

`/score` now returns:
```json
{
  "homeTeam": "Lakers",
  "awayTeam": "Warriors",
  "homeScore": 87,
  "awayScore": 93,
  "status": "In Progress",
  "quarter": 3,
  "clock": "5:32",
  "possession": "Lakers"
}
```

### 4. Realism Enhancements (basketball mode)

- **Possession alternation** — track which team has the ball
- **Scoring runs** — small probability of consecutive scores by same team
- **Fouls** — occasional "free throws" (1 point) instead of field goals
- **Shot clock** — reset on each scoring event
- **Game pace variation** — randomize time between events (fast break vs. half court)

### 5. Implementation Order (within the file)

1. Refactor into class-based structure (from flat function)
2. Add in-memory state with `GameState` dataclass
3. Implement simulation tick logic
4. Add env var configuration
5. Add `/reset` and `/config` endpoints
6. Add logging for debugging
7. Add pytest tests

### 6. Tests (`test_app.py`)

| # | Test Name | What It Verifies |
|---|---|---|
| 1 | `test_score_structure` | Returns all expected fields |
| 2 | `test_score_realistic_increments` | Two successive calls: scores increase (or stay same), never decrease |
| 3 | `test_status_transitions` | Over many calls, status eventually reaches "Final" |
| 4 | `test_reset` | POST `/reset` brings game back to initial state |
| 5 | `test_env_var_teams` | Setting `TEAM_HOME`/`TEAM_AWAY` changes team names in response |
| 6 | `test_config_endpoint` | `GET /config` returns current configuration |

### 7. Out of Scope (for now)
- WebSocket push (server-sent events)
- Persistent storage (DB/file)
- Multiple simultaneous games
- Non-basketball sports (football, soccer, etc.)

---

## Migration Path

Current clients (frontend + Go backend) only consume `homeTeam`, `awayTeam`, `homeScore`, `awayScore`, `status` — all of which remain in the response. The new fields (`quarter`, `clock`, `possession`) are additive and non-breaking. The existing `docker-compose.yml` needs no changes.
