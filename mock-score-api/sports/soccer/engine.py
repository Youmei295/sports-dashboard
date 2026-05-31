import random
from . import config
from .models import GameState

game = GameState()


def _effective_attack(team: str) -> float:
    base = config.HOME_ATTACK if team == "home" else config.AWAY_ATTACK
    if team == "home":
        base *= config.HOME_ADVANTAGE
    return base


def _effective_defense(team: str) -> float:
    return config.HOME_DEFENSE if team == "home" else config.AWAY_DEFENSE


def _shot_on_target_chance(attacker: str, defender: str) -> float:
    atk = _effective_attack(attacker)
    dfn = _effective_defense(defender)
    return 0.25 + (atk - dfn) / 400


def _goal_chance_from_shot() -> float:
    return 0.28


def _possession_weight(team: str) -> float:
    atk = _effective_attack(team)
    dfn = _effective_defense(team)
    return (atk + dfn * 0.6) / 2


def _possession_advantage() -> str | None:
    home_gd = game.home_score - game.away_score
    if home_gd > 0:
        return "away"
    if home_gd < 0:
        return "home"
    return None


def _last_third_multiplier() -> float:
    half_end = config.HALF_MINUTES
    minute_in_half = game.minute if game.half == 1 else game.minute - half_end
    if minute_in_half >= half_end - 15:
        return 1.5
    return 1.0


def _simulate_minute() -> None:
    hw = _possession_weight("home")
    aw = _possession_weight("away")
    total = hw + aw
    home_poss_pct = hw / total

    advantage = _possession_advantage()
    if advantage == "home":
        home_poss_pct = min(home_poss_pct + 0.08, 0.80)
    elif advantage == "away":
        home_poss_pct = max(home_poss_pct - 0.08, 0.20)

    has_home_possession = random.random() < home_poss_pct
    attacker = "home" if has_home_possession else "away"
    defender = "away" if has_home_possession else "home"

    game.possession_minutes.append(attacker)

    intensity = _last_third_multiplier()

    if random.random() < 0.20 * intensity:
        target_chance = _shot_on_target_chance(attacker, defender)
        if attacker == "home":
            game.home_shots += 1
        else:
            game.away_shots += 1

        if random.random() < target_chance:
            if attacker == "home":
                game.home_shots_on_target += 1
            else:
                game.away_shots_on_target += 1

            if random.random() < _goal_chance_from_shot():
                if attacker == "home":
                    game.home_score += 1
                    game.add_event("goal", "home", f"{game.home_team} scores!")
                else:
                    game.away_score += 1
                    game.add_event("goal", "away", f"{game.away_team} scores!")

    if random.random() < 0.04 * intensity:
        if attacker == "home":
            game.home_corners += 1
        else:
            game.away_corners += 1

    if random.random() < 0.12:
        if defender == "home":
            game.home_fouls += 1
        else:
            game.away_fouls += 1

        if random.random() < 0.15:
            if defender == "home":
                game.home_yellow += 1
                game.add_event("yellowCard", "home", f"{game.home_team} player cautioned")
            else:
                game.away_yellow += 1
                game.add_event("yellowCard", "away", f"{game.away_team} player cautioned")

            if random.random() < 0.05:
                if defender == "home":
                    game.home_red += 1
                    game.add_event("redCard", "home", f"{game.home_team} player sent off!")
                else:
                    game.away_red += 1
                    game.add_event("redCard", "away", f"{game.away_team} player sent off!")


def tick() -> None:
    if game.status == "Scheduled":
        game.status = "In Progress"
        game.half = 1
        game.minute = 0
        return

    if game.status == "Final":
        return

    if game.status == "Halftime":
        game.halftime_counter += 1
        if game.halftime_counter >= config.HALFTIME_TICKS:
            game.status = "In Progress"
            game.half = 2
            game.minute = config.HALF_MINUTES
        return

    game.minute += 1
    _simulate_minute()

    if game.minute >= config.HALF_MINUTES * 2:
        game.status = "Final"
        game.add_event("fullTime", "none", "Full time!")
    elif game.half == 1 and game.minute >= config.HALF_MINUTES:
        game.status = "Halftime"
        game.add_event("halftime", "none", "Half time")


def reset_state() -> None:
    global game
    game = GameState()
