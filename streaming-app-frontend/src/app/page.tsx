"use client"

import { useEffect, useState, useRef } from "react"
import type { Sport, MatchData, MatchEvent, ScoreResponse } from "./lib/types"
import { fetchSportStats, fetchScore } from "./lib/api"
import SportSelector from "./components/SportSelector"
import MetricSelector from "./components/MetricSelector"
import Scoreboard from "./components/Scoreboard"
import StatusBadge from "./components/StatusBadge"
import StatGrid from "./components/StatGrid"
import EventTimeline from "./components/EventTimeline"
import MatchWidget from "./components/MatchWidget"

const ALL_SPORTS = ["basketball", "soccer"]

export default function Home() {
  const [activeTab, setActiveTab] = useState<"live" | "dashboard">("live")
  const [sport, setSport] = useState("basketball")
  const [schema, setSchema] = useState<Sport | null>(null)
  
  const [matches, setMatches] = useState<MatchData[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string>("")
  
  // Dashboard state
  const [allMatchesCache, setAllMatchesCache] = useState<Record<string, MatchData>>({})
  const [dashboardMatchIds, setDashboardMatchIds] = useState<Set<string>>(new Set())

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set())

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
    
    const fetchAllData = async () => {
      try {
        const res = await fetchScore(sport)
        if (cancelled) return
        setMatches(res.matches)
        
        setAllMatchesCache(prev => {
          const next = { ...prev }
          res.matches.forEach(m => { next[m.id] = m })
          return next
        })
        
        // Fetch other sports to keep dashboard fresh
        const otherSports = ALL_SPORTS.filter(s => s !== sport)
        for (const s of otherSports) {
          try {
            const sRes = await fetchScore(s)
            if (!cancelled) {
              setAllMatchesCache(prev => {
                const next = { ...prev }
                sRes.matches.forEach(m => { next[m.id] = m })
                return next
              })
            }
          } catch (e) {
            // ignore if other sports fail, keep dashboard alive
          }
        }
        
        setError("")
      } catch (err: unknown) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const timer = setTimeout(fetchAllData, 0)
    const interval = setInterval(fetchAllData, 3000)
    return () => { cancelled = true; clearTimeout(timer); clearInterval(interval) }
  }, [sport])

  useEffect(() => {
    if (matches.length > 0) {
      if (!selectedMatchId || !matches.find(m => m.id === selectedMatchId)) {
        setSelectedMatchId(matches[0].id)
      }
    } else {
      setSelectedMatchId("")
    }
  }, [matches, selectedMatchId])

  const activeMatch = matches.find(m => m.id === selectedMatchId)

  const toggleDashboardMatch = (id: string) => {
    setDashboardMatchIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderLiveMatch = () => {
    if (error) {
      return (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <strong className="block font-semibold text-sm">Connection Error</strong>
            <span className="text-xs opacity-80">{error}</span>
          </div>
        </div>
      )
    }

    if (loading && !activeMatch && !error) {
      return (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400" />
        </div>
      )
    }

    if (!activeMatch) return null

    const homeTeam = (activeMatch.homeTeam as string) || ""
    const awayTeam = (activeMatch.awayTeam as string) || ""
    const homeScore = activeMatch.homeScore as number | undefined
    const awayScore = activeMatch.awayScore as number | undefined
    const status = (activeMatch.status as string) || ""
    const events = activeMatch.events as MatchEvent[] | undefined

    const quarterOrHalf =
      activeMatch.quarter !== undefined
        ? { label: "Quarter", value: activeMatch.quarter as number }
        : activeMatch.half !== undefined
          ? { label: "Half", value: activeMatch.half as number }
          : null

    const isTracked = dashboardMatchIds.has(activeMatch.id)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-300 font-medium">Select Match:</label>
            <select 
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
            >
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.homeTeam as string} vs {m.awayTeam as string}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => toggleDashboardMatch(activeMatch.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              isTracked 
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30 hover:bg-sky-500/30' 
                : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
            }`}
          >
            {isTracked ? '★ Tracked' : '☆ Track Match'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            status={status}
            detail={quarterOrHalf?.value}
            detailLabel={quarterOrHalf?.label}
          />
          <span className="text-xs text-slate-500 font-mono">{activeMatch.clock as string}</span>
        </div>

        {homeTeam && awayTeam && (
          <Scoreboard
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homeScore={homeScore ?? "-"}
            awayScore={awayScore ?? "-"}
          />
        )}

        {schema && <StatGrid stats={schema.stats} data={activeMatch} visibleFields={visibleMetrics} />}

        {events && events.length > 0 && <EventTimeline events={events} />}

        <details className="group">
          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 select-none">
            Raw API Payload
          </summary>
          <div className="mt-2 bg-black/30 rounded-2xl p-4 border border-white/5 backdrop-blur-md overflow-auto max-h-60 custom-scrollbar">
            <pre className="text-xs text-sky-200/80 font-mono leading-relaxed">
              {JSON.stringify(activeMatch, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    )
  }

  const renderDashboard = () => {
    const trackedMatches = Array.from(dashboardMatchIds).map(id => allMatchesCache[id]).filter(Boolean)

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Multi-Match Dashboard</h2>
          <span className="text-sm text-slate-400">{trackedMatches.length} Tracked</span>
        </div>

        {trackedMatches.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white/5 rounded-2xl border border-white/5">
            <p>No matches tracked yet.</p>
            <p className="text-sm mt-2">Go to the Live Match tab and track a match to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trackedMatches.map(m => (
              <MatchWidget 
                key={m.id} 
                match={m} 
                onRemove={toggleDashboardMatch}
                onSelect={(id) => {
                  // Switch to Live Match view for this match
                  // Try to guess the sport if it's in current matches, else switch might be clunky
                  if (matches.find(match => match.id === id)) {
                    setSelectedMatchId(id)
                    setActiveTab("live")
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8 flex items-center justify-center relative overflow-hidden text-slate-100">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600 opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600 opacity-20 blur-[120px] pointer-events-none" />

      <div className="glass-panel w-full max-w-4xl p-6 md:p-8 z-10 transition-all duration-500 hover:shadow-[0_8px_40px_0_rgba(56,189,248,0.1)]">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 border-b border-white/10 pb-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="live-indicator" />
                Sports Dashboard
              </h1>
              <div className="text-xs text-slate-500 font-medium px-3 py-1 bg-white/5 rounded-full border border-white/5">
                {loading && !activeMatch ? "Connecting..." : "Live"}
              </div>
            </div>
            
            <div className="flex bg-black/40 rounded-lg p-1 w-fit border border-white/5 mt-2">
              <button 
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'live' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                onClick={() => setActiveTab("live")}
              >
                Live Match
              </button>
              <button 
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard {dashboardMatchIds.size > 0 && <span className="ml-1 bg-sky-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{dashboardMatchIds.size}</span>}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <SportSelector selected={sport} onChange={setSport} />
            {schema && activeTab === 'live' && (
              <MetricSelector
                stats={schema.stats}
                selected={visibleMetrics}
                onChange={setVisibleMetrics}
              />
            )}
          </div>
        </header>

        {activeTab === 'live' ? renderLiveMatch() : renderDashboard()}
      </div>
    </main>
  )
}
