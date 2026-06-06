from dotenv import load_dotenv
load_dotenv()  # Take environment variables from .env if it exists

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Counter, Gauge

from sports.basketball.routes import router as basketball_router
from sports.soccer.routes import router as soccer_router
from sports.basketball import engine as basketball_engine
from sports.basketball import config as basketball_config

app = FastAPI(title="Mock Sports Score API")

# Custom Prometheus metrics for match simulation
MATCHES_ACTIVE = Gauge(
    "mock_api_matches_active",
    "Number of active matches currently being simulated",
    ["sport"]
)

SIMULATION_TICKS = Counter(
    "mock_api_simulation_ticks_total",
    "Total number of simulation engine ticks",
    ["sport"]
)

def update_match_metrics():
    """Update the active matches gauge for all sports."""
    if hasattr(basketball_engine, 'active_matches'):
        MATCHES_ACTIVE.labels(sport="basketball").set(len(basketball_engine.active_matches))
    else:
        MATCHES_ACTIVE.labels(sport="basketball").set(0)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Root-level endpoints (default to basketball) to support legacy clients and tests
@app.get("/score")
def root_score():
    basketball_engine.tick()
    SIMULATION_TICKS.labels(sport="basketball").inc()
    update_match_metrics()
    return {"matches": [game.to_dict() for game in basketball_engine.active_matches.values()]}

@app.post("/reset")
def root_reset():
    basketball_engine.reset_state()
    update_match_metrics()
    return {"matches": [game.to_dict() for game in basketball_engine.active_matches.values()]}

@app.get("/config")
def root_config():
    return basketball_config.get_config()

app.include_router(basketball_router, prefix="/basketball")
app.include_router(soccer_router, prefix="/soccer")

# Initialize Prometheus instrumentation
Instrumentator().instrument(app).expose(app)
