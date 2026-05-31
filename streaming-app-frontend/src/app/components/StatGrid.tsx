"use client"

import type { StatField, ScoreData } from "../lib/types"
import { SCOREBOARD_FIELDS } from "../lib/types"
import StatCard from "./StatCard"

const scoreboardFields = SCOREBOARD_FIELDS

interface StatGridProps {
  stats: StatField[]
  data: ScoreData
  visibleFields?: Set<string>
}

export default function StatGrid({ stats, data, visibleFields }: StatGridProps) {
  const visible = stats.filter(
    (s) =>
      !scoreboardFields.has(s.field) &&
      data[s.field] !== undefined &&
      (!visibleFields || visibleFields.has(s.field))
  )

  if (visible.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {visible.map((stat) => (
        <StatCard
          key={stat.field}
          label={stat.label}
          value={data[stat.field]}
          type={stat.type}
        />
      ))}
    </div>
  )
}
