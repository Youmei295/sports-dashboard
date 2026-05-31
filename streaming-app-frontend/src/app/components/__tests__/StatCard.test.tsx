import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import StatCard from "../StatCard"

describe("StatCard", () => {
  it("renders string type", () => {
    render(<StatCard label="Status" value="In Progress" type="string" />)
    expect(screen.getByText("Status")).toBeInTheDocument()
    expect(screen.getByText("In Progress")).toBeInTheDocument()
  })

  it("renders number type", () => {
    render(<StatCard label="Quarter" value={3} type="number" />)
    expect(screen.getByText("Quarter")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("renders object type as formatted string", () => {
    render(<StatCard label="Shots" value={{ home: 12, away: 8 }} type="object" />)
    expect(screen.getByText("Shots")).toBeInTheDocument()
    expect(screen.getByText(/Home: 12/)).toBeInTheDocument()
    expect(screen.getByText(/Away: 8/)).toBeInTheDocument()
  })

  it("renders array type as count", () => {
    render(<StatCard label="Events" value={[{ minute: 10 }, { minute: 20 }]} type="array" />)
    expect(screen.getByText("Events")).toBeInTheDocument()
    expect(screen.getByText("2 events")).toBeInTheDocument()
  })

  it("returns null for undefined value", () => {
    const { container } = render(<StatCard label="Empty" value={undefined} type="string" />)
    expect(container.innerHTML).toBe("")
  })

  it("returns null for null value", () => {
    const { container } = render(<StatCard label="Empty" value={null} type="string" />)
    expect(container.innerHTML).toBe("")
  })

  it("returns null for empty array", () => {
    const { container } = render(<StatCard label="Empty" value={[]} type="array" />)
    expect(container.innerHTML).toBe("")
  })
})
