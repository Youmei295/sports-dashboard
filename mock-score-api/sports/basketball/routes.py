from fastapi import APIRouter
from . import engine, config

router = APIRouter(tags=["basketball"])


@router.get("/score")
def get_score():
    engine.tick()
    return {"matches": [game.to_dict() for game in engine.active_matches.values()]}


@router.post("/reset")
def reset_game():
    engine.reset_state()
    return {"matches": [game.to_dict() for game in engine.active_matches.values()]}


@router.get("/config")
def get_config():
    return config.get_config()
