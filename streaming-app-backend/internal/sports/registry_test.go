package sports

import "testing"

func TestRegistryContainsBasketball(t *testing.T) {
	s := FindByID("basketball")
	if s == nil {
		t.Fatal("expected basketball to be in registry")
	}
	if s.Name != "Basketball" {
		t.Errorf("expected Name=Basketball, got %q", s.Name)
	}
}

func TestRegistryContainsSoccer(t *testing.T) {
	s := FindByID("soccer")
	if s == nil {
		t.Fatal("expected soccer to be in registry")
	}
	if s.Name != "Soccer" {
		t.Errorf("expected Name=Soccer, got %q", s.Name)
	}
}

func TestFindByID_unknown(t *testing.T) {
	s := FindByID("tennis")
	if s != nil {
		t.Errorf("expected nil for unknown sport, got %v", s)
	}
}

func TestRegistry_expectedSportCount(t *testing.T) {
	if len(Registry) != 2 {
		t.Errorf("expected 2 sports, got %d", len(Registry))
	}
}

func TestBasketballStats(t *testing.T) {
	s := FindByID("basketball")
	if s == nil {
		t.Fatal("basketball not found")
	}

	expected := []string{
		"homeTeam", "awayTeam", "homeScore", "awayScore",
		"status", "quarter", "clock", "possession",
	}
	if len(s.Stats) != len(expected) {
		t.Fatalf("expected %d stats, got %d", len(expected), len(s.Stats))
	}
	for i, f := range expected {
		if s.Stats[i].Field != f {
			t.Errorf("stat[%d].Field = %q, want %q", i, s.Stats[i].Field, f)
		}
		if s.Stats[i].Label == "" {
			t.Errorf("stat[%d] %q has empty label", i, f)
		}
		if s.Stats[i].Type == "" {
			t.Errorf("stat[%d] %q has empty type", i, f)
		}
	}
}

func TestSoccerStats(t *testing.T) {
	s := FindByID("soccer")
	if s == nil {
		t.Fatal("soccer not found")
	}

	expected := []string{
		"homeTeam", "awayTeam", "homeScore", "awayScore",
		"status", "half", "clock", "possession", "shots",
		"shotsOnTarget", "corners", "fouls", "yellowCards",
		"redCards", "events",
	}
	if len(s.Stats) != len(expected) {
		t.Fatalf("expected %d stats, got %d", len(expected), len(s.Stats))
	}
	for i, f := range expected {
		if s.Stats[i].Field != f {
			t.Errorf("stat[%d].Field = %q, want %q", i, s.Stats[i].Field, f)
		}
		if s.Stats[i].Label == "" {
			t.Errorf("stat[%d] %q has empty label", i, f)
		}
		if s.Stats[i].Type == "" {
			t.Errorf("stat[%d] %q has empty type", i, f)
		}
	}
}
