import os

BASKETBALL_TEAMS = ["Lakers", "Warriors", "Bulls", "Celtics", "Heat", "Knicks", "Nuggets", "Mavericks"]
SCORE_INIT_HOME = int(os.getenv("SCORE_INIT_HOME", "0"))
SCORE_INIT_AWAY = int(os.getenv("SCORE_INIT_AWAY", "0"))
QUARTER_SECONDS = int(os.getenv("QUARTER_SECONDS", "720"))
TICK_SECONDS_MIN = int(os.getenv("TICK_SECONDS_MIN", "10"))
TICK_SECONDS_MAX = int(os.getenv("TICK_SECONDS_MAX", "60"))
HALFTIME_TICKS = int(os.getenv("HALFTIME_TICKS", "3"))
TIMEOUT_LIMIT = int(os.getenv("TIMEOUT_LIMIT", "7"))
FOUL_LIMIT = int(os.getenv("FOUL_LIMIT", "6"))


def get_config() -> dict:
    return {
        "teams": BASKETBALL_TEAMS,
        "scoreInitHome": SCORE_INIT_HOME,
        "scoreInitAway": SCORE_INIT_AWAY,
        "quarterSeconds": QUARTER_SECONDS,
        "tickSecondsMin": TICK_SECONDS_MIN,
        "tickSecondsMax": TICK_SECONDS_MAX,
        "halftimeTicks": HALFTIME_TICKS,
        "timeoutLimit": TIMEOUT_LIMIT,
        "foulLimit": FOUL_LIMIT,
    }
