package proxy

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func testServer(t *testing.T, handler http.HandlerFunc) func() {
	ts := httptest.NewServer(handler)
	os.Setenv("MOCK_SCORE_API_URL", ts.URL+"/score")
	return func() {
		ts.Close()
		os.Unsetenv("MOCK_SCORE_API_URL")
	}
}

func TestGetScore_default(t *testing.T) {
	cleanup := testServer(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			t.Errorf("expected GET, got %s", r.Method)
		}
		if r.URL.Path != "/score" {
			t.Errorf("expected /score, got %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"matches":[{"status":"ok","homeScore":10}]}`))
	})
	defer cleanup()

	body, code, err := GetScore("")
	if err != nil {
		t.Fatal(err)
	}
	if code != 200 {
		t.Errorf("expected 200, got %d", code)
	}
	var result map[string]any
	if err := json.Unmarshal(body, &result); err != nil {
		t.Fatal(err)
	}
	matches, _ := result["matches"].([]interface{})
	match := matches[0].(map[string]interface{})
	if match["status"] != "ok" {
		t.Errorf("expected status=ok, got %v", match["status"])
	}
}

func TestGetScore_basketball(t *testing.T) {
	cleanup := testServer(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/score" {
			t.Errorf("expected /score for basketball, got %s", r.URL.Path)
		}
		w.Write([]byte(`{"matches":[{"status":"ok"}]}`))
	})
	defer cleanup()

	_, code, err := GetScore("basketball")
	if err != nil {
		t.Fatal(err)
	}
	if code != 200 {
		t.Errorf("expected 200, got %d", code)
	}
}

func TestGetScore_soccer(t *testing.T) {
	cleanup := testServer(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/soccer/score" {
			t.Errorf("expected /soccer/score, got %s", r.URL.Path)
		}
		w.Write([]byte(`{"matches":[{"status":"ok"}]}`))
	})
	defer cleanup()

	_, code, err := GetScore("soccer")
	if err != nil {
		t.Fatal(err)
	}
	if code != 200 {
		t.Errorf("expected 200, got %d", code)
	}
}

func TestGetScore_serverError(t *testing.T) {
	cleanup := testServer(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error":"internal"}`))
	})
	defer cleanup()

	_, code, err := GetScore("")
	if err != nil {
		t.Fatal(err)
	}
	if code != 500 {
		t.Errorf("expected 500, got %d", code)
	}
}

func TestResetGame(t *testing.T) {
	cleanup := testServer(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if r.URL.Path != "/reset" {
			t.Errorf("expected /reset, got %s", r.URL.Path)
		}
		w.Write([]byte(`{"matches":[{"status":"Scheduled"}]}`))
	})
	defer cleanup()

	body, code, err := ResetGame("")
	if err != nil {
		t.Fatal(err)
	}
	if code != 200 {
		t.Errorf("expected 200, got %d", code)
	}
	var result map[string]any
	json.Unmarshal(body, &result)
	matches, _ := result["matches"].([]interface{})
	match := matches[0].(map[string]interface{})
	if match["status"] != "Scheduled" {
		t.Errorf("expected status=Scheduled, got %v", match["status"])
	}
}

func TestResetGame_soccer(t *testing.T) {
	cleanup := testServer(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/soccer/reset" {
			t.Errorf("expected /soccer/reset, got %s", r.URL.Path)
		}
		w.Write([]byte(`{"matches":[{"status":"Scheduled"}]}`))
	})
	defer cleanup()

	_, code, err := ResetGame("soccer")
	if err != nil {
		t.Fatal(err)
	}
	if code != 200 {
		t.Errorf("expected 200, got %d", code)
	}
}

func TestGetConfig(t *testing.T) {
	cleanup := testServer(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/config" {
			t.Errorf("expected /config, got %s", r.URL.Path)
		}
		w.Write([]byte(`{"teams":["Lakers"]}`))
	})
	defer cleanup()

	body, code, err := GetConfig("")
	if err != nil {
		t.Fatal(err)
	}
	if code != 200 {
		t.Errorf("expected 200, got %d", code)
	}
	var result map[string]any
	json.Unmarshal(body, &result)
	teams, _ := result["teams"].([]interface{})
	if teams[0] != "Lakers" {
		t.Errorf("expected Lakers in teams, got %v", teams[0])
	}
}

func TestGetConfig_soccer(t *testing.T) {
	cleanup := testServer(t, func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/soccer/config" {
			t.Errorf("expected /soccer/config, got %s", r.URL.Path)
		}
		w.Write([]byte(`{"teams":["Barcelona"]}`))
	})
	defer cleanup()

	body, code, err := GetConfig("soccer")
	if err != nil {
		t.Fatal(err)
	}
	var result map[string]any
	json.Unmarshal(body, &result)
	teams, _ := result["teams"].([]interface{})
	if teams[0] != "Barcelona" {
		t.Errorf("expected Barcelona in teams, got %v", teams[0])
	}
	if code != 200 {
		t.Errorf("expected 200, got %d", code)
	}
}

func TestEnvVarDefault(t *testing.T) {
	os.Unsetenv("MOCK_SCORE_API_URL")
	base := mockBaseURL()
	expected := "http://localhost:8000"
	if base != expected {
		t.Errorf("expected %q, got %q", expected, base)
	}
}

func TestMockURL_default(t *testing.T) {
	os.Setenv("MOCK_SCORE_API_URL", "http://mock:8000/score")
	defer os.Unsetenv("MOCK_SCORE_API_URL")

	url := mockURL("", "score")
	expected := "http://mock:8000/score"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestMockURL_soccerScore(t *testing.T) {
	os.Setenv("MOCK_SCORE_API_URL", "http://mock:8000/score")
	defer os.Unsetenv("MOCK_SCORE_API_URL")

	url := mockURL("soccer", "score")
	expected := "http://mock:8000/soccer/score"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}

func TestMockURL_basketballReset(t *testing.T) {
	os.Setenv("MOCK_SCORE_API_URL", "http://mock:8000/score")
	defer os.Unsetenv("MOCK_SCORE_API_URL")

	url := mockURL("basketball", "reset")
	expected := "http://mock:8000/reset"
	if url != expected {
		t.Errorf("expected %q, got %q", expected, url)
	}
}
