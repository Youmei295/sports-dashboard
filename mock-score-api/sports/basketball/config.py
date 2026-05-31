import os

TEAM_HOME = os.getenv("TEAM_HOME", "Lakers")
TEAM_AWAY = os.getenv("TEAM_AWAY", "Warriors")
SCORE_INIT_HOME = int(os.getenv("SCORE_INIT_HOME", "0"))
SCORE_INIT_AWAY = int(os.getenv("SCORE_INIT_AWAY", "0"))
QUARTER_SECONDS = int(os.getenv("QUARTER_SECONDS", "720"))
TICK_SECONDS_MIN = int(os.getenv("TICK_SECONDS_MIN", "10"))
TICK_SECONDS_MAX = int(os.getenv("TICK_SECONDS_MAX", "60"))
HALFTIME_TICKS = int(os.getenv("HALFTIME_TICKS", "3"))


def get_config() -> dict:
    return {
        "homeTeam": TEAM_HOME,
        "awayTeam": TEAM_AWAY,
        "scoreInitHome": SCORE_INIT_HOME,
        "scoreInitAway": SCORE_INIT_AWAY,
        "quarterSeconds": QUARTER_SECONDS,
        "tickSecondsMin": TICK_SECONDS_MIN,
        "tickSecondsMax": TICK_SECONDS_MAX,
        "halftimeTicks": HALFTIME_TICKS,
    }
