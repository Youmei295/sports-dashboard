"use client"

import type { MatchEvent } from "../lib/types"

interface EventTimelineProps {
  events: MatchEvent[]
}

const iconForType: Record<string, string> = {
  goal: "⚽",
  yellowCard: "🟨",
  redCard: "🟥",
  halftime: "⏸️",
  fullTime: "🏁",
}

export default function EventTimeline({ events }: EventTimelineProps) {
  if (!events || events.length === 0) return null

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-2 border-b border-white/5 text-xs text-slate-500 font-medium tracking-wider uppercase">
        Match Events
      </div>
      <div className="divide-y divide-white/5 max-h-64 overflow-y-auto custom-scrollbar">
        {events.map((event, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
              event.type === "goal" ? "bg-white/[0.03]" : ""
            }`}
          >
            <span className="text-xs font-mono text-slate-500 w-10 shrink-0">
              {typeof event.minute === "number" ? `${event.minute}'` : ""}
            </span>
            <span className="text-base shrink-0">
              {iconForType[event.type] || "•"}
            </span>
            <span className="text-slate-300">{event.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
