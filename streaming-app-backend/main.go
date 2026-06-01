package main

import (
	"log"
	"net/http"
	"strings"

	"backend/internal/handlers"
)

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func router(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/health" {
		healthCheck(w, r)
		return
	}

	path := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(path, "/")

	if len(parts) >= 2 && parts[0] == "api" {
		switch parts[1] {
		case "score":
			handlers.ScoreProxy(w, r)
			return
		case "reset":
			handlers.ResetProxy(w, r)
			return
		case "config":
			handlers.ConfigProxy(w, r)
			return
		case "sports":
			if len(parts) == 2 {
				handlers.SportsList(w, r)
			} else {
				handlers.SportStats(w, r)
			}
			return
		}
	}

	http.NotFound(w, r)
}

func main() {
	http.HandleFunc("/", router)

	log.Println("Backend server running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
