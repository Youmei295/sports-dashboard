import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import StatGrid from "../StatGrid"
import type { StatField } from "../../lib/types"

const basketballStats: StatField[] = [
  { field: "homeTeam", label: "Home Team", type: "string" },
  { field: "awayTeam", label: "Away Team", type: "string" },
  { field: "homeScore", label: "Home Score", type: "number" },
  { field: "awayScore", label: "Away Score", type: "number" },
  { field: "fouls", label: "Fouls", type: "number" },
  { field: "possession", label: "Possession", type: "string" },
]

const mockData = {
  homeTeam: "Lakers",
  awayTeam: "Warriors",
  homeScore: 87,
  awayScore: 93,
  fouls: 5,
  possession: "Lakers",
}

describe("StatGrid", () => {
  it("renders stat cards for non-scoreboard fields", () => {
    render(<StatGrid stats={basketballStats} data={mockData} />)
    expect(screen.getByText("Fouls")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("Possession")).toBeInTheDocument()
    expect(screen.getByText("Lakers")).toBeInTheDocument()
  })

  it("excludes scoreboard fields and events", () => {
    render(<StatGrid stats={basketballStats} data={mockData} />)
    expect(screen.queryByText("Home Team")).not.toBeInTheDocument()
    expect(screen.queryByText("Home Score")).not.toBeInTheDocument()
  })

  it("returns nothing when no visible stats", () => {
    const { container } = render(
      <StatGrid
        stats={[{ field: "homeTeam", label: "Home Team", type: "string" }]}
        data={{ homeTeam: "Lakers" }}
      />
    )
    expect(container.innerHTML).toBe("")
  })
})
