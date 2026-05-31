# Testing Guide

## Overview

The monorepo uses three different test frameworks — one per service language. This guide explains how to write, run, and debug tests for each service.

---

## Quick Reference

| Service | Framework | Location | Run command |
|---|---|---|---|
| Mock API (Python) | `pytest` + FastAPI `TestClient` | `mock-score-api/test_app.py` | `cd mock-score-api && python3 -m pytest -v` |
| Backend (Go) | `testing` + `net/http/httptest` | collocated `*_test.go` files | `cd streaming-app-backend && go test -v ./...` |
| Frontend (Next.js) | Vitest + Testing Library + jsdom | `__tests__/` dirs next to source | `cd streaming-app-frontend && npm test` |

---

## Adding Tests

### Mock API (Python) — `test_app.py`

All tests live in a single file `mock-score-api/test_app.py`.

**Pattern:**

```python
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_something():
    resp = client.get("/endpoint")
    assert resp.status_code == 200
    body = resp.json()
    assert "expectedField" in body
```

**Key points:**
- Use `TestClient(app)` — no need to run the server.
- The `@pytest.fixture(autouse=True)` in `test_app.py` resets basketball state before each test.
- Use `monkeypatch` to override config values for time-sensitive tests.
- Test routes at both root (`/score`) and prefixed (`/basketball/score`, `/soccer/score`).

**What to test:**
- Response structure (expected fields present)
- State transitions (game progresses through Scheduled → In Progress → Final)
- Idempotency (scores never decrease, reset restores initial state)
- Error cases (invalid sport IDs, missing parameters)
- Config endpoint returns correct values

### Go Backend — collocated `_test.go` files

Tests live next to the source file they cover, in the same package.

**Pattern:**

```go
package handlers

import (
    "encoding/json"
    "net/http/httptest"
    "testing"
)

func TestHandlerName(t *testing.T) {
    req := httptest.NewRequest("GET", "/api/path", nil)
    rec := httptest.NewRecorder()

    MyHandler(rec, req)

    if rec.Code != 200 {
        t.Fatalf("expected 200, got %d", rec.Code)
    }

    var body map[string]any
    json.Unmarshal(rec.Body.Bytes(), &body)
    if body["key"] != "expected" {
        t.Errorf("expected key=expected, got %v", body["key"])
    }
}
```

**Key points:**
- Use `httptest.NewRequest` + `httptest.NewRecorder` — no server needed.
- Directly call handler functions (no router required for unit tests).
- Use `t.Fatalf` for fatal errors, `t.Errorf` for non-fatal assertions.
- For proxy tests, use `httptest.NewServer` to simulate the upstream mock API.
- Table-driven tests are idiomatic Go — use them for multiple cases.

**What to test:**
- Happy path (valid responses, correct JSON structure)
- Content-Type headers
- Error handling (404 for unknown sports, 400 for missing params)
- Proxy URL construction logic
- CORS headers
- Registry contains expected sports with correct stats

### Frontend (Next.js) — `__tests__/` directories

Tests live in a `__tests__/` directory next to the component or module.

**Pattern (component):**

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import MyComponent from "../MyComponent"

describe("MyComponent", () => {
    it("renders expected content", () => {
        render(<MyComponent prop1="value" />)
        expect(screen.getByText("value")).toBeInTheDocument()
    })

    it("handles empty props", () => {
        render(<MyComponent prop1="" />)
        expect(screen.queryByText("value")).not.toBeInTheDocument()
    })
})
```

**Pattern (API/utility):**

```typescript
import { describe, it, expect, vi } from "vitest"

describe("myFunction", () => {
    it("returns data on success", async () => {
        const mockData = { key: "value" }
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        } as Response)

        const result = await myFunction()
        expect(result).toEqual(mockData)
    })

    it("throws on error", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
        } as Response)

        await expect(myFunction()).rejects.toThrow("HTTP 500")
    })
})
```

**Key points:**
- Mock `global.fetch` directly — no mocking library needed.
- Use `@testing-library/react` queries: `getByText`, `getByRole`, `findByText`, `queryByText`.
- Test rendering states: loading, success, error, empty.
- Test user interactions with `fireEvent` or `userEvent`.

**What to test:**
- Component renders with various props (string, number, array, object, null/undefined)
- Error states (API failure → error UI rendered)
- Loading states (spinner/skeleton shown while data loads)
- Edge cases (empty arrays, missing optional props)
- User interactions (clicking sport selector triggers fetch, checkboxes toggle)

---

## Installing Dependencies

Before running tests, ensure dependencies are installed for the service you're testing.

```bash
# Python mock API
cd mock-score-api && pip install -r requirements.txt

# Go backend — automatic via go.mod
cd streaming-app-backend && go mod download   # optional, 'go test' fetches on its own

# TypeScript frontend
cd streaming-app-frontend && npm ci           # clean install from lockfile
```

> `npm ci` is preferred over `npm install` because it installs exact versions from `package-lock.json`, matching what CI runs.

---

## Running Tests

### Single service

```bash
cd mock-score-api && python3 -m pytest -v          # Python
cd streaming-app-backend && go test -v ./...        # Go
cd streaming-app-frontend && npm test               # TypeScript
```

### All services

```bash
cd mock-score-api && python3 -m pytest -v && \
cd ../streaming-app-backend && go test -v ./... && \
cd ../streaming-app-frontend && npm test
```

---

## Debugging Failing Tests

### Python

```bash
# Run with full traceback
cd mock-score-api && python3 -m pytest -v --tb=long

# Run a single test
cd mock-score-api && python3 -m pytest -v -k test_score_returns_valid_structure

# Print stdout during test (no capture)
cd mock-score-api && python3 -m pytest -v -s
```

### Go

```bash
# Run with verbose output
cd streaming-app-backend && go test -v ./...

# Run a single test function
cd streaming-app-backend && go test -v -run TestSportsList ./...

# Run tests in a single package
cd streaming-app-backend && go test -v ./internal/handlers/
```

### TypeScript

```bash
# Run with UI (opens interactive browser interface)
cd streaming-app-frontend && npx vitest --ui

# Watch mode (re-run on file changes)
cd streaming-app-frontend && npx vitest

# Run a single test file
cd streaming-app-frontend && npx vitest run src/app/components/__tests__/Scoreboard.test.tsx
```

---

## CI Integration

See `.github/workflows/ci.yml`. Tests run conditionally based on which files changed:

| Changed path | CI job | Command |
|---|---|---|
| `mock-score-api/**` | `test-mock-api` | `pytest test_app.py` |
| `streaming-app-backend/**` | `test-backend` | `go test -v ./...` |
| `streaming-app-frontend/**` | `test-frontend` | `npx vitest run` |

Jobs run in parallel. If any triggered job fails, the PR cannot be merged.

---

## Common Gotchas

- **Python:** Always run from `mock-score-api/` directory so imports resolve correctly.
- **Go:** Cached results from `go test` may show `(cached)` — use `go clean -testcache` to force a fresh run.
- **TypeScript:** `npm test` requires `node_modules` installed (`npm ci`). The `.next/` directory is build output, not needed for tests.
- **All services:** Ensure no stale server processes are running on the same ports before testing.
