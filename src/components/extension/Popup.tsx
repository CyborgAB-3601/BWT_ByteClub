import React, { useEffect, useState } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Leaf, Zap, Globe, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TimerState, INITIAL_TIMER_STATE } from '@/lib/storage';

const data = [
  { name: 'Saved', value: 75 },
  { name: 'Used', value: 25 },
];

const COLORS = ['#2EEA8A', '#10151C'];

export const Popup = () => {
  const [timerState, setTimerState] = useState<TimerState>(INITIAL_TIMER_STATE);

  useEffect(() => {
    // Load state
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['timerState'], (result) => {
        if (result.timerState) {
          setTimerState(result.timerState as TimerState);
        }
      });
    }
  }, []);

  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
           <Leaf className="w-5 h-5 text-primary" />
           <span className="font-bold text-lg text-text-hi">EcoSense</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 z-10">
        <GlassPanel intensity="low" className="p-3 flex flex-col gap-1">
          <span className="text-xs text-text-lo">Today</span>
          <span className="text-xl font-bold tabular-nums text-text-hi">
            {timerState.carbonTotal.toFixed(2)} <span className="text-xs font-normal text-text-lo">kg</span>
          </span>
        </GlassPanel>
        <GlassPanel intensity="low" className="p-3 flex flex-col gap-1">
          <span className="text-xs text-text-lo">Projected</span>
          <span className="text-xl font-bold tabular-nums text-text-hi">
             1.2 <span className="text-xs font-normal text-text-lo">kg</span>
          </span>
        </GlassPanel>
      </div>

      {/* Chart Preview */}
      <GlassPanel intensity="low" className="flex-1 p-4 relative z-10 flex flex-col items-center justify-center">
        <div className="w-32 h-32 relative">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart width={128} height={128}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={55}
                startAngle={90}
                endAngle={-270}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-xs text-text-lo">Score</span>
            <span className="text-xl font-bold text-text-hi">A+</span>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
           <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-primary" />
             <span className="text-xs text-text-lo">Saved</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-surface-solid border border-line" />
             <span className="text-xs text-text-lo">Used</span>
           </div>
        </div>
      </GlassPanel>

      <div className="mt-auto relative z-10">
        {/* Full Screen Link - Opens Dashboard in new tab */}
        <a href="index.html" target="_blank" rel="noopener noreferrer">
          <Button className="w-full group">
            Open Full Dashboard
            <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Button>
        </a>
      </div>
    </div>
  );
};
