export interface StatField {
  field: string
  label: string
  type: "string" | "number" | "object" | "array"
}

export interface Sport {
  id: string
  name: string
  stats: StatField[]
}

export interface SportsListResponse {
  sports: { id: string; name: string }[]
}

export interface MatchEvent {
  minute: number
  type: string
  team: string
  description: string
}

export interface BasketballScore {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
  quarter: number
  clock: string
  possession: string
}

export interface SoccerScore {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
  half: number
  clock: string
  possession: { home: number; away: number }
  shots: { home: number; away: number }
  shotsOnTarget: { home: number; away: number }
  corners: { home: number; away: number }
  fouls: { home: number; away: number }
  yellowCards: { home: number; away: number }
  redCards: { home: number; away: number }
  events: MatchEvent[]
}

export type ScoreData = Record<string, unknown>

/** Fields rendered separately by Scoreboard / StatusBadge / EventTimeline */
export const SCOREBOARD_FIELDS = new Set([
  "homeTeam", "awayTeam", "homeScore", "awayScore",
  "status", "clock", "quarter", "half", "events",
])
