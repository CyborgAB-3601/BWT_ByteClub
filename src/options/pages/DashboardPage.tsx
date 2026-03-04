import GlassCard from "../components/GlassCard";
import { STORAGE_KEYS, type DailyStats, type TimerState, type WebsiteActivity } from "../../shared/storage";
import { useChromeStorageValue } from "../hooks/useChromeStorage";
import { formatHhMmSs } from "../../shared/time";
import { getIntensityBucket, getMultiplier } from "../../shared/carbon";

const kgToG = (kg: number) => kg * 1000;

export default function DashboardPage() {
  const { value: timerState } = useChromeStorageValue<TimerState>(STORAGE_KEYS.timerState, {
    startTime: null,
    isRunning: false,
    carbonTotalKg: 0
  });
  const { value: dailyStats } = useChromeStorageValue<DailyStats>(STORAGE_KEYS.dailyStats, {
    date: "",
    totalCarbonKg: 0,
    totalTimeSec: 0
  });
  const { value: websiteActivity } = useChromeStorageValue<WebsiteActivity>(STORAGE_KEYS.websiteActivity, {});

  const sessionSeconds =
    timerState.isRunning && timerState.startTime ? Math.floor((Date.now() - timerState.startTime) / 1000) : 0;

  const tableRows = Object.entries(websiteActivity)
    .map(([domain, entry]) => ({ domain, ...entry }))
    .sort((a, b) => b.carbonKg - a.carbonKg)
    .slice(0, 12);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-300">Home</div>
        <div className="mt-1 text-2xl font-semibold">Dashboard</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <div className="text-xs uppercase tracking-wider text-slate-400">Total Carbon Today</div>
          <div className="mt-2 text-3xl font-semibold text-eco-mint">{(dailyStats.totalCarbonKg ?? 0).toFixed(6)} kg</div>
          <div className="mt-1 text-xs text-slate-400">{kgToG(dailyStats.totalCarbonKg ?? 0).toFixed(3)} g</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs uppercase tracking-wider text-slate-400">Session Time</div>
          <div className="mt-2 text-3xl font-semibold">{formatHhMmSs(sessionSeconds)}</div>
          <div className="mt-1 text-xs text-slate-400">{timerState.isRunning ? "Running" : "Stopped"}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs uppercase tracking-wider text-slate-400">Eco Score</div>
          <div className="mt-2 text-3xl font-semibold text-eco-teal">
            {Math.max(0, 100 - kgToG(dailyStats.totalCarbonKg ?? 0) * 1.5).toFixed(0)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Higher is better</div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Top Website Activity</div>
            <div className="mt-1 text-xs text-slate-400">Sorted by estimated carbon</div>
          </div>
          <div className="text-xs text-slate-400">{dailyStats.date || "—"}</div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Time Spent</th>
                <th className="px-4 py-3">Est. Carbon</th>
                <th className="px-4 py-3">Intensity</th>
                <th className="px-4 py-3">Last Visited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {tableRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-400" colSpan={5}>
                    No data yet. Start a session and browse.
                  </td>
                </tr>
              ) : (
                tableRows.map((row) => (
                  <tr key={row.domain} className="bg-black/10">
                    <td className="px-4 py-3 font-medium text-slate-100">{row.domain}</td>
                    <td className="px-4 py-3 text-slate-200">{formatHhMmSs(row.timeSpentSec)}</td>
                    <td className="px-4 py-3 text-eco-mint">{(row.carbonKg ?? 0).toFixed(6)} kg</td>
                    <td className="px-4 py-3 text-slate-200">
                      {`x${getMultiplier(row.domain).toFixed(1)}`}{" "}
                      <span className="text-slate-400">({getIntensityBucket(row.domain)})</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.lastVisited ? new Date(row.lastVisited).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
