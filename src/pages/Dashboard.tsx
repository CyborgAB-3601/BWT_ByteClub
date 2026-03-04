import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card } from '@/components/ui/Card';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Badge } from '@/components/ui/Badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Globe, Zap, Leaf } from 'lucide-react';
import { WebsiteActivity, DailyStats } from '@/lib/storage';

const trendData = [
  { name: 'Mon', value: 2.4 },
  { name: 'Tue', value: 1.8 },
  { name: 'Wed', value: 3.2 },
  { name: 'Thu', value: 2.1 },
  { name: 'Fri', value: 1.5 },
  { name: 'Sat', value: 0.8 },
  { name: 'Sun', value: 0.5 },
];

const sourceData = [
  { name: 'Home', value: 45 },
  { name: 'Office', value: 30 },
  { name: 'Transit', value: 25 },
];

const COLORS = ['#2EEA8A', '#16D2C1', '#59A6FF'];

export const Dashboard = () => {
  const [websites, setWebsites] = useState<any[]>([]);
  const [totalWatts, setTotalWatts] = useState(105); // Default baseline
  const [dailyCarbon, setDailyCarbon] = useState(0);

  useEffect(() => {
    // Load config for baseline
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['userConfig_v2', 'dailyStats'], (result) => {
        const config = result.userConfig_v2 as { totalWatts?: number } | undefined;
        if (config && config.totalWatts !== undefined) {
          setTotalWatts(config.totalWatts);
        } else {
            setTotalWatts(0);
        }
        
        // Load Daily Stats
        if (result.dailyStats) {
            const stats = result.dailyStats as DailyStats;
            setDailyCarbon(stats.carbon || 0);
        }
      });
    }

    // Load website activity from storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['websiteActivity'], (result) => {
        if (result.websiteActivity) {
          const activity = result.websiteActivity as Record<string, WebsiteActivity>;
          const sorted = Object.values(activity)
            .sort((a, b) => b.timeSpent - a.timeSpent)
            .slice(0, 5) // Top 5
            .map(site => {
              // Calculate precise carbon: (Watts / 1000) * Hours * CarbonIntensity (approx 0.4 kg/kWh)
              // OLD: const kwh = (totalWatts / 1000) * hours;
              // OLD: const co2 = (kwh * 0.4 * 1000).toFixed(2) + 'g'; // in grams
              
              // NEW: Use the real tracked carbon if available, else fallback to estimation
              let co2Display = '0g';
              if (site.carbon !== undefined) {
                  // site.carbon is in kg. Convert to grams for display if small, or keep kg
                  if (site.carbon < 0.001) {
                      co2Display = (site.carbon * 1000).toFixed(2) + 'g';
                  } else {
                      co2Display = site.carbon.toFixed(4) + 'kg';
                  }
              } else {
                  // Fallback for old data
                  const hours = site.timeSpent / 3600;
                  const kwh = (totalWatts / 1000) * hours;
                  co2Display = (kwh * 0.4 * 1000).toFixed(2) + 'g';
              }
              
              // Calculate score
              let score = 'A';
              if (site.timeSpent > 3600) score = 'C';
              else if (site.timeSpent > 1800) score = 'B';
              
              // Format time
              const h = Math.floor(site.timeSpent / 3600);
              const m = Math.floor((site.timeSpent % 3600) / 60);
              const s = site.timeSpent % 60;
              const timeStr = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;

              return {
                domain: site.domain,
                time: timeStr,
                co2: co2Display,
                score
              };
            });
          setWebsites(sorted);
        }
      });
    } else {
        // Fallback mock data for dev
        setWebsites([
            { domain: 'figma.com', time: '2h 15m', co2: '8.45g', score: 'A' },
            { domain: 'google.com', time: '1h 45m', co2: '6.82g', score: 'B' },
            { domain: 'youtube.com', time: '45m', co2: '3.20g', score: 'D' },
            { domain: 'notion.so', time: '30m', co2: '1.12g', score: 'A+' },
        ]);
    }
  }, [totalWatts]); // Recalculate if baseline changes

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text-hi">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-full">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-text-lo mt-1">Real-time impact based on your {totalWatts}W workstation setup.</p>
          </div>
          <div className="flex gap-4">
             <GlassPanel className="px-4 py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-sm font-medium">System Online</span>
             </GlassPanel>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            title="Total Carbon Today" 
            value={`${dailyCarbon.toFixed(3)} kg`}
            trend="-12%" 
            trendUp={false} 
            icon={<Leaf className="text-primary" />} 
          />
          <SummaryCard 
            title="Monthly Projection" 
            value="42.5 kg" 
            trend="+5%" 
            trendUp={true} 
            icon={<Zap className="text-yellow" />} 
          />
          <SummaryCard 
            title="Green Points" 
            value="850" 
            sub="Level 4"
            icon={<Globe className="text-blue" />} 
          />
          <SummaryCard 
            title="Carbon Saved" 
            value="24%" 
            sub="vs Avg. Employee"
            icon={<Leaf className="text-teal" />} 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card title="Daily Emissions Trend" className="lg:col-span-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2EEA8A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2EEA8A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#9BB3A5" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9BB3A5" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#10151C', border: '1px solid rgba(46,234,138,0.2)', borderRadius: '8px' }}
                    itemStyle={{ color: '#E8F4EE' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#2EEA8A" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Source Breakdown">
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#10151C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-3xl font-bold text-text-hi">45%</span>
                 <span className="text-xs text-text-lo">Home</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Website Activity */}
        <Card title="Top Website Activity">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line text-text-lo text-sm">
                  <th className="py-3 font-medium">Domain</th>
                  <th className="py-3 font-medium">Time Spent</th>
                  <th className="py-3 font-medium">Est. Carbon</th>
                  <th className="py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {websites.length > 0 ? (
                    websites.map((site, i) => (
                      <tr key={i} className="group hover:bg-surface/30 transition-colors">
                        <td className="py-3 flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-surface-solid flex items-center justify-center text-xs font-bold text-text-lo uppercase border border-line">
                            {site.domain[0]}
                          </div>
                          <span className="font-medium text-text-hi">{site.domain}</span>
                        </td>
                        <td className="py-3 text-text-lo">{site.time}</td>
                        <td className="py-3 tabular-nums font-medium text-text-hi">{site.co2}</td>
                        <td className="py-3">
                          <Badge variant={site.score.startsWith('A') ? 'eco' : site.score === 'D' ? 'heat' : 'neutral'}>
                            {site.score}
                          </Badge>
                        </td>
                      </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="py-8 text-center text-text-lo">
                            No activity recorded yet. Start a session to track your impact!
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

const SummaryCard = ({ title, value, trend, trendUp, sub, icon }: any) => (
  <Card className="relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 rounded-lg bg-surface-solid/50 border border-line">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      {trend && (
        <Badge variant={!trendUp ? 'eco' : 'heat'} className="gap-1">
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </Badge>
      )}
    </div>
    <div>
      <div className="text-text-lo text-sm font-medium mb-1">{title}</div>
      <div className="text-2xl font-bold text-text-hi tabular-nums">{value}</div>
      {sub && <div className="text-xs text-text-lo mt-1">{sub}</div>}
    </div>
  </Card>
);
