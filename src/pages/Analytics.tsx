import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card } from '@/components/ui/Card';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Calendar, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DailyStats } from '@/lib/storage';

// Mock data for the monthly view (generating some random variations)
const generateMonthData = () => {
  const days = [];
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    // Random carbon between 0.5kg and 5.0kg, with some zeros
    const hasActivity = Math.random() > 0.2;
    const carbon = hasActivity ? +(Math.random() * 4.5 + 0.5).toFixed(2) : 0;
    days.push({ day: i, carbon });
  }
  return days;
};

const monthData = generateMonthData();

export const AnalyticsPage = () => {
  const [currentCarbon, setCurrentCarbon] = useState(0);

  // Load real data for "Today"
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['dailyStats'], (result) => {
        if (result.dailyStats) {
           const stats = result.dailyStats as DailyStats;
           setCurrentCarbon(stats.carbon || 0);
        }
      });
    }
  }, []);

  // 3-Day Trend Data
  const threeDayData = [
    { name: '2 Days Ago', value: 2.1, label: 'High' },
    { name: 'Yesterday', value: 1.4, label: 'Medium' },
    { name: 'Today', value: currentCarbon > 0 ? currentCarbon : 0.8, label: 'Current' }, // Fallback to 0.8 if 0 for demo
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text-hi">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-full space-y-8">
        <header>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics
          </h1>
          <p className="text-text-lo mt-1">Detailed breakdown of your carbon footprint over time.</p>
        </header>

        {/* 3-Day View */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">3-Day Overview</h2>
            <span className="text-xs text-text-lo px-2 py-1 bg-surface-solid rounded-full border border-line">Short-term Trend</span>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {threeDayData.map((day, i) => {
              const isToday = i === 2;
              const prev = threeDayData[i-1];
              const diff = prev ? ((day.value - prev.value) / prev.value) * 100 : 0;
              
              return (
                <GlassPanel key={day.name} className={`p-6 relative overflow-hidden ${isToday ? 'border-primary/50' : ''}`}>
                  {isToday && <div className="absolute top-0 right-0 p-16 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />}
                  
                  <div className="relative z-10">
                    <div className="text-text-lo text-sm font-medium mb-2">{day.name}</div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold tabular-nums">
                        {day.value.toFixed(2)}
                      </span>
                      <span className="text-sm text-text-lo">kgCO₂e</span>
                    </div>
                    
                    {i > 0 && (
                      <div className={`flex items-center gap-1 text-xs font-bold ${diff > 0 ? 'text-red' : 'text-primary'}`}>
                        {diff > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(diff).toFixed(0)}% vs previous
                      </div>
                    )}
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        </section>

        {/* Monthly Calendar View */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <Calendar className="w-5 h-5 text-primary" />
               <h2 className="text-xl font-bold">Monthly Calendar</h2>
            </div>
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-surface-solid border border-line"></div>
                    <span className="text-text-lo">None</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-primary/20 border border-primary/30"></div>
                    <span className="text-text-lo">Low</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-primary border border-primary"></div>
                    <span className="text-text-lo">High</span>
                </div>
            </div>
          </div>

          <Card className="p-6">
            <div className="grid grid-cols-7 gap-4 mb-4 text-center">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                 <div key={d} className="text-xs font-bold text-text-lo uppercase tracking-wider">{d}</div>
               ))}
            </div>
            
            <div className="grid grid-cols-7 gap-4">
              {/* Offset for start of month (assuming starts on Tuesday for demo) */}
              <div className="aspect-square"></div> 
              <div className="aspect-square"></div>

              {monthData.map((data) => {
                // Determine color based on intensity
                // 0 = empty, < 1.5 = low, < 3 = med, > 3 = high
                let bgClass = "bg-surface-solid/50 border-line text-text-lo";
                if (data.carbon > 0) {
                    if (data.carbon < 1.5) bgClass = "bg-primary/10 border-primary/20 text-text-hi";
                    else if (data.carbon < 3.0) bgClass = "bg-primary/30 border-primary/40 text-text-hi";
                    else bgClass = "bg-primary border-primary text-bg font-bold shadow-neon";
                }

                return (
                  <div 
                    key={data.day} 
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 cursor-default ${bgClass}`}
                  >
                    <span className="text-sm">{data.day}</span>
                    {data.carbon > 0 && (
                        <span className="text-[10px] opacity-80">{data.carbon}kg</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

      </main>
    </div>
  );
};
