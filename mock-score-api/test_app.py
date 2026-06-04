import pytest
from fastapi.testclient import TestClient
from app import app
from sports.basketball.engine import reset_state as reset_basketball
from sports.soccer.engine import reset_state as reset_soccer

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_before_test():
    reset_basketball()
    reset_soccer()


def test_score_returns_valid_structure():
    resp = client.get("/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "matches" in body
    assert len(body["matches"]) > 0
    match = body["matches"][0]
    assert "id" in match
    assert "homeTeam" in match
    assert "awayTeam" in match
    assert "homeScore" in match
    assert "awayScore" in match
    assert "status" in match
    assert "quarter" in match
    assert "clock" in match
    assert "possession" in match


def test_scores_increase_over_time():
    prev_home = -1
    prev_away = -1
    for _ in range(20):
        resp = client.get("/score")
        body = resp.json()
        match = body["matches"][0]
        assert match["homeScore"] >= prev_home
        assert match["awayScore"] >= prev_away
        prev_home = match["homeScore"]
        prev_away = match["awayScore"]


def test_status_eventually_reaches_final():
    for _ in range(500):
        resp = client.get("/score")
        body = resp.json()
        match = body["matches"][0]
        if match["status"] == "Final":
            break
    assert body["matches"][0]["status"] == "Final"


def test_reset_restores_initial_state():
    client.get("/score")
    client.get("/score")
    resp = client.post("/reset")
    assert resp.status_code == 200
    body = resp.json()
    match = body["matches"][0]
    assert match["status"] == "Scheduled"
    assert match["quarter"] == 0
    assert match["homeScore"] == 0
    assert match["awayScore"] == 0


def test_reset_allows_game_to_restart():
    client.get("/score")
    client.post("/reset")
    for _ in range(5):
        client.get("/score")
    resp = client.get("/score")
    assert resp.json()["matches"][0]["status"] in ("In Progress", "Halftime", "Final")


def test_config_endpoint():
    resp = client.get("/config")
    assert resp.status_code == 200
    body = resp.json()
    assert "teams" in body
    assert "Lakers" in body["teams"]
    assert body["quarterSeconds"] == 720


def test_score_range_is_reasonable():
    for _ in range(100):
        resp = client.get("/score")
        body = resp.json()
        match = body["matches"][0]
        if match["status"] == "In Progress":
            assert 0 <= match["homeScore"] <= 200
            assert 0 <= match["awayScore"] <= 200


def test_halftime_duration(monkeypatch):
    monkeypatch.setattr("sports.basketball.config.QUARTER_SECONDS", 30)
    monkeypatch.setattr("sports.basketball.config.TICK_SECONDS_MIN", 60)
    monkeypatch.setattr("sports.basketball.config.TICK_SECONDS_MAX", 60)
    monkeypatch.setattr("sports.basketball.config.HALFTIME_TICKS", 3)

    while True:
        resp = client.get("/score")
        if resp.json()["matches"][0]["status"] == "Halftime":
            break

    resp = client.get("/score")
    assert resp.json()["matches"][0]["status"] == "Halftime"
    resp = client.get("/score")
    assert resp.json()["matches"][0]["status"] == "Halftime"
    resp = client.get("/score")
    assert resp.json()["matches"][0]["status"] == "In Progress"


def test_basketball_prefixed_routes():
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "matches" in body
    match = body["matches"][0]
    assert "homeTeam" in match
    assert "possession" in match


def test_basketball_prefixed_reset():
    client.get("/basketball/score")
    resp = client.post("/basketball/reset")
    assert resp.status_code == 200
    assert resp.json()["matches"][0]["status"] == "Scheduled"


def test_basketball_prefixed_config():
    resp = client.get("/basketball/config")
    assert resp.status_code == 200
    assert "Lakers" in resp.json()["teams"]


# ============================================================
# Basketball Enhanced Stats Tests
# ============================================================

def test_basketball_has_rebounds():
    """Test that basketball response includes rebound stats."""
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    match = body["matches"][0]
    assert "rebounds" in match
    assert "home" in match["rebounds"]
    assert "away" in match["rebounds"]


def test_basketball_has_assists():
    """Test that basketball response includes assist stats."""
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    match = body["matches"][0]
    assert "assists" in match
    assert "home" in match["assists"]
    assert "away" in match["assists"]


def test_basketball_has_fouls():
    """Test that basketball response includes foul tracking."""
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    match = body["matches"][0]
    assert "fouls" in match
    assert "home" in match["fouls"]
    assert "away" in match["fouls"]


def test_basketball_has_timeouts():
    """Test that basketball response includes timeout counts."""
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    match = body["matches"][0]
    assert "timeouts" in match
    assert match["timeouts"]["home"] <= 7
    assert match["timeouts"]["away"] <= 7


def test_basketball_events_timeline():
    """Test that basketball tracks game events like soccer does."""
    reset_basketball()
    for _ in range(10):
        client.get("/basketball/score")
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    match = body["matches"][0]
    assert "events" in match
    assert isinstance(match["events"], list)


def test_basketball_stats_are_reasonable():
    """Test that stats stay within realistic bounds during simulation."""
    reset_basketball()
    for _ in range(100):
        resp = client.get("/basketball/score")
        body = resp.json()
        match = body["matches"][0]
        if match["status"] == "In Progress":
            assert match["rebounds"]["home"] >= 0
            assert match["rebounds"]["away"] >= 0
            # Assists cannot exceed score (each assist = 1 basket)
            assert match["assists"]["home"] <= match["homeScore"]
            assert match["fouls"]["home"] <= 30  # Realistic foul limit


def test_basketball_reset_clears_all_stats():
    """Test that reset clears all enhanced stats, matching soccer reset behavior."""
    reset_basketball()
    for _ in range(20):
        client.get("/basketball/score")
    resp = client.post("/basketball/reset")
    assert resp.status_code == 200
    body = resp.json()
    match = body["matches"][0]
    assert match["rebounds"]["home"] == 0
    assert match["rebounds"]["away"] == 0
    assert match["assists"]["home"] == 0
    assert match["assists"]["away"] == 0
    assert match["fouls"]["home"] == 0
    assert match["fouls"]["away"] == 0
    assert match["events"] == []


def test_soccer_endpoints():
    resp = client.get("/soccer/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "matches" in body
    match = body["matches"][0]
    assert "half" in match
    assert "homeTeam" in match
    assert "awayTeam" in match
    assert "homeScore" in match
    assert "awayScore" in match

    resp = client.get("/soccer/config")
    assert resp.status_code == 200
    assert "Barcelona" in resp.json()["teams"]

    resp = client.post("/soccer/reset")
    assert resp.status_code == 200
