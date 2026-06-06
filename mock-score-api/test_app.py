import pytest
from fastapi.testclient import TestClient
from app import app
from sports.basketball.engine import reset_state as reset_basketball

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_before_test():
    reset_basketball()


def test_score_returns_valid_structure():
    resp = client.get("/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "homeTeam" in body
    assert "awayTeam" in body
    assert "homeScore" in body
    assert "awayScore" in body
    assert "status" in body
    assert "quarter" in body
    assert "clock" in body
    assert "possession" in body


def test_scores_increase_over_time():
    prev_home = -1
    prev_away = -1
    for _ in range(20):
        resp = client.get("/score")
        body = resp.json()
        assert body["homeScore"] >= prev_home
        assert body["awayScore"] >= prev_away
        prev_home = body["homeScore"]
        prev_away = body["awayScore"]


def test_status_eventually_reaches_final():
    for _ in range(500):
        resp = client.get("/score")
        body = resp.json()
        if body["status"] == "Final":
            break
    assert body["status"] == "Final"


def test_reset_restores_initial_state():
    client.get("/score")
    client.get("/score")
    resp = client.post("/reset")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "Scheduled"
    assert body["quarter"] == 0
    assert body["homeScore"] == 0
    assert body["awayScore"] == 0


def test_reset_allows_game_to_restart():
    client.get("/score")
    client.post("/reset")
    for _ in range(5):
        client.get("/score")
    resp = client.get("/score")
    assert resp.json()["status"] in ("In Progress", "Halftime", "Final")


def test_config_endpoint():
    resp = client.get("/config")
    assert resp.status_code == 200
    body = resp.json()
    assert body["homeTeam"] == "Lakers"
    assert body["awayTeam"] == "Warriors"
    assert body["quarterSeconds"] == 720


def test_score_range_is_reasonable():
    for _ in range(100):
        resp = client.get("/score")
        body = resp.json()
        if body["status"] == "In Progress":
            assert 0 <= body["homeScore"] <= 200
            assert 0 <= body["awayScore"] <= 200


def test_halftime_duration(monkeypatch):
    monkeypatch.setattr("sports.basketball.config.QUARTER_SECONDS", 30)
    monkeypatch.setattr("sports.basketball.config.TICK_SECONDS_MIN", 60)
    monkeypatch.setattr("sports.basketball.config.TICK_SECONDS_MAX", 60)
    monkeypatch.setattr("sports.basketball.config.HALFTIME_TICKS", 3)

    while True:
        resp = client.get("/score")
        if resp.json()["status"] == "Halftime":
            break

    resp = client.get("/score")
    assert resp.json()["status"] == "Halftime"
    resp = client.get("/score")
    assert resp.json()["status"] == "Halftime"
    resp = client.get("/score")
    assert resp.json()["status"] == "In Progress"


def test_basketball_prefixed_routes():
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "homeTeam" in body
    assert "possession" in body


def test_basketball_prefixed_reset():
    client.get("/basketball/score")
    resp = client.post("/basketball/reset")
    assert resp.status_code == 200
    assert resp.json()["status"] == "Scheduled"


def test_basketball_prefixed_config():
    resp = client.get("/basketball/config")
    assert resp.status_code == 200
    assert resp.json()["homeTeam"] == "Lakers"


# ============================================================
# Basketball Enhanced Stats Tests
# ============================================================

def test_basketball_has_rebounds():
    """Test that basketball response includes rebound stats."""
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "rebounds" in body
    assert "home" in body["rebounds"]
    assert "away" in body["rebounds"]


def test_basketball_has_assists():
    """Test that basketball response includes assist stats."""
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "assists" in body
    assert "home" in body["assists"]
    assert "away" in body["assists"]


def test_basketball_has_fouls():
    """Test that basketball response includes foul tracking."""
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "fouls" in body
    assert "home" in body["fouls"]
    assert "away" in body["fouls"]


def test_basketball_has_timeouts():
    """Test that basketball response includes timeout counts."""
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "timeouts" in body
    assert body["timeouts"]["home"] <= 7
    assert body["timeouts"]["away"] <= 7


def test_basketball_events_timeline():
    """Test that basketball tracks game events like soccer does."""
    reset_basketball()
    for _ in range(10):
        client.get("/basketball/score")
    resp = client.get("/basketball/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "events" in body
    assert isinstance(body["events"], list)


def test_basketball_stats_are_reasonable():
    """Test that stats stay within realistic bounds during simulation."""
    reset_basketball()
    for _ in range(100):
        resp = client.get("/basketball/score")
        body = resp.json()
        if body["status"] == "In Progress":
            assert body["rebounds"]["home"] >= 0
            assert body["rebounds"]["away"] >= 0
            # Assists cannot exceed score (each assist = 1 basket)
            assert body["assists"]["home"] <= body["homeScore"]
            assert body["fouls"]["home"] <= 30  # Realistic foul limit


def test_basketball_reset_clears_all_stats():
    """Test that reset clears all enhanced stats, matching soccer reset behavior."""
    reset_basketball()
    for _ in range(20):
        client.get("/basketball/score")
    resp = client.post("/basketball/reset")
    assert resp.status_code == 200
    body = resp.json()
    assert body["rebounds"]["home"] == 0
    assert body["rebounds"]["away"] == 0
    assert body["assists"]["home"] == 0
    assert body["assists"]["away"] == 0
    assert body["fouls"]["home"] == 0
    assert body["fouls"]["away"] == 0
    assert body["events"] == []


def test_soccer_endpoints():
    resp = client.get("/soccer/score")
    assert resp.status_code == 200
    body = resp.json()
    assert "half" in body
    assert "homeTeam" in body
    assert "awayTeam" in body
    assert "homeScore" in body
    assert "awayScore" in body

    resp = client.get("/soccer/config")
    assert resp.status_code == 200
    assert resp.json()["homeTeam"] == "Barcelona"

    resp = client.post("/soccer/reset")
    assert resp.status_code == 200


# ============================================================
# Prometheus Metrics Tests
# ============================================================

def test_metrics_endpoint_exists():
    """Test that the /metrics endpoint is exposed for Prometheus scraping."""
    resp = client.get("/metrics")
    assert resp.status_code == 200
    # Prometheus metrics are in plain text format
    assert "text/plain" in resp.headers.get("content-type", "")


def test_metrics_include_custom_metrics():
    """Test that custom metrics are exposed."""
    # Make some requests to generate metrics
    client.get("/score")
    client.get("/score")
    
    resp = client.get("/metrics")
    assert resp.status_code == 200
    content = resp.text
    
    # Check for our custom metrics
    assert "mock_api_matches_active" in content
    assert "mock_api_simulation_ticks_total" in content
    assert "basketball" in content  # Sport label


def test_metrics_include_http_metrics():
    """Test that HTTP metrics are auto-instrumented."""
    resp = client.get("/metrics")
    assert resp.status_code == 200
    content = resp.text
    
    # FastAPI instrumentator provides these metrics
    assert "http_request" in content.lower()

