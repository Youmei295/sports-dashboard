import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import MetricSelector from "../MetricSelector"
import type { StatField } from "../../lib/types"

const stats: StatField[] = [
  { field: "possession", label: "Possession", type: "string" },
  { field: "fouls", label: "Fouls", type: "number" },
]

describe("MetricSelector", () => {
  it("renders Metrics button", () => {
    render(
      <MetricSelector stats={stats} selected={new Set(["possession"])} onChange={() => {}} />
    )
    expect(screen.getByText(/Metrics/)).toBeInTheDocument()
  })

  it("shows dropdown on click", () => {
    render(
      <MetricSelector stats={stats} selected={new Set(["possession"])} onChange={() => {}} />
    )
    fireEvent.click(screen.getByText(/Metrics/))
    expect(screen.getByLabelText("Possession")).toBeInTheDocument()
    expect(screen.getByLabelText("Fouls")).toBeInTheDocument()
  })

  it("renders checkboxes with correct checked state", () => {
    render(
      <MetricSelector stats={stats} selected={new Set(["possession"])} onChange={() => {}} />
    )
    fireEvent.click(screen.getByText(/Metrics/))
    const possessionCb = screen.getByLabelText("Possession") as HTMLInputElement
    const foulsCb = screen.getByLabelText("Fouls") as HTMLInputElement
    expect(possessionCb.checked).toBe(true)
    expect(foulsCb.checked).toBe(false)
  })

  it("calls onChange when toggling", () => {
    const onChange = vi.fn()
    render(
      <MetricSelector stats={stats} selected={new Set(["fouls"])} onChange={onChange} />
    )
    fireEvent.click(screen.getByText(/Metrics/))
    fireEvent.click(screen.getByLabelText("Possession"))
    expect(onChange).toHaveBeenCalled()
    const nextSet = onChange.mock.calls[0][0] as Set<string>
    expect(nextSet.has("possession")).toBe(true)
    expect(nextSet.has("fouls")).toBe(true)
  })

  it("excludes scoreboard fields and events", () => {
    const fullStats: StatField[] = [
      ...stats,
      { field: "homeTeam", label: "Home Team", type: "string" },
      { field: "events", label: "Events", type: "array" },
      { field: "quarter", label: "Quarter", type: "number" },
    ]
    render(
      <MetricSelector stats={fullStats} selected={new Set(["possession"])} onChange={() => {}} />
    )
    fireEvent.click(screen.getByText(/Metrics/))
    expect(screen.queryByLabelText("Home Team")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Events")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Quarter")).not.toBeInTheDocument()
  })

  it("returns null when no visible stats", () => {
    const { container } = render(
      <MetricSelector
        stats={[{ field: "homeTeam", label: "Home Team", type: "string" }]}
        selected={new Set()}
        onChange={() => {}}
      />
    )
    expect(container.innerHTML).toBe("")
  })

  it("shows count when metrics are filtered", () => {
    render(
      <MetricSelector
        stats={stats}
        selected={new Set(["possession"])}
        onChange={() => {}}
      />
    )
    expect(screen.getByText("Metrics (1)")).toBeInTheDocument()
  })
})
