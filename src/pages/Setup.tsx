import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { cn } from '@/lib/utils';
import { 
  Laptop, Monitor, Server, Wifi, Printer, Plus, 
  Lightbulb, Thermometer, Zap, Check, Settings as SettingsIcon
} from 'lucide-react';
import { DEFAULT_DEVICES, DeviceConfig } from '@/lib/storage';

export const SetupPage = () => {
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [lighting, setLighting] = useState<'led' | 'incandescent' | 'natural'>('natural');
  const [climate, setClimate] = useState(0); // 0-100 slider
  const [totalWatts, setTotalWatts] = useState(0);

  // Load settings
  useEffect(() => {
    // 1. Force state to "empty/zero" defaults immediately
    // This ensures that while storage is loading, the UI shows 0W.
    setDevices(DEFAULT_DEVICES); // These are all false/unselected now
    setLighting('natural');
    setClimate(0);
    setTotalWatts(0); 

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['userConfig_v2'], (result) => {
        const config = result.userConfig_v2 as { 
             devices?: DeviceConfig[], 
             lighting?: 'led' | 'incandescent' | 'natural', 
             climate?: number, 
             totalWatts?: number 
        } | undefined;
        
        if (config && config.devices) {
           // We found a VALID v2 config, load it.
           if (config.devices) setDevices(config.devices);
           if (config.lighting) setLighting(config.lighting);
           if (config.climate) setClimate(config.climate);
           // Calculation effect will run next render
        } else {
            // No v2 config found (first run or reset).
            // Explicitly SAVE the empty state so it sticks.
            chrome.storage.local.set({ 
                userConfig_v2: {
                  devices: DEFAULT_DEVICES,
                  lighting: 'natural',
                  climate: 0,
                  totalWatts: 0
                }
            });
        }
      });
    }
  }, []);

  // Calculate total watts
  useEffect(() => {
    // Always calculate.
    const deviceWatts = devices
      .filter(d => d.selected)
      .reduce((acc, curr) => acc + curr.watts, 0);
    
    // Add estimated watts for environment
    const lightingWatts = lighting === 'led' ? 10 : lighting === 'incandescent' ? 60 : 0;
    const climateWatts = Math.floor((climate / 100) * 1000); // Max 1000W for AC

    setTotalWatts(deviceWatts + lightingWatts + climateWatts);
  }, [devices, lighting, climate]);

  // Persist settings
  useEffect(() => {
    // Only persist if we are NOT in the initial "undefined" state.
    // But since we initialize to valid defaults, we can just save.
    // To prevent overwriting a loaded config with defaults before load completes, 
    // we should trust the load effect to set state first.
    // However, the load effect runs on mount. This effect runs on mount + updates.
    
    // Safety check: Don't save if totalWatts is 0 AND we haven't touched anything? 
    // No, 0 is a valid state now.
    
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ 
        userConfig_v2: {
          devices,
          lighting,
          climate,
          totalWatts
        }
      });
    }
  }, [devices, lighting, climate, totalWatts]);

  const toggleDevice = (id: string) => {
    setDevices(devices.map(d => 
      d.id === id ? { ...d, selected: !d.selected } : d
    ));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'laptop': return <Laptop className="w-8 h-8" />;
      case 'desktop': return <Server className="w-8 h-8" />;
      case 'monitor': return <Monitor className="w-8 h-8" />;
      case 'router': return <Wifi className="w-8 h-8" />;
      case 'printer': return <Printer className="w-8 h-8" />;
      default: return <Plus className="w-8 h-8" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text-hi">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 flex gap-8 overflow-y-auto h-full">
        
        {/* Left Column: Configuration */}
        <div className="flex-1 space-y-8">
          <header>
            <div className="text-primary text-xs font-bold tracking-wider mb-2">STEP 1 OF 3</div>
            <h1 className="text-3xl font-bold mb-2">Configure Your Workspace</h1>
            <div className="w-full h-1 bg-surface-solid rounded-full mb-4">
              <div className="w-[35%] h-full bg-primary rounded-full" />
            </div>
            <p className="text-text-lo text-sm">
              Select your devices to calculate your precise energy baseline. We'll use this data to estimate your daily carbon footprint.
            </p>
          </header>

          <div className="grid grid-cols-3 gap-4">
            {devices.map(device => (
              <button
                key={device.id}
                onClick={() => toggleDevice(device.id)}
                className={cn(
                  "relative p-6 rounded-2xl border transition-all text-left group",
                  device.selected 
                    ? "bg-surface-solid border-primary shadow-[0_0_0_1px_rgba(46,234,138,0.5)]" 
                    : "bg-surface-solid/30 border-line hover:bg-surface-solid/50"
                )}
              >
                {device.selected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-bg flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className={cn("mb-4", device.selected ? "text-primary" : "text-text-lo")}>
                  {getIcon(device.type)}
                </div>
                <div className="font-bold mb-1">{device.name}</div>
                <div className="text-xs text-text-lo mb-3">Standard config</div>
                <div className={cn(
                  "inline-block text-[10px] px-2 py-1 rounded-full font-medium",
                  device.selected ? "bg-primary text-bg" : "bg-surface-solid border border-line text-text-lo"
                )}>
                  ~{device.watts} Watts
                </div>
              </button>
            ))}
            
            <button className="p-6 rounded-2xl border border-dashed border-line flex flex-col items-center justify-center gap-2 text-text-lo hover:text-text-hi hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-surface-solid flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Add Custom Device</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-medium text-sm">
              <SettingsIcon className="w-4 h-4" />
              Workstation Details
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-surface-solid/30 rounded-2xl border border-line">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-medium text-sm">Room Lighting</div>
                    <div className="text-xs text-text-lo">Primary light source</div>
                  </div>
                  <Lightbulb className="w-4 h-4 text-text-lo" />
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 bg-surface-solid rounded-lg">
                  {(['led', 'incandescent', 'natural'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setLighting(type)}
                      className={cn(
                        "py-1.5 text-[10px] font-medium rounded-md capitalize transition-all",
                        lighting === type 
                          ? "bg-primary text-bg shadow-sm" 
                          : "text-text-lo hover:text-text-hi"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Impact */}
        <aside className="w-80 space-y-6">
          <div className="sticky top-8">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Zap className="w-4 h-4 fill-current" />
              <span className="font-bold text-sm uppercase tracking-wide">Real-time Impact</span>
            </div>
            <p className="text-xs text-text-lo mb-6">Live estimation based on selection</p>

            <div className="bg-surface-solid rounded-2xl p-6 border border-line mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10 text-center">
                <div className="text-xs text-text-lo font-medium mb-1 uppercase tracking-wider">Estimated Load</div>
                <div className="text-5xl font-bold text-text-hi mb-2">
                  {totalWatts} <span className="text-2xl font-normal text-text-lo">W</span>
                </div>
                <div className="text-xs font-medium text-primary flex items-center justify-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +30W from last step
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-bold text-text-lo uppercase tracking-wider">Breakdown</div>
              <div className="space-y-2">
                {devices.filter(d => d.selected).map(d => (
                  <div key={d.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-text-hi">
                      {getIcon(d.type)}
                      <span className="text-xs">{d.name}</span>
                    </div>
                    <span className="font-mono text-text-lo">{d.watts}W</span>
                  </div>
                ))}
                {lighting !== 'natural' && (
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-line mt-2">
                    <div className="flex items-center gap-2 text-text-hi">
                      <SettingsIcon className="w-3 h-3" />
                      <span className="text-xs">Environment</span>
                    </div>
                    <span className="font-mono text-text-lo">
                      {(lighting === 'led' ? 10 : lighting === 'incandescent' ? 60 : 0)}W
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-line flex items-center justify-between">
              <div>
                <div className="text-xs text-text-lo mb-1">Daily Footprint (8h)</div>
                <div className="text-xl font-bold text-text-hi">
                  {((totalWatts * 8) / 1000 * 0.4).toFixed(2)} <span className="text-sm font-normal text-text-lo">kgCO2e</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center font-bold text-primary">
                A
              </div>
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
};

// Helper for icon sizing in list
const ArrowUpRight = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);
