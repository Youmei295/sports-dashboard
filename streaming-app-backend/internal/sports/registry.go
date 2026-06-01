package sports

type StatField struct {
	Field string `json:"field"`
	Label string `json:"label"`
	Type  string `json:"type"`
}

type Sport struct {
	ID    string     `json:"id"`
	Name  string     `json:"name"`
	Stats []StatField `json:"stats"`
}

var Registry = []Sport{
	{
		ID: "basketball", Name: "Basketball",
		Stats: []StatField{
			{Field: "homeTeam", Label: "Home Team", Type: "string"},
			{Field: "awayTeam", Label: "Away Team", Type: "string"},
			{Field: "homeScore", Label: "Home Score", Type: "number"},
			{Field: "awayScore", Label: "Away Score", Type: "number"},
			{Field: "status", Label: "Status", Type: "string"},
			{Field: "quarter", Label: "Quarter", Type: "number"},
			{Field: "clock", Label: "Clock", Type: "string"},
			{Field: "possession", Label: "Possession", Type: "string"},
			{Field: "rebounds", Label: "Rebounds", Type: "object"},
			{Field: "assists", Label: "Assists", Type: "object"},
			{Field: "fouls", Label: "Fouls", Type: "object"},
			{Field: "timeouts", Label: "Timeouts", Type: "object"},
			{Field: "events", Label: "Game Events", Type: "array"},
		},
	},
	{
		ID: "soccer", Name: "Soccer",
		Stats: []StatField{
			{Field: "homeTeam", Label: "Home Team", Type: "string"},
			{Field: "awayTeam", Label: "Away Team", Type: "string"},
			{Field: "homeScore", Label: "Home Score", Type: "number"},
			{Field: "awayScore", Label: "Away Score", Type: "number"},
			{Field: "status", Label: "Status", Type: "string"},
			{Field: "half", Label: "Half", Type: "number"},
			{Field: "clock", Label: "Clock", Type: "string"},
			{Field: "possession", Label: "Possession %", Type: "object"},
			{Field: "shots", Label: "Shots", Type: "object"},
			{Field: "shotsOnTarget", Label: "Shots on Target", Type: "object"},
			{Field: "corners", Label: "Corners", Type: "object"},
			{Field: "fouls", Label: "Fouls", Type: "object"},
			{Field: "yellowCards", Label: "Yellow Cards", Type: "object"},
			{Field: "redCards", Label: "Red Cards", Type: "object"},
			{Field: "events", Label: "Match Events", Type: "array"},
		},
	},
}

func FindByID(id string) *Sport {
	for i := range Registry {
		if Registry[i].ID == id {
			return &Registry[i]
		}
	}
	return nil
}
