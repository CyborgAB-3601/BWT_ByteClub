import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { SetupPage } from '@/pages/Setup';
import { LeaderboardPage } from '@/pages/Leaderboard';
import { AnalyticsPage } from '@/pages/Analytics';
import { TravelPage } from '@/pages/Travel';
import { Popup } from '@/components/extension/Popup';
import { EcoBubble } from '@/components/extension/EcoBubble';
import { MiniControlPanel } from '@/components/extension/MiniControlPanel';

function App() {
  const location = useLocation();
  const isPopup = location.pathname === '/popup';

  console.log('App rendering, location:', location);

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/travel" element={<TravelPage />} />
        <Route path="/popup" element={<div className="w-[320px] h-[480px] bg-bg overflow-hidden"><Popup /></div>} />
        {/* Catch-all route to prevent crashes and redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isPopup && <ExtensionOverlay />}
    </>
  );
}

const ExtensionOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertState, setAlertState] = useState<'normal' | 'heat' | 'cold' | 'daylight'>('normal');

  // Demo: Cycle alert states every 10 seconds (REMOVED)
  // We now rely on real-time intensity detection in EcoBubble
  // React.useEffect(() => {
  //   const states: ('normal' | 'heat' | 'cold' | 'daylight')[] = ['normal', 'heat', 'normal', 'cold', 'normal', 'daylight'];
  //   let i = 0;
  //   const interval = setInterval(() => {
  //     i = (i + 1) % states.length;
  //     setAlertState(states[i]);
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <>
      <EcoBubble 
        onClick={() => setIsOpen(true)} 
        isOpen={isOpen} 
        alertState={alertState}
      />
      <MiniControlPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onMinimize={() => setIsOpen(false)}
      />
    </>
  );
};

export default App;
