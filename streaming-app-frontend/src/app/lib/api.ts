import type { Sport, SportsListResponse, ScoreData } from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export function fetchSports(): Promise<SportsListResponse> {
  return fetchJSON<SportsListResponse>(`${BASE_URL}/api/sports`)
}

export function fetchSportStats(sportId: string): Promise<Sport> {
  return fetchJSON<Sport>(`${BASE_URL}/api/sports/${sportId}`)
}

export function fetchScore(sportId: string): Promise<ScoreData> {
  return fetchJSON<ScoreData>(`${BASE_URL}/api/score?sport=${sportId}`)
}

export function resetGame(sportId: string): Promise<ScoreData> {
  return fetchJSON<ScoreData>(`${BASE_URL}/api/reset?sport=${sportId}`)
}
