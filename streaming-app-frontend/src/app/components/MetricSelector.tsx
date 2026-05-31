"use client"

import { useState, useRef, useEffect } from "react"
import type { StatField } from "../lib/types"
import { SCOREBOARD_FIELDS } from "../lib/types"

interface MetricSelectorProps {
  stats: StatField[]
  selected: Set<string>
  onChange: (fields: Set<string>) => void
}

const scoreboardFields = SCOREBOARD_FIELDS

export default function MetricSelector({ stats, selected, onChange }: MetricSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const visible = stats.filter((s) => !scoreboardFields.has(s.field))

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function toggle(field: string) {
    const next = new Set(selected)
    if (next.has(field)) {
      next.delete(field)
    } else {
      next.add(field)
    }
    onChange(next)
  }

  if (visible.length === 0) return null

  const count = selected.size

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-300 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Metrics{count < visible.length ? ` (${count})` : ""}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-lg border border-white/10 rounded-2xl p-3 shadow-2xl z-20 space-y-1">
          {visible.map((stat) => (
            <label
              key={stat.field}
              className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors text-sm"
            >
              <input
                type="checkbox"
                checked={selected.has(stat.field)}
                onChange={() => toggle(stat.field)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-sky-400"
              />
              <span className="text-slate-300">{stat.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
