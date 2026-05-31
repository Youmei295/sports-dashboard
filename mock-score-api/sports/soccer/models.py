from . import config


class GameState:
    def __init__(self):
        self.home_team: str = config.TEAM_HOME
        self.away_team: str = config.TEAM_AWAY
        self.home_score: int = 0
        self.away_score: int = 0
        self.status: str = "Scheduled"
        self.half: int = 0
        self.minute: int = 0
        self.halftime_counter: int = 0
        self.events: list[dict] = []

        self.home_shots: int = 0
        self.away_shots: int = 0
        self.home_shots_on_target: int = 0
        self.away_shots_on_target: int = 0
        self.home_corners: int = 0
        self.away_corners: int = 0
        self.home_fouls: int = 0
        self.away_fouls: int = 0
        self.home_yellow: int = 0
        self.away_yellow: int = 0
        self.home_red: int = 0
        self.away_red: int = 0

        self.possession_minutes: list[str] = []

    def add_event(self, event_type: str, team: str, description: str):
        self.events.append({
            "minute": self.minute,
            "type": event_type,
            "team": team,
            "description": description,
        })

    def possession_percentage(self) -> dict:
        total = len(self.possession_minutes)
        if total == 0:
            return {"home": 50, "away": 50}
        home = sum(1 for p in self.possession_minutes if p == "home")
        away = total - home
        home_pct = round(home / total * 100)
        return {"home": home_pct, "away": 100 - home_pct}

    def clock_formatted(self) -> str:
        if self.status != "In Progress":
            return "--:--"
        return f"{self.minute}'"

    def to_dict(self) -> dict:
        return {
            "homeTeam": self.home_team,
            "awayTeam": self.away_team,
            "homeScore": self.home_score,
            "awayScore": self.away_score,
            "status": self.status,
            "half": self.half,
            "clock": self.clock_formatted(),
            "possession": self.possession_percentage(),
            "shots": {"home": self.home_shots, "away": self.away_shots},
            "shotsOnTarget": {"home": self.home_shots_on_target, "away": self.away_shots_on_target},
            "corners": {"home": self.home_corners, "away": self.away_corners},
            "fouls": {"home": self.home_fouls, "away": self.away_fouls},
            "yellowCards": {"home": self.home_yellow, "away": self.away_yellow},
            "redCards": {"home": self.home_red, "away": self.away_red},
            "events": list(self.events),
        }
