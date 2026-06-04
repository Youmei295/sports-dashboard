import { describe, it, expect, beforeEach } from "vitest"
import { fetchSports, fetchSportStats, fetchScore, resetGame } from "../api"

const BASE = "http://127.0.0.1:8081"

beforeEach(() => {
  vi.restoreAllMocks()
})

function mockFetch(responseBody: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(responseBody),
  })
}

describe("fetchSports", () => {
  it("returns sports list", async () => {
    mockFetch({ sports: [{ id: "basketball", name: "Basketball" }] })
    const data = await fetchSports()
    expect(data.sports).toHaveLength(1)
    expect(data.sports[0].id).toBe("basketball")
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/sports`)
  })

  it("throws on HTTP error", async () => {
    mockFetch({ error: "not found" }, 404)
    await expect(fetchSports()).rejects.toThrow("HTTP 404")
  })
})

describe("fetchSportStats", () => {
  it("returns sport schema", async () => {
    mockFetch({ id: "basketball", name: "Basketball", stats: [] })
    const data = await fetchSportStats("basketball")
    expect(data.id).toBe("basketball")
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/sports/basketball`)
  })
})

describe("fetchScore", () => {
  it("returns score data for given sport", async () => {
    mockFetch({ homeScore: 10, awayScore: 5 })
    const data = await fetchScore("soccer")
    expect(data.homeScore).toBe(10)
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/score?sport=soccer`)
  })

  it("throws on HTTP error", async () => {
    mockFetch({ error: "server error" }, 500)
    await expect(fetchScore("basketball")).rejects.toThrow("HTTP 500")
  })
})

describe("resetGame", () => {
  it("posts reset and returns new state", async () => {
    mockFetch({ status: "Scheduled", homeScore: 0, awayScore: 0 })
    const data = await resetGame("basketball")
    expect(data.status).toBe("Scheduled")
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/reset?sport=basketball`)
  })
})
