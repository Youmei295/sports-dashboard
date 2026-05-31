# Sports Dashboard API Contract

## Base URL

- Development: `http://localhost:8080` (or `http://localhost:8081` when run via docker-compose)
- Production: provided at deploy

---

## Available Endpoints

### 1. List Sports

Returns all available sports for the UI to display.

```
GET /api/sports
```

#### Response

```json
{
  "sports": [
    { "id": "basketball", "name": "Basketball" },
    { "id": "soccer", "name": "Soccer" }
  ]
}
```

---

### 2. Get Sport Stats Schema

Returns the available stat fields for a given sport. The frontend can use this to dynamically render stat cards, determine data types, and know what fields to display.

```
GET /api/sports/{sportId}
```

#### Parameters

| Name     | Type   | Description                  |
|----------|--------|------------------------------|
| sportId  | string | Sport ID from `/api/sports`  |

#### Response

```json
{
  "id": "basketball",
  "name": "Basketball",
  "stats": [
    { "field": "homeTeam",     "label": "Home Team",     "type": "string" },
    { "field": "awayTeam",     "label": "Away Team",     "type": "string" },
    { "field": "homeScore",    "label": "Home Score",    "type": "number" },
    { "field": "awayScore",    "label": "Away Score",    "type": "number" },
    { "field": "status",       "label": "Status",        "type": "string" },
    { "field": "quarter",      "label": "Quarter",       "type": "number" },
    { "field": "clock",        "label": "Clock",         "type": "string" },
    { "field": "possession",   "label": "Possession",    "type": "string" }
  ]
}
```

#### Type Mapping for Frontend

| Type     | Frontend rendering                  |
|----------|-------------------------------------|
| string   | Text label or badge                 |
| number   | Numeric score or counter            |
| object   | Nested key-value display            |
| array    | List/timeline of events             |

---

### 3. Get Live Score

Returns the current live score data for a sport. Poll this endpoint.

```
GET /api/score?sport={sportId}
```

#### Parameters

| Name   | Type   | Required | Default      | Description                         |
|--------|--------|----------|--------------|-------------------------------------|
| sport  | string | No       | `basketball` | Sport ID from `/api/sports`         |

#### Sport-Specific Response Shapes

**Basketball** (`sport=basketball` or omitted):

```json
{
  "homeTeam": "Lakers",
  "awayTeam": "Warriors",
  "homeScore": 87,
  "awayScore": 93,
  "status": "In Progress",
  "quarter": 3,
  "clock": "4:15",
  "possession": "Warriors"
}
```

**Soccer** (`sport=soccer`):

```json
{
  "homeTeam": "Barcelona",
  "awayTeam": "Real Madrid",
  "homeScore": 2,
  "awayScore": 1,
  "status": "In Progress",
  "half": 2,
  "clock": "67'",
  "possession": { "home": 57, "away": 43 },
  "shots": { "home": 12, "away": 8 },
  "shotsOnTarget": { "home": 5, "away": 3 },
  "corners": { "home": 6, "away": 4 },
  "fouls": { "home": 8, "away": 10 },
  "yellowCards": { "home": 1, "away": 2 },
  "redCards": { "home": 0, "away": 0 },
  "events": [
    { "minute": 23, "type": "goal", "team": "home", "description": "Barcelona scores!" },
    { "minute": 55, "type": "goal", "team": "away", "description": "Real Madrid equalizes!" },
    { "minute": 78, "type": "goal", "team": "home", "description": "Barcelona takes the lead!" },
    { "minute": 90, "type": "fullTime", "team": "none", "description": "Full time!" }
  ]
}
```

---

### 4. Get Game Config

Returns configuration values for a sport simulation.

```
GET /api/config?sport={sportId}
```

#### Parameters

Same as `/api/score`.

#### Example Response (Basketball)

```json
{
  "homeTeam": "Lakers",
  "awayTeam": "Warriors",
  "scoreInitHome": 0,
  "scoreInitAway": 0,
  "quarterSeconds": 720,
  "tickSecondsMin": 10,
  "tickSecondsMax": 60,
  "halftimeTicks": 3
}
```

#### Example Response (Soccer)

```json
{
  "homeTeam": "Barcelona",
  "awayTeam": "Real Madrid",
  "halfMinutes": 45,
  "halftimeTicks": 3,
  "homeAttack": 80,
  "homeDefense": 75,
  "awayAttack": 72,
  "awayDefense": 70,
  "homeAdvantage": 1.12
}
```

---

### 5. Reset Game

Resets the game state for a sport back to "Scheduled".

```
POST /api/reset?sport={sportId}
```

#### Parameters

Same as `/api/score`.

#### Response

```json
{
  "homeTeam": "Lakers",
  "awayTeam": "Warriors",
  "homeScore": 0,
  "awayScore": 0,
  "status": "Scheduled",
  "quarter": 0,
  "clock": "--:--",
  "possession": "Lakers"
}
```

---

## Game Status Lifecycle

All sports follow this lifecycle:

```
Scheduled → In Progress → (Halftime) → In Progress → Final
```

- **Basketball**: 4 quarters, each 720 game-seconds of clock time. Halftime occurs between Q2 and Q3, lasting 3 requests.
- **Soccer**: 2 halves, each 45 minutes (1 tick = 1 simulated minute). Halftime occurs between halves, lasting 3 requests.

---

## CORS

All endpoints return the following CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Error Responses

```json
{ "error": "failed to fetch score" }
```

```json
{ "error": "unknown sport" }
```

Status codes: `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`.
