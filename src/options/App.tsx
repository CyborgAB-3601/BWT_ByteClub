import { useMemo, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import ConfigurePage from "./pages/ConfigurePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LeaderboardPage from "./pages/LeaderboardPage";

type RouteKey = "dashboard" | "configure" | "analytics" | "leaderboard";

const navItems: Array<{ key: RouteKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "configure", label: "Configure" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "analytics", label: "Analytics" }
];

export default function App() {
  const [route, setRoute] = useState<RouteKey>("dashboard");
  const page = useMemo(() => {
    if (route === "configure") return <ConfigurePage />;
    if (route === "leaderboard") return <LeaderboardPage />;
    if (route === "analytics") return <AnalyticsPage />;
    return <DashboardPage />;
  }, [route]);

  return (
    <div className="min-h-screen bg-eco-bg text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-64 shrink-0 border-r border-white/10 bg-black/20 p-5">
          <div className="text-lg font-semibold tracking-wide text-eco-mint">EcoSense</div>
          <div className="mt-6 space-y-2">
            {navItems.map((item) => {
              const active = item.key === route;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRoute(item.key)}
                  className={[
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                    active
                      ? "bg-white/10 text-eco-mint ring-1 ring-white/10"
                      : "text-slate-200 hover:bg-white/5 hover:text-eco-mint"
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-6">{page}</main>
      </div>
    </div>
  );
}
