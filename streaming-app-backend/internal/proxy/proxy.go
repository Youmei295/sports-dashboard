package proxy

import (
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

func mockBaseURL() string {
	u := os.Getenv("MOCK_SCORE_API_URL")
	if u == "" {
		u = "http://localhost:8000/score"
	}
	return strings.TrimSuffix(u, "/score")
}

func mockURL(sport, action string) string {
	base := mockBaseURL()
	// Historical behavior: basketball endpoints are rooted at /score, /reset, /config (no sport prefix).
	if sport == "" || sport == "basketball" {
		return base + "/" + action
	}
	return base + "/" + sport + "/" + action
}

func doGet(url string) ([]byte, int, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, err
	}
	return body, resp.StatusCode, nil
}

func doPost(url string) ([]byte, int, error) {
	resp, err := http.Post(url, "application/json", nil)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, err
	}
	return body, resp.StatusCode, nil
}

func GetScore(sport string) ([]byte, int, error) {
	url := mockURL(sport, "score")
	return doGet(url)
}

func ResetGame(sport string) ([]byte, int, error) {
	url := mockURL(sport, "reset")
	return doPost(url)
}

func GetConfig(sport string) ([]byte, int, error) {
	url := mockURL(sport, "config")
	body, status, err := doGet(url)
	if err != nil {
		log.Printf("Failed to fetch config: %v", err)
	}
	return body, status, err
}
