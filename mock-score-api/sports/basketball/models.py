from . import config


class GameState:
    def __init__(self):
        self.home_team: str = config.TEAM_HOME
        self.away_team: str = config.TEAM_AWAY
        self.home_score: int = config.SCORE_INIT_HOME
        self.away_score: int = config.SCORE_INIT_AWAY
        self.status: str = "Scheduled"
        self.quarter: int = 0
        self.clock_remaining: int = 0
        self.possession: str = config.TEAM_HOME
        self.halftime_counter: int = 0
        self.consecutive_scores: int = 0
        self.last_scorer: str | None = None

    def clock_formatted(self) -> str:
        if self.status != "In Progress":
            return "--:--"
        minutes = self.clock_remaining // 60
        seconds = self.clock_remaining % 60
        return f"{minutes}:{seconds:02d}"

    def to_dict(self) -> dict:
        return {
            "homeTeam": self.home_team,
            "awayTeam": self.away_team,
            "homeScore": self.home_score,
            "awayScore": self.away_score,
            "status": self.status,
            "quarter": self.quarter,
            "clock": self.clock_formatted(),
            "possession": self.possession,
        }
