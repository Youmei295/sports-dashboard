# Unit Testing Status

## Service: Frontend (`streaming-app-frontend`)

### Stack
- **Vitest** — unit test runner
- **@testing-library/react** — component rendering/interaction
- **@testing-library/jest-dom** — DOM matchers
- **jsdom** — browser environment
- Manual `fetch` mocking (no extra dependency)

### Test Files & Coverage — 9 files, 46 tests

**`src/app/lib/__tests__/api.test.ts`** (API client tests):
- `fetchSports` — successful fetch, error handling
- `fetchSportStats` — successful fetch, error handling
- `fetchScore` — successful fetch, error handling
- `resetGame` — successful fetch, error handling

**`src/app/__tests__/page.test.tsx`** (6 tests):
- renders loading spinner on mount
- renders error UI on fetch failure
- renders score data on success
- renders status badge
- renders match events
- renders raw JSON payload

**`src/app/components/__tests__/`** (7 component test files):
- `EventTimeline.test.tsx` — renders events, minutes, header, empty/undefined handling
- `MetricSelector.test.tsx` — button rendering, dropdown, checkboxes, onChange, scoreboard field exclusion, count
- `Scoreboard.test.tsx` — renders teams, scores, VS, dash for missing
- `SportSelector.test.tsx` — renders buttons, onChange, highlight, fallback, loading skeleton
- `StatCard.test.tsx` — string/number/object/array rendering, null/undefined/empty
- `StatGrid.test.tsx` — renders non-scoreboard fields, excludes scoreboard fields, empty state
- `StatusBadge.test.tsx` — renders status text, detail label/value, various statuses

### Run
```bash
cd streaming-app-frontend && npm test
```

---

## Service: Backend (`streaming-app-backend`)

### Stack
- Go standard library `testing` + `net/http/httptest`

### Test Files & Coverage — 5 files, 38 tests

| File | Description | Test Count |
|---|---|---|
| `main_test.go` | Router integration tests with mock HTTP server | 8 |
| `internal/handlers/score_test.go` | ScoreProxy, ResetProxy, ConfigProxy with CORS | 7 |
| `internal/handlers/sports_test.go` | SportsList, SportStats (basketball, soccer, unknown, missing ID) | 7 |
| `internal/proxy/proxy_test.go` | URL construction, GET/POST for default/basketball/soccer, env var defaults | 11 |
| `internal/sports/registry_test.go` | Registry contents, FindByID, stat field completeness | 5 |

### Run
```bash
cd streaming-app-backend && go test ./... -v
```

---

## Service: Mock API (`mock-score-api`)

### Stack
- `pytest` + `httpx` (FastAPI TestClient)

### Test File — `test_app.py`, 12 tests

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

### Run
```bash
cd mock-score-api && python3 -m pytest -v
```

---

## Running All Tests

A unified test runner is provided at the repository root:

```bash
# see .github/workflows/ci.yml for test commands
```

This reads `.testrunner.yml` and executes each service's test suite sequentially with a 120-second timeout per suite.

The CI pipeline (`.github/workflows/ci.yml`) runs each service's tests conditionally based on which files changed in the push/PR.
