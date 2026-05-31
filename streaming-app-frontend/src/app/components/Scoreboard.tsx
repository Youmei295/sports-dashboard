"use client"

interface ScoreboardProps {
  homeTeam: string
  awayTeam: string
  homeScore: number | string
  awayScore: number | string
}

export default function Scoreboard({ homeTeam, awayTeam, homeScore, awayScore }: ScoreboardProps) {
  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-3xl p-8 border border-white/10 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-50" />
      <div className="text-center w-1/3">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-300">
          {homeTeam}
        </h2>
        <div className="text-5xl md:text-6xl font-bold text-white mt-4 tracking-tighter drop-shadow-lg">
          {homeScore ?? "-"}
        </div>
      </div>
      <div className="text-xl md:text-2xl font-black text-slate-500/50 italic px-4 md:px-6">
        VS
      </div>
      <div className="text-center w-1/3">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-300">
          {awayTeam}
        </h2>
        <div className="text-5xl md:text-6xl font-bold text-white mt-4 tracking-tighter drop-shadow-lg">
          {awayScore ?? "-"}
        </div>
      </div>
    </div>
  )
}
