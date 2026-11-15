import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Milk,
  Stethoscope,
  Plus
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const MobileNav = ({ onOpenQuickLog }) => {
  const { stats } = useFarm();

  const links = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/animals', label: 'Herd', icon: Layers, badge: stats.totalActiveCount },
    { to: '/production', label: 'Yields', icon: Milk },
    { to: '/health', label: 'Vet', icon: Stethoscope, alert: stats.withdrawalCount > 0 }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 shadow-lg no-print">
      <div className="flex items-center justify-around">
        {links.slice(0, 2).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                  isActive ? 'text-farm-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px]">{item.label}</span>
              {item.badge !== undefined && (
                <span className="absolute top-1 right-2 bg-slate-800 text-white text-[9px] font-bold px-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Center Quick Action button */}
        <button
          onClick={onOpenQuickLog}
          className="flex flex-col items-center justify-center -mt-5"
          title="Quick Log"
        >
          <div className="w-12 h-12 rounded-full bg-farm-600 hover:bg-farm-500 text-white flex items-center justify-center shadow-lg shadow-farm-900/40 active:scale-95 transition-all">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-farm-800 mt-0.5">Quick Log</span>
        </button>

        {links.slice(2).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                  isActive ? 'text-farm-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px]">{item.label}</span>
              {item.alert && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
