# Mock Data API — Implementation Status

## Architecture

The mock API lives in `mock-score-api/` and provides stateful game simulations for two sports. It uses a modular package layout with per-sport engines, models, routes, and config.

```
mock-score-api/
├── app.py                         # FastAPI app entry point
├── test_app.py                    # Integration tests (13 tests)
├── sports/
│   ├── basketball/                # Basketball simulation
│   │   ├── config.py              # Env var configuration
│   │   ├── engine.py              # Simulation engine (tick logic)
│   │   ├── models.py              # GameState dataclass
│   │   └── routes.py              # FastAPI router
│   └── soccer/                    # Soccer simulation
│       ├── config.py
│       ├── engine.py
│       ├── models.py
│       └── routes.py
```

---

## Sport Simulations

### Basketball
- **Teams**: Lakers vs Warriors (configurable via env vars)
- **Game structure**: 4 quarters, each 720 game-seconds
- **Clock**: Decrements by a random tick (10–60 game-seconds per request)
- **Scoring**: Random increments of +1 (free throw), +2 (field goal), or +3 (three-pointer); occasional no-score (miss)
- **Possession**: Alternates between teams on each scoring event; consecutive scoring runs have a small probability
- **Halftime**: Occurs between Q2 and Q3, lasts 3 requests
- **Status lifecycle**: Scheduled → In Progress (Q1–Q4) → Halftime → In Progress (Q3–Q4) → Final

### Soccer
- **Teams**: Barcelona vs Real Madrid (configurable via env vars)
- **Game structure**: 2 halves, each 45 simulated minutes (1 request = 1 minute)
- **Scoring**: Goal probability based on attack/defense ratings with home advantage multiplier; last 15 minutes have 1.5x intensity boost
- **Match events**: Goals, yellow cards, red cards, halftime, fulltime — all tracked with timestamps
- **Statistics**: Shots, shots on target, corners, fouls, yellow/red cards, possession percentage
- **Half time**: Lasts 3 requests
- **Status lifecycle**: Scheduled → In Progress (half 1) → Halftime → In Progress (half 2) → Final

---

## Endpoints

All registered on the FastAPI app:

| Method | Path | Description |
|---|---|---|
| `GET` | `/score` | Advance basketball simulation, return state |
| `POST` | `/reset` | Reset basketball game |
| `GET` | `/config` | Return basketball config |
| `GET` | `/basketball/score` | Same as `/score` (explicit prefix) |
| `POST` | `/basketball/reset` | Same as `/reset` |
| `GET` | `/basketball/config` | Same as `/config` |
| `GET` | `/soccer/score` | Advance soccer simulation, return state |
| `POST` | `/soccer/reset` | Reset soccer game |
| `GET` | `/soccer/config` | Return soccer config |

---

## Environment Variables

### Basketball

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

### Soccer

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

---

## Test Coverage (13 tests)

| # | Test Name | What It Verifies |
|---|---|---|
| 1 | `test_score_returns_valid_structure` | All expected response fields present |
| 2 | `test_scores_increase_over_time` | Scores never decrease across 20 sequential calls |
| 3 | `test_status_eventually_reaches_final` | After enough calls, game reaches "Final" |
| 4 | `test_reset_restores_initial_state` | POST `/reset` returns Scheduled, 0-0 |
| 5 | `test_reset_allows_game_to_restart` | Game progresses normally after reset |
| 6 | `test_config_endpoint` | `/config` returns proper values |
| 7 | `test_score_range_is_reasonable` | Scores stay within 0–200 |
| 8 | `test_halftime_duration` | Halftime lasts exactly the configured ticks |
| 9 | `test_basketball_prefixed_routes` | `/basketball/score` works |
| 10 | `test_basketball_prefixed_reset` | `/basketball/reset` works |
| 11 | `test_basketball_prefixed_config` | `/basketball/config` works |
| 12 | `test_soccer_endpoints` | Soccer score/config/reset all work |
| 13 | (additional soccer structure test) | Soccer response contains expected fields |

---

## Running

```bash
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
pytest -v
```
