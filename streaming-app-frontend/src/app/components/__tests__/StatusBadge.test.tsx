import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import StatusBadge from "../StatusBadge"

describe("StatusBadge", () => {
  it("renders status text", () => {
    render(<StatusBadge status="In Progress" />)
    expect(screen.getByText("In Progress")).toBeInTheDocument()
  })

  it("renders detail label and value", () => {
    render(<StatusBadge status="In Progress" detail={3} detailLabel="Quarter" />)
    expect(screen.getByText("Quarter:")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("renders without detail", () => {
    render(<StatusBadge status="Scheduled" />)
    expect(screen.getByText("Scheduled")).toBeInTheDocument()
  })

  it("renders Final status", () => {
    render(<StatusBadge status="Final" detail={4} detailLabel="Quarter" />)
    expect(screen.getByText("Final")).toBeInTheDocument()
    expect(screen.getByText("4")).toBeInTheDocument()
  })
})
