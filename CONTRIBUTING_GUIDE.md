# Contributing Guide & New Feature Playbook

This document defines the **mandatory 5-phase lifecycle** every contributor must follow when designing, implementing, and shipping a new feature in the sports-dashboard monorepo.

> [!IMPORTANT]
> Skipping or short-circuiting any phase is a **blocking violation**. Pull requests that skip steps will be rejected at the CI gate and by human reviewers.

---

## Phase 1: Isolation (Git Branching)

Direct commits to `main` are **prohibited**. The `main` branch is a protected deployment target — every commit on `main` must already be reviewed, tested, and green in CI.

> [!NOTE]
> Branch protection rules are enforced server-side. The **Merge** button is disabled unless all status checks pass.

### Procedure

```bash
# 1. Fetch the latest upstream state and sync your local main
git checkout main
git pull origin main

# 2. Create a clean feature branch
git checkout -b feature/your-feature-name
```

> [!IMPORTANT]
> Branch names **must** use the `feature/` prefix. Examples:
>
> - `feature/basketball-simulation`
> - `feature/soccer-event-timeline`
> - `feature/stat-card-refactor`

Work exclusively on this branch. Commit early, commit often — but keep commits atomic and semantically scoped.

---

## Phase 2: Local Architectural Setup (The DevOps Contract)

Before writing a single line of feature code, verify that the existing microservices network is healthy on your local machine.

> [!IMPORTANT]
> Do **not** assume the services are running. Always validate the local topology first.

### Spin up the full stack

```bash
docker compose up --build
```

This builds and starts three containers:

| Service | Container Name | Internal Port | Host Port |
|---|---|---|---|
| Mock API (FastAPI) | `mock-score-api` | `8000` | `8000` |
| Backend (Go) | `streaming-backend` | `8080` | `8081` |
| Frontend (Next.js) | `streaming-frontend` | `3000` | `3000` |

### Verify service discovery

```bash
# Mock API directly
curl -s http://localhost:8000/score | head -c 200

# Go proxy (via Docker DNS)
curl -s http://localhost:8081/api/score | head -c 200

# Sports registry endpoint
curl -s http://localhost:8081/api/sports

# Frontend is serving
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

All three commands should return **200** and valid JSON. If any service is unreachable, diagnose the logs:

```bash
docker compose logs mock-score-api
docker compose logs streaming-backend
docker compose logs streaming-frontend
```

> [!IMPORTANT]
> The frontend's `NEXT_PUBLIC_API_URL` is set to `http://localhost:8081` (the host-mapped port of the Go backend) because browser-side `fetch()` calls cannot resolve Docker's internal DNS.

Once the network is green, you are clear to write code.

---

## Phase 3: Code and Test Co-evolution (TDD / Unit Testing)

A feature is **not complete** without a corresponding set of unit tests. The monorepo spans three languages and three test frameworks — each with a strict file-convention contract.

> [!NOTE]
> The `.github/workflows/ci.yml` workflow **must not** be modified for standard feature work. It uses path-filter auto-discovery to detect which services changed and runs their respective test suites automatically. There is nothing to configure.

### 3a. Go Backend (`streaming-app-backend`)

- **Framework:** Go standard library `testing` + `net/http/httptest`
- **Test location:** Collocated with the source file, same package, same directory
- **Naming convention:** `*_test.go`
- **Run command:** `go test -v ./...`

| Source | Test File |
|---|---|
| `internal/handlers/score.go` | `internal/handlers/score_test.go` |
| `internal/proxy/proxy.go` | `internal/proxy/proxy_test.go` |
| `internal/sports/registry.go` | `internal/sports/registry_test.go` |

**Pattern:** Every new handler, proxy function, or data model **must** have a corresponding `_test.go` file. Use `httptest.NewServer` to simulate upstream dependencies — no external mocking libraries.

### 3b. TypeScript Frontend (`streaming-app-frontend`)

- **Framework:** Vitest + `@testing-library/react` + `jsdom`
- **Test location:** Collocated next to the component or module, inside `__tests__/` directories
- **Naming convention:** `*.test.tsx` or `*.test.ts`
- **Run command:** `npm test` (which invokes `vitest run`)

| Source | Test File |
|---|---|
| `src/app/page.tsx` | `src/app/__tests__/page.test.tsx` |
| `src/app/lib/api.ts` | `src/app/lib/__tests__/api.test.ts` |
| `src/app/components/StatCard.tsx` | `src/app/components/__tests__/StatCard.test.tsx` |

