import { useMemo } from "react";
import GlassCard from "../components/GlassCard";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { STORAGE_KEYS, type DailyStats, type DailyStatsHistory } from "../../shared/storage";
import { useChromeStorageValue } from "../hooks/useChromeStorage";
import { todayKey } from "../../shared/time";

const lastNDays = (n: number): string[] => {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(todayKey(d));
  }
  return days;
};

const intensityToColor = (g: number) => {
  if (g >= 5) return "bg-red-500/40 border-red-400/40";
  if (g >= 1.5) return "bg-yellow-500/30 border-yellow-400/30";
  return "bg-emerald-500/25 border-emerald-400/25";
};

export default function AnalyticsPage() {
  const { value: dailyStats } = useChromeStorageValue<DailyStats>(STORAGE_KEYS.dailyStats, {
    date: "",
    totalCarbonKg: 0,
    totalTimeSec: 0
  });
  const { value: history } = useChromeStorageValue<DailyStatsHistory>(STORAGE_KEYS.dailyStatsHistory, {});

  const days = useMemo(() => lastNDays(3), []);
  const series = useMemo(() => {
    return days.map((date) => {
      const day = date === dailyStats.date ? dailyStats : history[date];
      const totalG = ((day?.totalCarbonKg ?? 0) * 1000) as number;
      return { date: date.slice(5), g: Number(totalG.toFixed(4)) };
    });
  }, [dailyStats, days, history]);

  const today = dailyStats.date ? dailyStats : undefined;
  const yesterdayKey = days[1];
  const yesterday = history[yesterdayKey];

  const todayG = (today?.totalCarbonKg ?? 0) * 1000;
  const yesterdayG = (yesterday?.totalCarbonKg ?? 0) * 1000;

  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const slots = startDow + daysInMonth;
    const paddedSlots = Math.ceil(slots / 7) * 7;
    const items: Array<{ key: string; label: string; totalG: number }> = [];
    for (let i = 0; i < paddedSlots; i++) {
      const dayNum = i - startDow + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        items.push({ key: `pad-${i}`, label: "", totalG: 0 });
        continue;
      }
      const d = new Date(year, month, dayNum);
      const k = todayKey(d);
      const stats = k === dailyStats.date ? dailyStats : history[k];
      items.push({ key: k, label: String(dayNum), totalG: (stats?.totalCarbonKg ?? 0) * 1000 });
    }
    return items;
  }, [dailyStats, history]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-300">Insights</div>
        <div className="mt-1 text-2xl font-semibold">Analytics</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard>
          <div className="text-xs uppercase tracking-wider text-slate-400">Today vs Yesterday</div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-xs text-slate-400">Today</div>
              <div className="mt-1 text-2xl font-semibold text-eco-mint">{todayG.toFixed(3)}g</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Yesterday</div>
              <div className="mt-1 text-2xl font-semibold text-slate-200">{yesterdayG.toFixed(3)}g</div>
            </div>
          </div>
        </GlassCard>

        <div className="lg:col-span-2">
          <GlassCard>
            <div className="text-sm font-semibold">3-Day Trend</div>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <XAxis dataKey="date" stroke="rgba(226,232,240,0.6)" />
                  <YAxis stroke="rgba(226,232,240,0.6)" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(14,18,22,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12
                    }}
                    labelStyle={{ color: "rgba(226,232,240,0.9)" }}
                  />
                  <Line type="monotone" dataKey="g" stroke="#2ff7c8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-semibold">Monthly Calendar</div>
            <div className="mt-1 text-xs text-slate-400">Days colored by carbon intensity</div>
          </div>
          <div className="text-xs text-slate-400">{new Date().toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {calendarDays.map((d) => (
            <div
              key={d.key}
              className={[
                "flex aspect-square items-center justify-center rounded-lg border text-xs",
                d.label ? intensityToColor(d.totalG) : "border-white/5 bg-white/0 text-transparent"
              ].join(" ")}
              title={d.label ? `${d.key}: ${d.totalG.toFixed(3)}g` : ""}
            >
              {d.label}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

