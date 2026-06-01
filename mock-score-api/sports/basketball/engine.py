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
    
    # Timeout check
    if random.random() < 0.05:
        if game.possession == game.home_team and game.home_timeouts > 0:
            game.home_timeouts -= 1
            game.add_event("timeout", "home", f"{game.home_team} calls a timeout.")
        elif game.possession == game.away_team and game.away_timeouts > 0:
            game.away_timeouts -= 1
            game.add_event("timeout", "away", f"{game.away_team} calls a timeout.")

    # Foul check
    if random.random() < 0.15:
        if game.possession == game.home_team:
            game.away_fouls += 1
            game.add_event("foul", "away", f"Foul by {game.away_team}.")
        else:
            game.home_fouls += 1
            game.add_event("foul", "home", f"Foul by {game.home_team}.")

    if random.random() < score_chance:
        points = random.choices([1, 2, 3], weights=[0.2, 0.6, 0.2])[0]
        assist = random.random() < 0.6
        if game.possession == game.home_team:
            game.home_score += points
            if assist: game.home_assists += 1
            game.add_event("score", "home", f"{game.home_team} scores {points} points!")
        else:
            game.away_score += points
            if assist: game.away_assists += 1
            game.add_event("score", "away", f"{game.away_team} scores {points} points!")

        if game.last_scorer == game.possession:
            game.consecutive_scores += 1
        else:
            game.consecutive_scores = 1
            game.last_scorer = game.possession
    else:
        game.consecutive_scores = 0
        game.last_scorer = None
        # Missed shot -> rebound
        off_rebound = random.random() < 0.25
        if game.possession == game.home_team:
            if off_rebound:
                game.home_rebounds += 1
            else:
                game.away_rebounds += 1
                game.possession = game.away_team
        else:
            if off_rebound:
                game.away_rebounds += 1
            else:
                game.home_rebounds += 1
                game.possession = game.home_team

    if random.random() < 0.15: # Random turnover
        game.possession = game.away_team if game.possession == game.home_team else game.home_team

    if game.clock_remaining <= 0:
        game.clock_remaining = 0
        if game.quarter == 1:
            game.quarter = 2
            game.clock_remaining = config.QUARTER_SECONDS
            game.possession = game.away_team
        elif game.quarter == 2:
            game.status = "Halftime"
            game.add_event("halftime", "none", "Halftime")
        elif game.quarter == 3:
            game.quarter = 4
            game.clock_remaining = config.QUARTER_SECONDS
            game.possession = game.home_team
        elif game.quarter == 4:
            game.status = "Final"
            game.add_event("fullTime", "none", "Full time!")


def reset_state() -> None:
    global game
    game = GameState()
