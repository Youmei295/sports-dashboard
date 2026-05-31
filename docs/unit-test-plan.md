# Unit Testing Implementation Plan

## Service: Frontend (`streaming-app-frontend`)

### Stack Choice
- **Vitest** — unit test runner (Jest-compatible, native TS, fast)
- **@testing-library/react** — component rendering/interaction
- **@testing-library/jest-dom** — DOM matchers (`toBeInTheDocument`, etc.)
- **jsdom** — browser environment for component tests
- Manual `fetch` mocking (no extra dependency needed)

### Setup Steps
1. Install dev dependencies:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
   ```
2. Create `vitest.config.ts` at frontend root:
   - Plugin: `@vitejs/plugin-react`
   - `environment: "jsdom"`
   - `setupFiles: "./src/tests/setup.ts"`
3. Create `src/tests/setup.ts`:
   - Import `@testing-library/jest-dom/vitest`
   - Mock `global.fetch`
   - Mock `console.error` to suppress expected error output
4. Add scripts to `package.json`:
   - `"test": "vitest run"`
   - `"test:watch": "vitest"`
5. Run `npm run test` to verify zero-fail baseline

### Test Cases — `src/app/__tests__/page.test.tsx`

| # | Test Name | What It Verifies |
|---|---|---|
| 1 | **renders loading spinner on mount** | Before fetch resolves, spinner (`animate-spin`) is visible |
| 2 | **renders error UI on fetch failure** | When fetch rejects, error banner with `Connection Error` appears |
| 3 | **renders score data on success** | When fetch resolves, team names and scores render in the DOM |
| 4 | **polls every 3 seconds** | `fetch` is called multiple times (assert at least 2 calls with `advanceTimers`) |
| 5 | **cleans up interval on unmount** | After unmounting, no further `fetch` calls made |
| 6 | **renders raw JSON payload** | The `<pre>` block contains stringified response data |

**Mock Data Shape (used across tests):**
```json
{
  "homeTeam": "Lakers",
  "awayTeam": "Warriors",
  "homeScore": 87,
  "awayScore": 93,
  "status": "In Progress"
}
```

### Refactoring Needed (minor)
- The hardcoded URL `http://localhost:8081/api/score` should be replaced with an env var `NEXT_PUBLIC_API_URL`, defaulting to the existing value. This lets tests inject a different URL if needed.

---

## Service: Backend (`streaming-app-backend`)

### Stack
- Go standard library `testing` + `net/http/httptest` (zero external dependencies)

### Refactoring Needed
Extract the handler logic from `main()` into a standalone function so tests can call it directly without spinning up the full server:

```go
func scoreHandler(mockAPIURL string) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // ... handler body ...
    }
}
```

`main()` then calls `http.HandleFunc("/api/score", scoreHandler(os.Getenv("MOCK_SCORE_API_URL")))`

### Test Cases — `main_test.go`

| # | Test Name | What It Verifies |
|---|---|---|
| 1 | **proxies score from mock API** | Creates `httptest.NewServer` as mock backend, asserts response body is forwarded unchanged |
| 2 | **sets CORS headers** | `Access-Control-Allow-Origin: *` is present on response |
| 3 | **handles OPTIONS preflight** | `OPTIONS /api/score` returns 200 with CORS headers, empty body |
| 4 | **returns 500 on upstream failure** | When mock API is unreachable (bad URL), returns 500 with `Failed to fetch score` |
| 5 | **respects MOCK_SCORE_API_URL env var** | Set env var, verify handler uses the custom URL |
| 6 | **forwards Content-Type from upstream** | If mock returns `application/json`, the proxy preserves it |

### Run
```bash
go test ./... -v
```

---

## Service: Mock API (`mock-score-api`)

### Stack
- `pytest` + `httpx` (async test client for FastAPI)

### Setup
1. Add to `requirements.txt`:
   ```
   pytest
   httpx
   ```
2. Create `test_app.py`

### Test Cases

| # | Test Name | What It Verifies |
|---|---|---|
| 1 | **returns valid JSON structure** | Response contains `homeTeam`, `awayTeam`, `homeScore`, `awayScore`, `status` |
| 2 | **scores within expected range** | `homeScore` and `awayScore` are between 80 and 120 |
| 3 | **status is valid** | `status` is one of `"In Progress"`, `"Final"`, `"Halftime"`, `"Scheduled"` (after improvements) |
| 4 | **scores vary between calls** | Two successive calls return different score values (not cached) |

### Run
```bash
pip install -r requirements.txt && pytest -v
```
