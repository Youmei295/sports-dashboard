package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"backend/internal/sports"
)

func SportsList(w http.ResponseWriter, r *http.Request) {
	setCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	type brief struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
	var list []brief
	for _, s := range sports.Registry {
		list = append(list, brief{ID: s.ID, Name: s.Name})
	}
	json.NewEncoder(w).Encode(map[string]any{"sports": list})
}

func SportStats(w http.ResponseWriter, r *http.Request) {
	setCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		http.Error(w, `{"error":"missing sport id"}`, http.StatusBadRequest)
		return
	}
	sportID := parts[2]

	sport := sports.FindByID(sportID)
	if sport == nil {
		http.Error(w, `{"error":"unknown sport"}`, http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(sport)
}
