import GlassCard from "../components/GlassCard";

const leaderboard = [
  { name: "You", carbonSavedG: 125, rank: 3 },
  { name: "Asha", carbonSavedG: 210, rank: 1 },
  { name: "Mateo", carbonSavedG: 170, rank: 2 },
  { name: "Jun", carbonSavedG: 95, rank: 4 },
  { name: "Rina", carbonSavedG: 70, rank: 5 }
].sort((a, b) => a.rank - b.rank);

const rewards = [
  { name: "Tree Planting", costPoints: 800 },
  { name: "Coffee Coupon", costPoints: 450 },
  { name: "Transit Credit", costPoints: 1200 }
];

const pointsFromSavedG = (savedG: number) => Math.floor((savedG / 10) * 50);

export default function LeaderboardPage() {
  const you = leaderboard.find((x) => x.name === "You");
  const youPoints = pointsFromSavedG(you?.carbonSavedG ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-300">Gamification</div>
        <div className="mt-1 text-2xl font-semibold">Leaderboard</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Rankings</div>
                <div className="mt-1 text-xs text-slate-400">Mock data + You</div>
              </div>
              <div className="text-xs text-slate-300">
                Your Points: <span className="font-semibold text-eco-mint">{youPoints}</span>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">CO2 Saved</th>
                    <th className="px-4 py-3">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {leaderboard.map((row) => (
                    <tr key={row.name} className={row.name === "You" ? "bg-white/5" : "bg-black/10"}>
                      <td className="px-4 py-3 font-semibold text-eco-teal">#{row.rank}</td>
                      <td className="px-4 py-3">{row.name}</td>
                      <td className="px-4 py-3 text-slate-200">{row.carbonSavedG}g</td>
                      <td className="px-4 py-3 text-eco-mint">{pointsFromSavedG(row.carbonSavedG)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
        <div>
          <GlassCard>
            <div className="text-sm font-semibold">Rewards Store</div>
            <div className="mt-1 text-xs text-slate-400">Redeem points for perks</div>
            <div className="mt-4 space-y-3">
              {rewards.map((r) => (
                <div key={r.name} className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="mt-2 text-xs text-slate-400">Cost: {r.costPoints} points</div>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-lg bg-white/10 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/15"
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

