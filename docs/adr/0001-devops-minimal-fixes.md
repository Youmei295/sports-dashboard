# ADR 0001: DevOps Minimal Fixes and Standardization

**Date:** 2026-06-01

## Context
Before transitioning the repository to a full DevOps and infrastructure focus, several inconsistencies and missing standardizations were identified. These issues included CI/CD pipeline mismatches, missing service health indicators, duplicate backend routes, and ambiguous container network configurations. Addressing these was necessary to ensure predictable container orchestration and stable continuous integration.

## Decision
We implemented a series of high-priority minimal fixes:
1. **Aligned Go Toolchain in CI:** Updated `.github/workflows/ci.yml` from Go 1.22 to 1.26.2 to match the backend's `go.mod`.
2. **Fixed Mock API Router & Added Healthcheck:** Removed a duplicate `basketball_router` import and added a `/health` endpoint to `mock-score-api/app.py`.
3. **Added Backend Healthcheck:** Implemented a `/health` HTTP handler in `streaming-app-backend/main.go`.
4. **Enhanced Docker Compose Orchestration:** 
   - Added Docker healthchecks (`healthcheck`) to the API and backend.
   - Updated `depends_on` to use `condition: service_healthy`.
   - Explicitly separated frontend environment variables by adding `SSR_API_URL=http://streaming-backend:8080`.

## Consequences
- **Positive:** Docker Compose will now reliably wait for services to be fully healthy before starting dependencies. The CI pipeline will match local builds. The stage is set for adding formal Kubernetes probes and advanced GitOps pipelines.
- **Negative:** None. These are universally positive stabilizations.
