import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Home, Building2, Minus, Thermometer, Wind, Lightbulb, Pause, Globe } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { TimerState, INITIAL_TIMER_STATE, DailyStats, BASE_RATE, getMultiplier } from '@/lib/storage';

interface MiniControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export const MiniControlPanel = ({ isOpen, onClose, onMinimize }: MiniControlPanelProps) => {
  // Local UI state
  const [workMode, setWorkMode] = useState<'home' | 'office'>('home');
  const [acOn, setAcOn] = useState(true);
  const [lightsOn, setLightsOn] = useState(true);
  const [temp, setTemp] = useState(22);
  const [currentDomain, setCurrentDomain] = useState('');

  // Global Sync State
  const [timerState, setTimerState] = useState<TimerState>(INITIAL_TIMER_STATE);
  const [displayTime, setDisplayTime] = useState(0);

  // Initialize and Sync with Chrome Storage
  useEffect(() => {
    setCurrentDomain(window.location.hostname);

    const syncState = () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['timerState'], (result) => {
          if (result.timerState) {
            setTimerState(result.timerState as TimerState);
          }
        });
      }
    };
    
    // ... rest of effect
    syncState();

    // Listen for changes from other tabs
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.timerState) {
        setTimerState(changes.timerState.newValue as TimerState);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener(listener);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.onChanged.removeListener(listener);
      }
    };
  }, []);

  // Timer Tick Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerState.isRunning && timerState.startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const currentSessionDuration = Math.floor((now - timerState.startTime!) / 1000);
        const total = timerState.elapsedBeforePause + currentSessionDuration;
        setDisplayTime(total);
        
        // Update website activity locally every 5 seconds while timer is running
        // AND tab is visible
        if (total % 5 === 0 && !document.hidden) {
           updateWebsiteActivity();
        }
      }, 1000);
    } else {
      setDisplayTime(timerState.elapsedBeforePause);
    }

    return () => clearInterval(interval);
  }, [timerState]);

  const updateWebsiteActivity = () => {
    // Double check visibility just in case
    if (document.hidden) return;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const domain = window.location.hostname;
      
      // Calculate carbon for this 5-second block
      // PART 3: PER-SECOND CARBON FORMULA
      // Carbon per second = BASE_RATE × DOMAIN_MULTIPLIER
      const multiplier = getMultiplier(domain);
      const carbonPerSecond = BASE_RATE * multiplier;
      const carbonForBlock = carbonPerSecond * 5; // 5 seconds interval

      chrome.storage.local.get(['websiteActivity', 'timerState'], (result) => {
        const activity = result.websiteActivity || {};
        const currentData = activity[domain] || { domain, timeSpent: 0, lastVisited: Date.now(), carbon: 0 };
        
        // Add 5 seconds (approximate)
        currentData.timeSpent += 5;
        currentData.lastVisited = Date.now();
        // Add specific carbon for this domain
        currentData.carbon = (currentData.carbon || 0) + carbonForBlock;
        
        activity[domain] = currentData;
        
        // Update global timer state carbon as well (real-time session total)
        const currentTimerState = result.timerState as TimerState;
        if (currentTimerState) {
            currentTimerState.carbonTotal += carbonForBlock;
            setTimerState(currentTimerState); // Sync local state
            chrome.storage.local.set({ 
                websiteActivity: activity,
                timerState: currentTimerState
            });
        } else {
            chrome.storage.local.set({ websiteActivity: activity });
        }
      });
    }
  };

  const handleStart = () => {
    const newState: TimerState = {
      ...timerState,
      isRunning: true,
      startTime: Date.now(),
    };
    saveState(newState);
  };

  const handlePause = () => {
    // Legacy support for pause - now just redirects to End logic or does nothing
    // For now we keep the function to avoid breaking references, but UI is removed.
  };

  const handleEndSession = () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      // Calculate final session stats
      let sessionSeconds = timerState.elapsedBeforePause;
      if (timerState.isRunning && timerState.startTime) {
        sessionSeconds += Math.floor((Date.now() - timerState.startTime) / 1000);
      }
      
      // We don't need to recalculate sessionCarbon here since it's already accumulated in timerState.carbonTotal
      const sessionCarbon = timerState.carbonTotal;

      // Update Daily Stats
      chrome.storage.local.get(['dailyStats'], (result) => {
        const stats: DailyStats = (result.dailyStats as DailyStats) || { carbon: 0, time: 0, lastUpdated: Date.now() };
        
        // Reset if it's a new day (simple check)
        const lastDate = new Date(stats.lastUpdated).getDate();
        const today = new Date().getDate();
        
        if (lastDate !== today) {
            stats.carbon = 0;
            stats.time = 0;
        }

        stats.carbon += sessionCarbon;
        stats.time += sessionSeconds;
        stats.lastUpdated = Date.now();
        
        chrome.storage.local.set({ dailyStats: stats });
      });
    }

    // Reset Timer State
    saveState(INITIAL_TIMER_STATE);
  };

  const saveState = (newState: TimerState) => {
    setTimerState(newState); // Optimistic update
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ timerState: newState });
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Calculate carbon based on time (simulated)
  // NOW: Using the actual accumulated carbon from state
  const currentCarbon = timerState.carbonTotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-20 right-4 z-40 pointer-events-auto"
        >
          <GlassPanel className="w-[340px] max-h-[80vh] overflow-y-auto flex flex-col scrollbar-hide">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-line bg-surface/30 sticky top-0 backdrop-blur-md z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${timerState.isRunning ? 'bg-primary animate-pulse' : 'bg-text-lo'}`} />
                <span className="font-semibold text-sm">EcoSense Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={onMinimize} className="p-1 hover:bg-surface/50 rounded-lg text-text-lo hover:text-text-hi transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="p-1 hover:bg-surface/50 rounded-lg text-text-lo hover:text-text-hi transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {timerState.elapsedBeforePause === 0 && !timerState.isRunning ? (
                // Start Screen
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold text-text-hi">Start Work Day</h3>
                    <p className="text-sm text-text-lo">Select your location to track impact</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-1 bg-surface-solid/50 rounded-xl border border-line">
                    <button
                      onClick={() => setWorkMode('home')}
                      className={cn(
                        "flex flex-col items-center gap-2 py-3 rounded-lg transition-all",
                        workMode === 'home' ? "bg-surface/80 shadow-sm border border-primary/20 text-primary" : "text-text-lo hover:text-text-hi"
                      )}
                    >
                      <Home className="w-5 h-5" />
                      <span className="text-xs font-medium">Home</span>
                    </button>
                    <button
                      onClick={() => setWorkMode('office')}
                      className={cn(
                        "flex flex-col items-center gap-2 py-3 rounded-lg transition-all",
                        workMode === 'office' ? "bg-surface/80 shadow-sm border border-primary/20 text-primary" : "text-text-lo hover:text-text-hi"
                      )}
                    >
                      <Building2 className="w-5 h-5" />
                      <span className="text-xs font-medium">Office</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-lo ml-1">Estimated Hours</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        defaultValue={8}
                        className="flex-1 bg-surface-solid/50 border border-line rounded-xl px-4 py-2 text-text-hi focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="text-sm text-text-lo">hrs</span>
                    </div>
                  </div>

                  <Button onClick={handleStart} className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Start Session
                  </Button>
                </motion.div>
              ) : (
                // Active Session Screen
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col items-center justify-center py-2 space-y-1">
                    <div className="flex items-center gap-2 text-text-lo text-xs mb-1 bg-surface-solid/50 px-2 py-1 rounded-full">
                       <Globe className="w-3 h-3" />
                       <span className="max-w-[200px] truncate">{currentDomain}</span>
                    </div>
                    <span className="text-4xl font-mono font-bold text-text-hi tabular-nums tracking-tight">
                      {formatTime(displayTime)}
                    </span>
                    <span className="text-xs text-text-lo uppercase tracking-wider font-medium">Session Duration</span>
                  </div>

                  <div className="bg-surface-solid/30 rounded-xl p-4 border border-line flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs text-text-lo">Current Impact</span>
                      <div className="text-xl font-bold text-primary tabular-nums">
                        {currentCarbon.toFixed(4)} <span className="text-xs font-normal text-text-lo">kg CO₂e</span>
                      </div>
                    </div>
                    <Badge variant="eco">Eco Mode</Badge>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-medium text-text-lo uppercase tracking-wider ml-1">Environment</span>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-surface-solid/30 rounded-xl p-3 border border-line flex flex-col items-center gap-2">
                        <Toggle checked={acOn} onCheckedChange={setAcOn} icon={<Wind className="w-3 h-3" />} />
                        <span className="text-[10px] text-text-lo">AC</span>
                      </div>
                      <div className="bg-surface-solid/30 rounded-xl p-3 border border-line flex flex-col items-center gap-2">
                        <Toggle checked={lightsOn} onCheckedChange={setLightsOn} icon={<Lightbulb className="w-3 h-3" />} />
                        <span className="text-[10px] text-text-lo">Lights</span>
                      </div>
                      <div className="bg-surface-solid/30 rounded-xl p-3 border border-line flex flex-col items-center justify-between py-2">
                        <button onClick={() => setTemp(t => t + 1)} className="text-text-lo hover:text-primary transition-colors">
                          <span className="text-xs">▲</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold tabular-nums">{temp}°</span>
                        </div>
                        <button onClick={() => setTemp(t => t - 1)} className="text-text-lo hover:text-primary transition-colors">
                          <span className="text-xs">▼</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {timerState.isRunning ? (
                    <Button 
                      onClick={handleEndSession} 
                      className="w-full mt-4 bg-red/10 text-red border border-red/50 hover:bg-red/20"
                    >
                      <X className="w-4 h-4 mr-2" />
                      End Session
                    </Button>
                  ) : (
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleStart} className="flex-1">
                          <Play className="w-4 h-4 mr-2 fill-current" />
                          Resume
                        </Button>
                        <Button 
                          onClick={handleEndSession} 
                          className="flex-1 bg-red/10 text-red border border-red/50 hover:bg-red/20"
                        >
                          <X className="w-4 h-4 mr-2" />
                          End Session
                        </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
