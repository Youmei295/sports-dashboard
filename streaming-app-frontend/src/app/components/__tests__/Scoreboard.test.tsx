import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Scoreboard from "../Scoreboard"

describe("Scoreboard", () => {
  it("renders team names and scores", () => {
    render(<Scoreboard homeTeam="Lakers" awayTeam="Warriors" homeScore={87} awayScore={93} />)
    expect(screen.getByText("Lakers")).toBeInTheDocument()
    expect(screen.getByText("Warriors")).toBeInTheDocument()
    expect(screen.getByText("87")).toBeInTheDocument()
    expect(screen.getByText("93")).toBeInTheDocument()
  })

  it("renders VS divider", () => {
    render(<Scoreboard homeTeam="A" awayTeam="B" homeScore={0} awayScore={0} />)
    expect(screen.getByText("VS")).toBeInTheDocument()
  })

  it("renders dash for missing scores", () => {
    render(<Scoreboard homeTeam="A" awayTeam="B" homeScore="-" awayScore="-" />)
    expect(screen.getAllByText("-")).toHaveLength(2)
  })
})
