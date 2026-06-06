from . import config


class GameState:
    def __init__(self, match_id: str, home_team: str, away_team: str):
        self.id = match_id
        self.home_team: str = home_team
        self.away_team: str = away_team
        self.home_score: int = config.SCORE_INIT_HOME
        self.away_score: int = config.SCORE_INIT_AWAY
        self.status: str = "Scheduled"
        self.quarter: int = 0
        self.clock_remaining: int = 0
        self.possession: str = home_team
        self.halftime_counter: int = 0
        self.consecutive_scores: int = 0
        self.last_scorer: str | None = None
        self.home_rebounds: int = 0
        self.away_rebounds: int = 0
        self.home_assists: int = 0
        self.away_assists: int = 0
        self.home_fouls: int = 0
        self.away_fouls: int = 0
        self.home_timeouts: int = config.TIMEOUT_LIMIT
        self.away_timeouts: int = config.TIMEOUT_LIMIT
        self.events: list[dict] = []
        self.last_action: str = ""

    def add_event(self, event_type: str, team: str, description: str):
        minutes = self.clock_remaining // 60
        self.events.append({
            "minute": 12 - minutes if self.quarter <= 4 else 5, # rough approx
            "type": event_type,
            "team": team,
            "description": description,
        })

    def clock_formatted(self) -> str:
        if self.status != "In Progress":
            return "--:--"
        minutes = self.clock_remaining // 60
        seconds = self.clock_remaining % 60
        return f"{minutes}:{seconds:02d}"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "homeTeam": self.home_team,
            "awayTeam": self.away_team,
            "homeScore": self.home_score,
            "awayScore": self.away_score,
            "status": self.status,
            "quarter": self.quarter,
            "clock": self.clock_formatted(),
            "possession": self.possession,
            "rebounds": {"home": self.home_rebounds, "away": self.away_rebounds},
            "assists": {"home": self.home_assists, "away": self.away_assists},
            "fouls": {"home": self.home_fouls, "away": self.away_fouls},
            "timeouts": {"home": self.home_timeouts, "away": self.away_timeouts},
            "events": list(self.events),
        }
