from fastapi import APIRouter
from . import engine, config

router = APIRouter(tags=["basketball"])


@router.get("/score")
def get_score():
    engine.tick()
    return engine.game.to_dict()


@router.post("/reset")
def reset_game():
    engine.reset_state()
    return engine.game.to_dict()


@router.get("/config")
def get_config():
    return config.get_config()
