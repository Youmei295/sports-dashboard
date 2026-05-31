package handlers

import (
	"encoding/json"
	"net/http/httptest"
	"testing"
)

func TestSportsList(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/sports", nil)
	rec := httptest.NewRecorder()

	SportsList(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}

	sports, ok := body["sports"].([]any)
	if !ok {
		t.Fatal("expected sports array")
	}
	if len(sports) != 2 {
		t.Fatalf("expected 2 sports, got %d", len(sports))
	}

	first := sports[0].(map[string]any)
	if first["id"] != "basketball" {
		t.Errorf("expected first sport id=basketball, got %v", first["id"])
	}
}

func TestSportsList_jsonContentType(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/sports", nil)
	rec := httptest.NewRecorder()
	SportsList(rec, req)

	ct := rec.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("expected Content-Type=application/json, got %q", ct)
	}
}

func TestSportStats_basketball(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/sports/basketball", nil)
	rec := httptest.NewRecorder()

	SportStats(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var body map[string]any
	json.Unmarshal(rec.Body.Bytes(), &body)

	if body["id"] != "basketball" {
		t.Errorf("expected id=basketball, got %v", body["id"])
	}
	if body["name"] != "Basketball" {
		t.Errorf("expected name=Basketball, got %v", body["name"])
	}

	stats, ok := body["stats"].([]any)
	if !ok {
		t.Fatal("expected stats array")
	}
	if len(stats) != 8 {
		t.Fatalf("expected 8 stats for basketball, got %d", len(stats))
	}

	first := stats[0].(map[string]any)
	if first["field"] != "homeTeam" {
		t.Errorf("expected first stat field=homeTeam, got %v", first["field"])
	}
}

func TestSportStats_soccer(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/sports/soccer", nil)
	rec := httptest.NewRecorder()

	SportStats(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var body map[string]any
	json.Unmarshal(rec.Body.Bytes(), &body)

	if body["id"] != "soccer" {
		t.Errorf("expected id=soccer, got %v", body["id"])
	}

	stats, ok := body["stats"].([]any)
	if !ok {
		t.Fatal("expected stats array")
	}
	if len(stats) != 15 {
		t.Fatalf("expected 15 stats for soccer, got %d", len(stats))
	}
}

func TestSportStats_unknown(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/sports/tennis", nil)
	rec := httptest.NewRecorder()

	SportStats(rec, req)

	if rec.Code != 404 {
		t.Errorf("expected 404 for unknown sport, got %d", rec.Code)
	}
}

func TestSportStats_missingID(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/sports/", nil)
	req.URL.Path = "/api/sports/"
	rec := httptest.NewRecorder()

	SportStats(rec, req)

	if rec.Code != 400 {
		t.Errorf("expected 400 for missing id, got %d", rec.Code)
	}
}
