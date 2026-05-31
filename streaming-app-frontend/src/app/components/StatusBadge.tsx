"use client"

interface StatusBadgeProps {
  status: string
  detail?: string | number
  detailLabel?: string
}

const statusColors: Record<string, string> = {
  Scheduled: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  "In Progress": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Halftime: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Final: "bg-blue-500/20 text-blue-400 border-blue-500/30",
}

export default function StatusBadge({ status, detail, detailLabel }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-white/5 text-slate-400 border-white/10"

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
        {status === "In Progress" && <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-2 align-middle" />}
        {status}
      </span>
      {detail !== undefined && detail !== null && (
        <span className="text-xs text-slate-500">
          {detailLabel && <span className="mr-1">{detailLabel}:</span>}
          {detail}
        </span>
      )}
    </div>
  )
}
