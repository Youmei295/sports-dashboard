package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

func setupTestEnv(t *testing.T) *httptest.Server {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.URL.Path {
		case "/score":
			w.Write([]byte(`{"status":"In Progress"}`))
		case "/soccer/score":
			w.Write([]byte(`{"status":"In Progress","half":1}`))
		default:
			w.WriteHeader(404)
		}
	}))
	t.Setenv("MOCK_SCORE_API_URL", ts.URL+"/score")
	return ts
}

func TestRouter_score(t *testing.T) {
	ts := setupTestEnv(t)
	defer ts.Close()

	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	resp, err := http.Get(server.URL + "/api/score")
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}

func TestRouter_score_soccer(t *testing.T) {
	ts := setupTestEnv(t)
	defer ts.Close()

	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	resp, err := http.Get(server.URL + "/api/score?sport=soccer")
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	var body map[string]any
	json.NewDecoder(resp.Body).Decode(&body)
	resp.Body.Close()
	if body["half"] != float64(1) {
		t.Errorf("expected half=1 for soccer, got %v", body["half"])
	}
}

func TestRouter_sports(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	resp, err := http.Get(server.URL + "/api/sports")
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	var body map[string]any
	json.NewDecoder(resp.Body).Decode(&body)
	resp.Body.Close()

	sports, ok := body["sports"].([]any)
	if !ok {
		t.Fatal("expected sports array")
	}
	if len(sports) != 2 {
		t.Errorf("expected 2 sports, got %d", len(sports))
	}
}

func TestRouter_sportStats(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	resp, err := http.Get(server.URL + "/api/sports/basketball")
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	var body map[string]any
	json.NewDecoder(resp.Body).Decode(&body)
	resp.Body.Close()

	if body["id"] != "basketball" {
		t.Errorf("expected id=basketball, got %v", body["id"])
	}
}

func TestRouter_notFound(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	resp, err := http.Get(server.URL + "/api/unknown")
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 404 {
		t.Errorf("expected 404, got %d", resp.StatusCode)
	}
}

func TestRouter_rootNotFound(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	resp, err := http.Get(server.URL + "/")
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 404 {
		t.Errorf("expected 404, got %d", resp.StatusCode)
	}
}

func TestMain(m *testing.M) {
	os.Unsetenv("MOCK_SCORE_API_URL")
	code := m.Run()
	os.Exit(code)
}

func TestRouter_reset(t *testing.T) {
	ts := setupTestEnv(t)
	defer ts.Close()

	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	resp, err := http.Post(server.URL+"/api/reset", "application/json", nil)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}

func TestRouter_config(t *testing.T) {
	ts := setupTestEnv(t)
	defer ts.Close()

	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	resp, err := http.Get(server.URL + "/api/config")
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}

func TestRouter_corsOnScore(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	req, _ := http.NewRequest("OPTIONS", server.URL+"/api/score", nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 200 {
		t.Errorf("expected 200 for OPTIONS, got %d", resp.StatusCode)
	}
	origin := resp.Header.Get("Access-Control-Allow-Origin")
	if origin != "*" {
		t.Errorf("expected CORS *, got %q", origin)
	}
}

func TestRouter_resetNotFound(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	resp, err := http.Get(server.URL + "/api/reset")
	if err != nil {
		t.Fatal(err)
	}
	// Reset should be POST - GET should 404 since router doesn't match
	if resp.StatusCode != 404 {
		t.Errorf("expected 404 for GET /api/reset, got %d", resp.StatusCode)
	}
}

func TestRouter_methodParam(t *testing.T) {
	ts := setupTestEnv(t)
	defer ts.Close()

	server := httptest.NewServer(http.HandlerFunc(router))
	defer server.Close()

	// POST to /api/score should also work since handlers accept any method
	resp, err := http.Post(server.URL+"/api/score", "application/json", nil)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Errorf("expected 200 for POST /api/score, got %d", resp.StatusCode)
	}
}
