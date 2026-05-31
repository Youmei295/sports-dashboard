import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import EventTimeline from "../EventTimeline"
import type { MatchEvent } from "../../lib/types"

const events: MatchEvent[] = [
  { minute: 23, type: "goal", team: "home", description: "Barcelona scores!" },
  { minute: 45, type: "halftime", team: "none", description: "Half time" },
  { minute: 90, type: "fullTime", team: "none", description: "Full time!" },
]

describe("EventTimeline", () => {
  it("renders events with descriptions", () => {
    render(<EventTimeline events={events} />)
    expect(screen.getByText("Barcelona scores!")).toBeInTheDocument()
    expect(screen.getByText("Half time")).toBeInTheDocument()
    expect(screen.getByText("Full time!")).toBeInTheDocument()
  })

  it("renders minute labels", () => {
    render(<EventTimeline events={events} />)
    expect(screen.getByText("23'")).toBeInTheDocument()
    expect(screen.getByText("45'")).toBeInTheDocument()
    expect(screen.getByText("90'")).toBeInTheDocument()
  })

  it("renders header", () => {
    render(<EventTimeline events={events} />)
    expect(screen.getByText("Match Events")).toBeInTheDocument()
  })

  it("returns null for empty events", () => {
    const { container } = render(<EventTimeline events={[]} />)
    expect(container.innerHTML).toBe("")
  })

  it("returns null for undefined events", () => {
    const { container } = render(<EventTimeline events={undefined as unknown as []} />)
    expect(container.innerHTML).toBe("")
  })
})
