import React from "react"
import type { ScoreData } from "../lib/types"
import StatusBadge from "./StatusBadge"
import Scoreboard from "./Scoreboard"

interface MatchWidgetProps {
  match: ScoreData
  onSelect?: (id: string) => void
  onRemove?: (id: string) => void
}

export default function MatchWidget({ match, onSelect, onRemove }: MatchWidgetProps) {
  const homeTeam = (match.homeTeam as string) || ""
  const awayTeam = (match.awayTeam as string) || ""
  const homeScore = match.homeScore as number | undefined
  const awayScore = match.awayScore as number | undefined
  const status = (match.status as string) || ""

  const quarterOrHalf =
    match.quarter !== undefined
      ? { label: "Quarter", value: match.quarter as number }
      : match.half !== undefined
        ? { label: "Half", value: match.half as number }
        : null

  return (
    <div
      className={`relative glass-panel p-4 rounded-xl flex flex-col gap-3 transition-all ${
        onSelect ? "cursor-pointer hover:bg-white/10" : ""
      }`}
      onClick={() => onSelect && onSelect(match.id)}
      data-testid={`match-widget-${match.id}`}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <StatusBadge
            status={status}
            detail={quarterOrHalf?.value}
            detailLabel={quarterOrHalf?.label}
          />
          <span className="text-[10px] text-slate-500 font-mono">
            {match.clock as string}
          </span>
        </div>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(match.id)
            }}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            title="Remove from Dashboard"
            data-testid="remove-match"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      <div className="scale-[0.8] origin-left">
        <Scoreboard
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          homeScore={homeScore ?? "-"}
          awayScore={awayScore ?? "-"}
        />
      </div>
    </div>
  )
}
