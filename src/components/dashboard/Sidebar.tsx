import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PieChart, Settings, Leaf, Trophy, Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen border-r border-line bg-surface-solid/50 backdrop-blur-md flex flex-col fixed left-0 top-0 z-30">
      <div className="p-6 flex items-center gap-2">
        <Leaf className="w-6 h-6 text-primary" />
        <span className="font-bold text-xl text-text-hi">EcoSense</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" />
        <NavItem to="/setup" icon={<Settings />} label="Configure" />
        <NavItem to="/leaderboard" icon={<Trophy />} label="Leaderboard" />
        <NavItem to="/analytics" icon={<PieChart />} label="Analytics" />
        <NavItem to="/travel" icon={<MapIcon />} label="Travel" />
      </nav>

      <div className="p-6 border-t border-line">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-solid border border-line flex items-center justify-center text-text-hi font-bold">
            JD
          </div>
          <div>
            <div className="text-sm font-medium text-text-hi">John Doe</div>
            <div className="text-xs text-text-lo">Enterprise Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-text-lo hover:bg-surface/50 hover:text-text-hi"
      )
    }
  >
    {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    <span className="font-medium text-sm">{label}</span>
  </NavLink>
);
