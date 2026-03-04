import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Trophy, Medal, Gift, Coins, Crown, ArrowUp, Star } from 'lucide-react';

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
);

const CoffeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>
);

const BagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

const MedalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);

const leaderboardData = [
  { rank: 1, name: "Sarah J.", score: 2850, carbon: "4.2kg", avatar: "SJ" },
  { rank: 2, name: "Mike T.", score: 2720, carbon: "3.9kg", avatar: "MT" },
  { rank: 3, name: "You", score: 2450, carbon: "3.5kg", avatar: "ME", isMe: true },
  { rank: 4, name: "Davide R.", score: 2100, carbon: "3.1kg", avatar: "DR" },
  { rank: 5, name: "Emily W.", score: 1950, carbon: "2.8kg", avatar: "EW" },
  { rank: 6, name: "James L.", score: 1800, carbon: "2.5kg", avatar: "JL" },
];

const rewards = [
  { id: 1, title: "Tree Planting", cost: 500, desc: "Plant 1 tree in the Amazon", icon: <LeafIcon /> },
  { id: 2, title: "Coffee Coupon", cost: 1000, desc: "Free organic coffee at Starbucks", icon: <CoffeeIcon /> },
  { id: 3, title: "Eco Store Discount", cost: 2000, desc: "20% off sustainable products", icon: <BagIcon /> },
  { id: 4, title: "Premium Badge", cost: 5000, desc: "Unlock Gold Profile Badge", icon: <MedalIcon /> },
];

export const LeaderboardPage = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text-hi">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-full flex gap-8">
        
        {/* Left Column: Leaderboard */}
        <div className="flex-1 space-y-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow" />
              Global Leaderboard
            </h1>
            <p className="text-text-lo mt-1">Compete with others to reduce carbon footprint.</p>
          </header>

          <div className="space-y-4">
            {leaderboardData.map((user, index) => (
              <GlassPanel 
                key={index}
                className={`p-4 flex items-center gap-6 transition-all ${user.isMe ? 'border-primary/50 bg-primary/5' : 'hover:bg-surface/50'}`}
              >
                <div className="w-8 font-bold text-center text-xl text-text-lo">
                  {user.rank <= 3 ? (
                     user.rank === 1 ? <Crown className="w-6 h-6 text-yellow mx-auto" /> : 
                     user.rank === 2 ? <Medal className="w-6 h-6 text-text-lo mx-auto" /> :
                     <Medal className="w-6 h-6 text-red mx-auto" />
                  ) : `#${user.rank}`}
                </div>
                
                <div className="w-12 h-12 rounded-full bg-surface-solid border border-line flex items-center justify-center font-bold text-text-hi">
                  {user.avatar}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{user.name}</span>
                    {user.isMe && <Badge variant="eco">You</Badge>}
                  </div>
                  <div className="text-xs text-text-lo">{user.carbon} CO₂ saved</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-2xl text-primary tabular-nums">{user.score}</div>
                  <div className="text-xs text-text-lo uppercase tracking-wider">Points</div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Right Column: Rewards */}
        <div className="w-96 space-y-6">
          <div className="bg-surface-solid/30 rounded-2xl p-6 border border-line sticky top-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Rewards Store</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-solid px-3 py-1 rounded-full border border-line">
                <Coins className="w-4 h-4 text-yellow" />
                <span className="font-bold tabular-nums">850</span>
              </div>
            </div>

            <div className="space-y-4">
              {rewards.map(reward => (
                <button key={reward.id} className="w-full text-left p-4 rounded-xl bg-surface/30 border border-line hover:border-primary/50 hover:bg-surface/50 transition-all group">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-solid flex items-center justify-center text-text-lo group-hover:text-primary transition-colors">
                      {reward.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm mb-1">{reward.title}</div>
                      <div className="text-xs text-text-lo mb-2">{reward.desc}</div>
                      <div className="flex items-center gap-1 text-yellow text-xs font-bold">
                        <Coins className="w-3 h-3" />
                        {reward.cost}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-line text-center">
              <p className="text-xs text-text-lo">Earn more points by reducing your carbon footprint during work sessions.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
