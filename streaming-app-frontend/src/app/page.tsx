'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8081/api/score');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        setData(result);
        setError('');
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-8 flex items-center justify-center relative overflow-hidden text-slate-100">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600 opacity-20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600 opacity-20 blur-[120px] pointer-events-none"></div>

      <div className="glass-panel w-full max-w-3xl p-8 z-10 transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_8px_40px_0_rgba(56,189,248,0.1)]">
        <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-5">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-4 font-['Outfit']">
            <span className="live-indicator"></span>
            Live Score Dashboard
          </h1>
          <div className="text-sm md:text-base text-slate-400 font-medium px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
            {loading && !data ? 'Connecting...' : 'Real-time Updates'}
          </div>
        </header>

        <div className="content relative min-h-[200px]">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-2xl mb-6 flex items-center gap-3 backdrop-blur-md">
              <span className="text-xl">⚠️</span>
              <div>
                <strong className="block font-semibold">Connection Error</strong>
                <span className="text-sm opacity-80">{error}. Is the Go backend running on port 8080?</span>
              </div>
            </div>
          )}

          {loading && !data && !error && (
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400"></div>
            </div>
          )}

          {data && (
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Optional Scoreboard Layout if common fields exist */}
              {(data.homeScore !== undefined || data.homeTeam !== undefined) && (
                 <div className="flex justify-between items-center bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-3xl p-8 border border-white/10 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-50"></div>
                    <div className="text-center w-1/3">
                      <h2 className="text-2xl font-semibold text-slate-300 font-['Outfit']">{data.homeTeam || 'Home Team'}</h2>
                      <div className="text-6xl font-bold text-white mt-4 tracking-tighter drop-shadow-lg">{data.homeScore ?? '-'}</div>
                    </div>
                    <div className="text-2xl font-black text-slate-500/50 italic px-6">VS</div>
                    <div className="text-center w-1/3">
                      <h2 className="text-2xl font-semibold text-slate-300 font-['Outfit']">{data.awayTeam || 'Away Team'}</h2>
                      <div className="text-6xl font-bold text-white mt-4 tracking-tighter drop-shadow-lg">{data.awayScore ?? '-'}</div>
                    </div>
                 </div>
              )}

              {/* Raw JSON Data Viewer */}
              <div className="bg-black/30 rounded-2xl p-1 border border-white/5 backdrop-blur-md">
                <div className="px-4 py-2 border-b border-white/5 text-xs text-slate-500 font-medium tracking-wider uppercase">
                  Raw API Payload
                </div>
                <div className="p-4 overflow-auto max-h-[300px] custom-scrollbar">
                  <pre className="text-sm text-sky-200/90 font-mono leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
