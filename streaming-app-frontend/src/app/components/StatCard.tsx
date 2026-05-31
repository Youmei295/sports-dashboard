"use client"

interface StatCardProps {
  label: string
  value: unknown
  type: "string" | "number" | "object" | "array"
}

function formatNestedObj(value: Record<string, unknown>): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(value)) {
    const key = k.charAt(0).toUpperCase() + k.slice(1)
    parts.push(`${key}: ${v}`)
  }
  return parts.join("  ·  ")
}

export default function StatCard({ label, value, type }: StatCardProps) {
  if (value === undefined || value === null) return null
  if (type === "array" && Array.isArray(value) && value.length === 0) return null

  let display: string | null = null
  let isObject = false

  if (type === "object" && typeof value === "object" && !Array.isArray(value)) {
    display = formatNestedObj(value as Record<string, unknown>)
    isObject = true
  } else if (type === "array" && Array.isArray(value)) {
    display = `${value.length} events`
  } else {
    display = String(value)
  }

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
      <div className="text-xs text-slate-500 font-medium tracking-wider uppercase mb-2">
        {label}
      </div>
      <div className={`${isObject ? "text-sm" : "text-lg"} font-semibold text-slate-200 ${isObject ? "leading-relaxed" : ""}`}>
        {display}
      </div>
    </div>
  )
}
