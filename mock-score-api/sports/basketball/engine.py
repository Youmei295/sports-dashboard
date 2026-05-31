import random
from . import config
from .models import GameState

game = GameState()


def tick() -> None:
    if game.status == "Scheduled":
        game.status = "In Progress"
        game.quarter = 1
        game.clock_remaining = config.QUARTER_SECONDS
        game.possession = config.TEAM_HOME if random.random() < 0.5 else config.TEAM_AWAY
        return

    if game.status == "Final":
        return

    if game.status == "Halftime":
        game.halftime_counter += 1
        if game.halftime_counter >= config.HALFTIME_TICKS:
            game.status = "In Progress"
            game.quarter = 3
            game.clock_remaining = config.QUARTER_SECONDS
            game.possession = config.TEAM_AWAY
        return

    tick_seconds = random.randint(config.TICK_SECONDS_MIN, config.TICK_SECONDS_MAX)
    game.clock_remaining -= tick_seconds

    score_chance = min(0.6 + game.consecutive_scores * 0.1, 0.85)
    if random.random() < score_chance:
        points = random.choices([1, 2, 3], weights=[0.2, 0.6, 0.2])[0]
        if game.possession == game.home_team:
            game.home_score += points
        else:
            game.away_score += points

        if game.last_scorer == game.possession:
            game.consecutive_scores += 1
        else:
            game.consecutive_scores = 1
            game.last_scorer = game.possession
    else:
        game.consecutive_scores = 0
        game.last_scorer = None

    if random.random() < 0.35:
        game.possession = game.away_team if game.possession == game.home_team else game.home_team

    if game.clock_remaining <= 0:
        game.clock_remaining = 0
        if game.quarter == 1:
            game.quarter = 2
            game.clock_remaining = config.QUARTER_SECONDS
            game.possession = game.away_team
        elif game.quarter == 2:
            game.status = "Halftime"
        elif game.quarter == 3:
            game.quarter = 4
            game.clock_remaining = config.QUARTER_SECONDS
            game.possession = game.home_team
        elif game.quarter == 4:
            game.status = "Final"


def reset_state() -> None:
    global game
    game = GameState()
