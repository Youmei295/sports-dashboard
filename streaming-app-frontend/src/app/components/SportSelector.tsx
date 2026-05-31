"use client"

import { useState, useEffect } from "react"
import { fetchSports } from "../lib/api"

interface SportOption {
  id: string
  name: string
}

interface SportSelectorProps {
  selected: string
  onChange: (sportId: string) => void
}

export default function SportSelector({ selected, onChange }: SportSelectorProps) {
  const [sports, setSports] = useState<SportOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSports()
      .then((data) => setSports(data.sports))
      .catch(() => setSports([
        { id: "basketball", name: "Basketball" },
        { id: "soccer", name: "Soccer" },
      ]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
    )
  }

  return (
    <div className="flex gap-2">
      {sports.map((sport) => (
        <button
          key={sport.id}
          onClick={() => onChange(sport.id)}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            selected === sport.id
              ? "bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
              : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-300"
          }`}
        >
          {sport.name}
        </button>
      ))}
    </div>
  )
}
