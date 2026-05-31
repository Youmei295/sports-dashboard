package handlers

import (
	"log"
	"net/http"

	"backend/internal/proxy"
)

func setCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func sportFromQuery(r *http.Request) string {
	return r.URL.Query().Get("sport")
}

func ScoreProxy(w http.ResponseWriter, r *http.Request) {
	setCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	sport := sportFromQuery(r)
	body, status, err := proxy.GetScore(sport)
	if err != nil {
		log.Printf("Failed to fetch score: %v", err)
		http.Error(w, `{"error":"failed to fetch score"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(body)
}

func ResetProxy(w http.ResponseWriter, r *http.Request) {
	setCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	sport := sportFromQuery(r)
	body, status, err := proxy.ResetGame(sport)
	if err != nil {
		log.Printf("Failed to reset game: %v", err)
		http.Error(w, `{"error":"failed to reset game"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(body)
}

func ConfigProxy(w http.ResponseWriter, r *http.Request) {
	setCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	sport := sportFromQuery(r)
	body, status, err := proxy.GetConfig(sport)
	if err != nil {
		log.Printf("Failed to fetch config: %v", err)
		http.Error(w, `{"error":"failed to fetch config"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(body)
}