**Pattern:** Every new component, hook, or utility module **must** have a collocated test file. Mock `global.fetch` directly — no dependency injection framework needed.

### 3c. Python Mock API (`mock-score-api`)

- **Framework:** `pytest` + FastAPI `TestClient` + `httpx`
- **Test location:** `mock-score-api/test_app.py` (single integration test file)
- **Run command:** `python3 -m pytest -v`

**Pattern:** Add new test functions to `test_app.py` using the `TestClient` from FastAPI. Each sport simulation engine should have tests covering state transitions, score monotonicity, reset behavior, and config correctness.

> [!CAUTION]
> If your feature touches **exactly one** service (e.g., only the Go backend), you only need to write tests for that service. If your feature spans multiple services (e.g., adding a new sport), you **must** write tests at every tier that changed.

---

## Phase 4: Pre-flight Verification (Local Sanity Check)

Before pushing to remote, run the **full test suite** that corresponds to your changes on your local machine. This saves CI minutes and prevents broken commits from entering the shared repository.

### Unified runner (one command)

```bash
python3 scripts/run-tests.py
```

This reads `.testrunner.yml` and executes each suite with a 120-second timeout.

### Per-service runners (targeted)

```bash
# Mock API
cd mock-score-api && python3 -m pytest -v

# Go backend
cd streaming-app-backend && go test -v ./...

# Frontend
cd streaming-app-frontend && npm test
```

> [!IMPORTANT]
> All tests **must** pass with exit code 0 before proceeding. A failing test is a hard stop — investigate and fix before pushing.

### Quick smoke test (optional but recommended)

```bash
# Build and verify the Docker network still works with your changes
docker compose up --build -d
curl -s http://localhost:8081/api/sports
docker compose down
```

---

## Phase 5: The Remote Gatekeeper (Pull Requests & CI)

### Push your branch

```bash
git push origin feature/your-feature-name
```

### Open a Pull Request

1. Navigate to the repository on GitHub.
2. Open a PR from `feature/your-feature-name` → `main`.
3. Fill in the PR description with:
   - What the feature does
   - Which services were changed
   - How to verify locally
4. Request review from at least one maintainer.

### What happens next (CI pipeline)

The `.github/workflows/ci.yml` workflow activates on `push` and `pull_request` against `main`. It runs three **parallel, conditional** jobs:

```
                    ┌─────────────────┐
                    │  changes (path  │
                    │   filter)       │
                    └────┬────┬───────┘
                         │    │
              ┌──────────┤    ├──────────┐
              ▼               ▼          ▼
       ┌──────────┐   ┌──────────┐  ┌──────────┐
       │  test-   │   │  test-   │  │  test-   │
       │ mock-api │   │ backend  │  │ frontend │
       │ (pytest) │   │(go test) │  │(vitest)  │
       └──────────┘   └──────────┘  └──────────┘
```

- **Path filter (`dorny/paths-filter`):** Only the services whose files changed are tested — untouched services are skipped instantly. This keeps CI fast.
- **Parallel execution:** All triggered test jobs run simultaneously.
- **Failure = block:** If any triggered job fails, the **Branch Protection Rule** prevents the PR from being merged. The **Merge** button is greyed out with a status-check failure indicator.

### Merge outcome

Once all status checks pass **and** a maintainer approves the review:

1. The PR is merged into `main` (prefer **Squash merge** to keep history clean).
2. Both the **feature code** and its accompanying **unit tests** land together — this is the regression shield.
3. The CI will re-run on `main` as a final validation.

> [!NOTE]
> Because tests are merged with the code they validate, future refactors that break the feature will be caught immediately by `go test ./...`, `npm test`, or `pytest` — not by a production incident.

---

## Summary: The Contract at a Glance

| Phase | Action | Gate |
|---|---|---|
| 1 — Isolation | Branch from `main` with `feature/` prefix | No direct pushes to `main` |
| 2 — Setup | `docker compose up --build`, verify all ports 200 | Healthy local topology |
| 3 — TDD | Write collocated unit tests in the right framework | Tests accompany every change |
| 4 — Pre-flight | `python3 scripts/run-tests.py` — all green | Exit code 0 before push |
| 5 — PR & CI | Push → PR → parallel CI → merge | Branch protection + reviewer approval |

Follow this playbook on every feature, no exceptions. It keeps the monorepo healthy, the pipeline fast, and production stable.
