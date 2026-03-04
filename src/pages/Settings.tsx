import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { MapPin, Bell, Shield, Download, Eye } from 'lucide-react';

export const SettingsPage = () => {
  const [smartHome, setSmartHome] = useState(false);
  const [dataExport, setDataExport] = useState(false);
  const [anonMode, setAnonMode] = useState(true);
  const [showBubble, setShowBubble] = useState(true);

  // Load initial state
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['showBubble'], (result) => {
        if (result.showBubble !== undefined) {
          setShowBubble(Boolean(result.showBubble));
        }
      });
    } else {
      // Fallback for local dev
      const stored = localStorage.getItem('ecosense_showBubble');
      if (stored !== null) {
        setShowBubble(stored === 'true');
      }
    }
  }, []);

  const handleBubbleToggle = (checked: boolean) => {
    setShowBubble(checked);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ showBubble: checked }, () => {
        console.log('Settings saved: showBubble =', checked);
      });
    } else {
      // Fallback for local dev
      localStorage.setItem('ecosense_showBubble', String(checked));
      window.dispatchEvent(new Event('storage')); // Notify other components in same window
    }
  };

  return (
    <div className="flex min-h-screen bg-bg text-text-hi">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-text-lo mt-1">Manage your preferences and integrations.</p>
        </header>

        <div className="max-w-3xl space-y-6">
          <Card title="Extension Visibility" action={<Eye className="text-primary w-5 h-5" />}>
             <div className="flex items-center justify-between">
                <div>
                   <div className="font-medium">Show EcoBubble Overlay</div>
                   <div className="text-xs text-text-lo">Toggle the floating assistant on all webpages</div>
                </div>
                <Toggle checked={showBubble} onCheckedChange={handleBubbleToggle} />
             </div>
          </Card>

          <Card title="Location & Preferences" action={<MapPin className="text-primary w-5 h-5" />}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-lo">Country</label>
                  <select className="w-full bg-surface-solid border border-line rounded-xl px-4 py-2 text-text-hi focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Germany</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-lo">City</label>
                  <input type="text" defaultValue="San Francisco" className="w-full bg-surface-solid border border-line rounded-xl px-4 py-2 text-text-hi focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Temperature Unit</span>
                <div className="bg-surface-solid rounded-lg p-1 border border-line flex">
                   <button className="px-3 py-1 rounded-md bg-primary/20 text-primary text-xs font-medium">°C</button>
                   <button className="px-3 py-1 rounded-md text-text-lo text-xs font-medium hover:text-text-hi">°F</button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Integrations" action={<Bell className="text-yellow w-5 h-5" />}>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div>
                      <div className="font-medium">Smart Home Link</div>
                      <div className="text-xs text-text-lo">Connect with Nest, Hue, or HomeKit</div>
                   </div>
                   <Toggle checked={smartHome} onCheckedChange={setSmartHome} />
                </div>
                {smartHome && (
                  <div className="p-3 bg-surface-solid/30 rounded-xl border border-line text-xs text-text-lo">
                     Scanning for devices...
                  </div>
                )}
             </div>
          </Card>

          <Card title="Privacy & Data" action={<Shield className="text-teal w-5 h-5" />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <div>
                    <div className="font-medium">Anonymous Mode</div>
                    <div className="text-xs text-text-lo">Hide specific domain names in reports</div>
                 </div>
                 <Toggle checked={anonMode} onCheckedChange={setAnonMode} />
              </div>
              
              <div className="pt-4 border-t border-line flex items-center justify-between">
                 <div>
                    <div className="font-medium">Export Data</div>
                    <div className="text-xs text-text-lo">Download your carbon report (CSV)</div>
                 </div>
                 <Button variant="secondary" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                 </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
