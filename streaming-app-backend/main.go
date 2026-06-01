package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
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
	// Load .env file if it exists, ignore error if it doesn't (useful for production)
	_ = godotenv.Load()

	http.HandleFunc("/", router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Backend server running on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
