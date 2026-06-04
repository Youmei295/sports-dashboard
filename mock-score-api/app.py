from dotenv import load_dotenv
load_dotenv()  # Take environment variables from .env if it exists

from fastapi import FastAPI
from sports.basketball.routes import router as basketball_router
from sports.soccer.routes import router as soccer_router
from sports.basketball import engine as basketball_engine
from sports.basketball import config as basketball_config

app = FastAPI(title="Mock Sports Score API")

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Root-level endpoints (default to basketball) to support legacy clients and tests
@app.get("/score")
def root_score():
    basketball_engine.tick()
    return {"matches": [game.to_dict() for game in basketball_engine.active_matches.values()]}

@app.post("/reset")
def root_reset():
    basketball_engine.reset_state()
    return {"matches": [game.to_dict() for game in basketball_engine.active_matches.values()]}

@app.get("/config")
def root_config():
    return basketball_config.get_config()

app.include_router(basketball_router, prefix="/basketball")
app.include_router(soccer_router, prefix="/soccer")
