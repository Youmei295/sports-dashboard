package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"backend/internal/handlers"
	"backend/internal/metrics"
)

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func router(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := r.URL.Path

	// Handle metrics endpoint (no instrumentation to avoid recursion)
	if path == "/metrics" {
		promhttp.Handler().ServeHTTP(w, r)
		return
	}

	// Handle health endpoint
	if path == "/health" {
		healthCheck(w, r)
		metrics.RecordHTTPRequest(r.Method, "/health", http.StatusOK, time.Since(start).Seconds())
		return
	}

	// Handle API routes
	trimmedPath := strings.Trim(path, "/")
	parts := strings.Split(trimmedPath, "/")

	status := http.StatusNotFound

	if len(parts) >= 2 && parts[0] == "api" {
		switch parts[1] {
		case "score":
			handlers.ScoreProxy(w, r)
			status = http.StatusOK // Actual status handled inside handler
			metrics.RecordHTTPRequest(r.Method, "/api/score", status, time.Since(start).Seconds())
			return
		case "reset":
			handlers.ResetProxy(w, r)
			status = http.StatusOK
			metrics.RecordHTTPRequest(r.Method, "/api/reset", status, time.Since(start).Seconds())
			return
		case "config":
			handlers.ConfigProxy(w, r)
			status = http.StatusOK
			metrics.RecordHTTPRequest(r.Method, "/api/config", status, time.Since(start).Seconds())
			return
		case "sports":
			if len(parts) == 2 {
				handlers.SportsList(w, r)
			} else {
				handlers.SportStats(w, r)
			}
			metrics.RecordHTTPRequest(r.Method, path, http.StatusOK, time.Since(start).Seconds())
			return
		}
	}

	http.NotFound(w, r)
	metrics.RecordHTTPRequest(r.Method, path, status, time.Since(start).Seconds())
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
