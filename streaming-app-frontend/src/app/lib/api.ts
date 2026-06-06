import type { Sport, SportsListResponse, ScoreResponse } from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8081"

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

export function fetchScore(sportId: string): Promise<ScoreResponse> {
  return fetchJSON<ScoreResponse>(`${BASE_URL}/api/score?sport=${sportId}`)
}

export function resetGame(sportId: string): Promise<ScoreResponse> {
  return fetchJSON<ScoreResponse>(`${BASE_URL}/api/reset?sport=${sportId}`)
}
