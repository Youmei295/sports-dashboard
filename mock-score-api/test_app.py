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

