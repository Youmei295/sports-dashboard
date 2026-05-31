package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func mockAPIServer(t *testing.T) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.URL.Path {
		case "/score":
			w.Write([]byte(`{"status":"In Progress","homeScore":10,"awayScore":5}`))
		case "/reset":
			w.Write([]byte(`{"status":"Scheduled"}`))
		case "/config":
			w.Write([]byte(`{"homeTeam":"Lakers"}`))
		case "/soccer/score":
			w.Write([]byte(`{"status":"In Progress","homeScore":1,"awayScore":0,"half":1}`))
		case "/soccer/reset":
			w.Write([]byte(`{"status":"Scheduled"}`))
		case "/soccer/config":
			w.Write([]byte(`{"homeTeam":"Barcelona"}`))
		default:
			w.WriteHeader(404)
			w.Write([]byte(`{"error":"not found"}`))
		}
	}))
}

func setupMockEnv(t *testing.T, ts *httptest.Server) {
	t.Setenv("MOCK_SCORE_API_URL", ts.URL+"/score")
}

func TestScoreProxy_default(t *testing.T) {
	ts := mockAPIServer(t)
	defer ts.Close()
	setupMockEnv(t, ts)

	req := httptest.NewRequest("GET", "/api/score", nil)
	rec := httptest.NewRecorder()
	ScoreProxy(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var body map[string]any
	json.Unmarshal(rec.Body.Bytes(), &body)
	if body["status"] != "In Progress" {
		t.Errorf("expected In Progress, got %v", body["status"])
	}
}

func TestScoreProxy_basketball(t *testing.T) {
	ts := mockAPIServer(t)
	defer ts.Close()
	setupMockEnv(t, ts)

	req := httptest.NewRequest("GET", "/api/score?sport=basketball", nil)
	rec := httptest.NewRecorder()
	ScoreProxy(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestScoreProxy_soccer(t *testing.T) {
	ts := mockAPIServer(t)
	defer ts.Close()
	setupMockEnv(t, ts)

	req := httptest.NewRequest("GET", "/api/score?sport=soccer", nil)
	rec := httptest.NewRecorder()
	ScoreProxy(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var body map[string]any
	json.Unmarshal(rec.Body.Bytes(), &body)
	if body["half"] != float64(1) {
		t.Errorf("expected half=1, got %v", body["half"])
	}
}

func TestScoreProxy_cors(t *testing.T) {
	ts := mockAPIServer(t)
	defer ts.Close()
	setupMockEnv(t, ts)

	req := httptest.NewRequest("OPTIONS", "/api/score", nil)
	rec := httptest.NewRecorder()
	ScoreProxy(rec, req)

	if rec.Code != 200 {
		t.Errorf("expected 200 for OPTIONS, got %d", rec.Code)
	}
	if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("missing CORS header")
	}
}

func TestResetProxy(t *testing.T) {
	ts := mockAPIServer(t)
	defer ts.Close()
	setupMockEnv(t, ts)

	req := httptest.NewRequest("POST", "/api/reset", nil)
	rec := httptest.NewRecorder()
	ResetProxy(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var body map[string]any
	json.Unmarshal(rec.Body.Bytes(), &body)
	if body["status"] != "Scheduled" {
		t.Errorf("expected Scheduled, got %v", body["status"])
	}
}

func TestResetProxy_soccer(t *testing.T) {
	ts := mockAPIServer(t)
	defer ts.Close()
	setupMockEnv(t, ts)

	req := httptest.NewRequest("POST", "/api/reset?sport=soccer", nil)
	rec := httptest.NewRecorder()
	ResetProxy(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestResetProxy_cors(t *testing.T) {
	req := httptest.NewRequest("OPTIONS", "/api/reset", nil)
	rec := httptest.NewRecorder()
	ResetProxy(rec, req)

	if rec.Code != 200 {
		t.Errorf("expected 200 for OPTIONS, got %d", rec.Code)
	}
	if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("missing CORS header")
	}
}

func TestConfigProxy(t *testing.T) {
	ts := mockAPIServer(t)
	defer ts.Close()
	setupMockEnv(t, ts)

	req := httptest.NewRequest("GET", "/api/config", nil)
	rec := httptest.NewRecorder()
	ConfigProxy(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var body map[string]any
	json.Unmarshal(rec.Body.Bytes(), &body)
	if body["homeTeam"] != "Lakers" {
		t.Errorf("expected homeTeam=Lakers, got %v", body["homeTeam"])
	}
}

func TestConfigProxy_soccer(t *testing.T) {
	ts := mockAPIServer(t)
	defer ts.Close()
	setupMockEnv(t, ts)

	req := httptest.NewRequest("GET", "/api/config?sport=soccer", nil)
	rec := httptest.NewRecorder()
	ConfigProxy(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var body map[string]any
	json.Unmarshal(rec.Body.Bytes(), &body)
	if body["homeTeam"] != "Barcelona" {
		t.Errorf("expected homeTeam=Barcelona, got %v", body["homeTeam"])
	}
}
