import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import Home from "../page"

beforeEach(() => {
  vi.restoreAllMocks()
})

const scoreData = {
  homeTeam: "Lakers",
  awayTeam: "Warriors",
  homeScore: 87,
  awayScore: 93,
  status: "In Progress",
  quarter: 3,
  events: [
    { minute: 12, type: "score", team: "home", description: "Lakers score!" },
  ],
}

const sportSchema = {
  id: "basketball",
  name: "Basketball",
  stats: [
    { field: "quarter", label: "Quarter", type: "number" },
  ],
}

const basketballData = {
  homeTeam: "Lakers",
  awayTeam: "Warriors",
  homeScore: 87,
  awayScore: 93,
  status: "In Progress",
  quarter: 3,
  clock: "5:42",
  possession: "Lakers",
  rebounds: { home: 42, away: 38 },
  assists: { home: 24, away: 21 },
  fouls: { home: 12, away: 14 },
  timeouts: { home: 5, away: 4 },
  events: [
    { minute: 5, type: "score", team: "home", description: "LeBron drives for 2!" },
  ],
}

const basketballSchema = {
  id: "basketball",
  name: "Basketball",
  stats: [
    { field: "rebounds", label: "Rebounds", type: "object" },
    { field: "assists", label: "Assists", type: "object" },
    { field: "fouls", label: "Fouls", type: "object" },
    { field: "timeouts", label: "Timeouts", type: "object" },
    { field: "events", label: "Game Events", type: "array" },
  ],
}

function setupBasketballMocks() {
  global.fetch = vi.fn((url: string) => {
    if (url.includes("/api/sports/")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(basketballSchema) })
    }
    if (url.includes("/api/score")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(basketballData) })
    }
    return Promise.reject(new Error("unknown url"))
  })
}

function setupMocks() {
  global.fetch = vi.fn((url: string) => {
    if (url.includes("/api/sports/")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(sportSchema) })
    }
    if (url.includes("/api/score")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(scoreData) })
    }
    return Promise.reject(new Error("unknown url"))
  })
}

describe("Home page", () => {
  it("renders loading spinner on mount", () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    render(<Home />)
    const spinner = document.querySelector(".animate-spin")
    expect(spinner).toBeInTheDocument()
  })

  it("renders score data on success", async () => {
    setupMocks()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText("Lakers")).toBeInTheDocument()
    })
    expect(screen.getByText("Warriors")).toBeInTheDocument()
    expect(screen.getByText("87")).toBeInTheDocument()
    expect(screen.getByText("93")).toBeInTheDocument()
  })

  it("renders error UI on fetch failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"))
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText("Connection Error")).toBeInTheDocument()
    })
  })

  it("renders StatusBadge with quarter info", async () => {
    setupMocks()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText("In Progress")).toBeInTheDocument()
    })
  })

  it("renders EventTimeline when events present", async () => {
    setupMocks()
    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText("Lakers score!")).toBeInTheDocument()
    })
  })

  it("renders raw JSON payload", async () => {
    setupMocks()
    render(<Home />)

    await waitFor(() => {
      const pre = document.querySelector("pre")
      expect(pre).toBeInTheDocument()
      expect(pre!.textContent).toContain("Lakers")
    })
  })

  it("renders basketball rebound stats", async () => {
    setupBasketballMocks()
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText("Rebounds")).toBeInTheDocument()
    })
  })

  it("renders basketball event timeline", async () => {
    setupBasketballMocks()
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText("LeBron drives for 2!")).toBeInTheDocument()
    })
  })

  it("renders timeout counts correctly", async () => {
    setupBasketballMocks()
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByText("Timeouts")).toBeInTheDocument()
    })
  })
})
