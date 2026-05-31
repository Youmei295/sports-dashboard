"use client"

import { useEffect, useState, useRef } from "react"
import type { Sport, ScoreData, MatchEvent } from "./lib/types"
import { fetchSportStats, fetchScore } from "./lib/api"
import SportSelector from "./components/SportSelector"
import MetricSelector from "./components/MetricSelector"
import Scoreboard from "./components/Scoreboard"
import StatusBadge from "./components/StatusBadge"
import StatGrid from "./components/StatGrid"
import EventTimeline from "./components/EventTimeline"

export default function Home() {
  const [sport, setSport] = useState("basketball")
  const [schema, setSchema] = useState<Sport | null>(null)
  const [data, setData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set())
  const currentSport = useRef(sport)

  useEffect(() => {
    currentSport.current = sport
  }, [sport])

  useEffect(() => {
    let cancelled = false
    fetchSportStats(sport)
      .then((s) => {
        if (cancelled) return
        setSchema(s)
        setVisibleMetrics(new Set(s.stats.map((sf) => sf.field)))
      })
      .catch(() => {
        if (cancelled) return
        setSchema(null)
        setVisibleMetrics(new Set())
      })
    return () => { cancelled = true }
  }, [sport])

  useEffect(() => {
    let cancelled = false
    const fetchOnce = async () => {
      try {
        const result = await fetchScore(sport)
        if (cancelled) return
        setData(result)
        setError("")
      } catch (err: unknown) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const timer = setTimeout(fetchOnce, 0)
    const interval = setInterval(async () => {
      try {
        const result = await fetchScore(sport)
        if (cancelled) return
        setData(result)
        setError("")
      } catch (err: unknown) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      }
    }, 3000)
    return () => { cancelled = true; clearTimeout(timer); clearInterval(interval) }
  }, [sport])

  const homeTeam = (data?.homeTeam as string) || ""
  const awayTeam = (data?.awayTeam as string) || ""
  const homeScore = data?.homeScore as number | undefined
  const awayScore = data?.awayScore as number | undefined
  const status = (data?.status as string) || ""
  const events = data?.events as MatchEvent[] | undefined

  const quarterOrHalf =
    data?.quarter !== undefined
      ? { label: "Quarter", value: data.quarter as number }
      : data?.half !== undefined
        ? { label: "Half", value: data.half as number }
        : null

  return (
    <main className="min-h-screen p-4 md:p-8 flex items-center justify-center relative overflow-hidden text-slate-100">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600 opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600 opacity-20 blur-[120px] pointer-events-none" />

      <div className="glass-panel w-full max-w-4xl p-6 md:p-8 z-10 transition-all duration-500 hover:shadow-[0_8px_40px_0_rgba(56,189,248,0.1)]">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="live-indicator" />
              Sports Dashboard
            </h1>
            <div className="text-xs text-slate-500 font-medium px-3 py-1 bg-white/5 rounded-full border border-white/5">
              {loading && !data ? "Connecting..." : "Live"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SportSelector selected={sport} onChange={setSport} />
            {schema && (
              <MetricSelector
                stats={schema.stats}
                selected={visibleMetrics}
                onChange={setVisibleMetrics}
              />
            )}
          </div>
        </header>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <strong className="block font-semibold text-sm">Connection Error</strong>
                <span className="text-xs opacity-80">{error}</span>
              </div>
            </div>
          )}

          {loading && !data && !error && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400" />
            </div>
          )}

          {data && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  status={status}
                  detail={quarterOrHalf?.value}
                  detailLabel={quarterOrHalf?.label}
                />
                <span className="text-xs text-slate-500 font-mono">{data.clock as string}</span>
              </div>

              {homeTeam && awayTeam && (
                <Scoreboard
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  homeScore={homeScore ?? "-"}
                  awayScore={awayScore ?? "-"}
                />
              )}

              {schema && <StatGrid stats={schema.stats} data={data} visibleFields={visibleMetrics} />}

              {events && events.length > 0 && <EventTimeline events={events} />}

              <details className="group">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 select-none">
                  Raw API Payload
                </summary>
                <div className="mt-2 bg-black/30 rounded-2xl p-4 border border-white/5 backdrop-blur-md overflow-auto max-h-60 custom-scrollbar">
                  <pre className="text-xs text-sky-200/80 font-mono leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </details>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
