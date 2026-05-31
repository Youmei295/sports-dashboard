import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SportSelector from "../SportSelector"

beforeEach(() => {
  vi.restoreAllMocks()
})

function mockFetchSports() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        sports: [
          { id: "basketball", name: "Basketball" },
          { id: "soccer", name: "Soccer" },
        ],
      }),
  })
}

describe("SportSelector", () => {
  it("renders sport buttons after loading", async () => {
    mockFetchSports()
    render(<SportSelector selected="basketball" onChange={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText("Basketball")).toBeInTheDocument()
    })
    expect(screen.getByText("Soccer")).toBeInTheDocument()
  })

  it("calls onChange when a sport is clicked", async () => {
    mockFetchSports()
    const onChange = vi.fn()
    render(<SportSelector selected="basketball" onChange={onChange} />)

    await waitFor(() => screen.getByText("Soccer"))
    await userEvent.click(screen.getByText("Soccer"))

    expect(onChange).toHaveBeenCalledWith("soccer")
  })

  it("highlights the selected sport", async () => {
    mockFetchSports()
    render(<SportSelector selected="basketball" onChange={() => {}} />)

    await waitFor(() => {
      const btn = screen.getByText("Basketball")
      expect(btn.className).toContain("bg-sky-500/20")
    })
  })

  it("falls back to all known sports on fetch failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network error"))
    render(<SportSelector selected="soccer" onChange={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText("Basketball")).toBeInTheDocument()
    })
    expect(screen.getByText("Soccer")).toBeInTheDocument()
  })

  it("shows loading skeleton before fetch resolves", () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    const { container } = render(<SportSelector selected="basketball" onChange={() => {}} />)
    const skeletons = container.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
