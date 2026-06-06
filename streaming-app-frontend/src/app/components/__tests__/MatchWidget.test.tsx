import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import MatchWidget from "../MatchWidget"
import type { ScoreData } from "../../lib/types"

const mockMatch: ScoreData = {
  id: "bb_1",
  homeTeam: "Lakers",
  awayTeam: "Warriors",
  homeScore: 105,
  awayScore: 98,
  status: "In Progress",
  quarter: 4,
  clock: "2:30",
}

describe("MatchWidget", () => {
  it("renders teams and scores correctly", () => {
    render(<MatchWidget match={mockMatch} />)
    expect(screen.getByText("Lakers")).toBeInTheDocument()
    expect(screen.getByText("Warriors")).toBeInTheDocument()
    expect(screen.getByText("105")).toBeInTheDocument()
    expect(screen.getByText("98")).toBeInTheDocument()
  })

  it("renders status and clock correctly", () => {
    render(<MatchWidget match={mockMatch} />)
    expect(screen.getByText("In Progress")).toBeInTheDocument()
    expect(screen.getByText("Quarter:")).toBeInTheDocument()
    expect(screen.getByText("4")).toBeInTheDocument()
    expect(screen.getByText("2:30")).toBeInTheDocument()
  })

  it("calls onSelect when clicked", () => {
    const handleSelect = vi.fn()
    render(<MatchWidget match={mockMatch} onSelect={handleSelect} />)
    
    fireEvent.click(screen.getByTestId("match-widget-bb_1"))
    expect(handleSelect).toHaveBeenCalledWith("bb_1")
  })

  it("calls onRemove when remove button is clicked and stops propagation", () => {
    const handleSelect = vi.fn()
    const handleRemove = vi.fn()
    render(<MatchWidget match={mockMatch} onSelect={handleSelect} onRemove={handleRemove} />)
    
    fireEvent.click(screen.getByTestId("remove-match"))
    expect(handleRemove).toHaveBeenCalledWith("bb_1")
    expect(handleSelect).not.toHaveBeenCalled()
  })
})
