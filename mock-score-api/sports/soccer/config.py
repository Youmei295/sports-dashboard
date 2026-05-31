import os

TEAM_HOME = os.getenv("SOCCER_TEAM_HOME", "Barcelona")
TEAM_AWAY = os.getenv("SOCCER_TEAM_AWAY", "Real Madrid")
HALF_MINUTES = int(os.getenv("SOCCER_HALF_MINUTES", "45"))
HALFTIME_TICKS = int(os.getenv("SOCCER_HALFTIME_TICKS", "3"))

HOME_ATTACK = int(os.getenv("SOCCER_HOME_ATTACK", "80"))
HOME_DEFENSE = int(os.getenv("SOCCER_HOME_DEFENSE", "75"))
AWAY_ATTACK = int(os.getenv("SOCCER_AWAY_ATTACK", "72"))
AWAY_DEFENSE = int(os.getenv("SOCCER_AWAY_DEFENSE", "70"))
HOME_ADVANTAGE = float(os.getenv("SOCCER_HOME_ADVANTAGE", "1.12"))


def get_config() -> dict:
    return {
        "homeTeam": TEAM_HOME,
        "awayTeam": TEAM_AWAY,
        "halfMinutes": HALF_MINUTES,
        "halftimeTicks": HALFTIME_TICKS,
        "homeAttack": HOME_ATTACK,
        "homeDefense": HOME_DEFENSE,
        "awayAttack": AWAY_ATTACK,
        "awayDefense": AWAY_DEFENSE,
        "homeAdvantage": HOME_ADVANTAGE,
    }
