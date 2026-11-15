import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Milk,
  Stethoscope,
  Wheat,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Flame,
  Plus,
  ShoppingBag
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const Sidebar = ({ isCollapsed, toggleCollapsed, onOpenQuickLog }) => {
  const { stats, animals } = useFarm();

  const navItems = [
    { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
    {
      to: '/animals',
      label: 'Livestock Registry',
      icon: Layers,
      badge: stats.totalActiveCount
    },
    {
      to: '/production',
      label: 'Production & Yields',
      icon: Milk,
      highlight: stats.avgMilkYield ? `${stats.avgMilkYield}L avg` : null
    },
    {
      to: '/health',
      label: 'Health & Vet Logs',
      icon: Stethoscope,
      warning: stats.withdrawalCount > 0 ? `${stats.withdrawalCount} Alert` : null
    },
    {
      to: '/inventory',
      label: 'Feed & Rations',
      icon: Wheat,
      warning: stats.lowStockCount > 0 ? `${stats.lowStockCount} Low` : null
    },
    {
      to: '/finance',
      label: 'Financial P&L',
      icon: DollarSign
    },
    {
      to: '/marketplace',
      label: 'Livestock Marketplace',
      icon: ShoppingBag,
      badge: stats.availableForSaleCount || 4
    },
    {
      to: '/settings',
      label: 'Farm Settings',
      icon: Settings
    }
  ];

  return (
    <aside
      className={`relative hidden md:flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 z-30 shrink-0 border-r border-slate-800 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-farm-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-farm-900/50">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                Livestock<span className="text-emerald-400">Pro</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Barn & Field OS</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-farm-600 to-emerald-400 flex items-center justify-center text-white shadow-lg">
            <Flame className="w-6 h-6" />
          </div>
        )}

        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        {onOpenQuickLog && (
          <button
            onClick={onOpenQuickLog}
            className={`w-full flex items-center justify-center gap-2 rounded-xl bg-farm-600 hover:bg-farm-500 text-white font-bold transition-all shadow-md shadow-farm-900/30 touch-target ${
              isCollapsed ? 'px-2 py-2.5' : 'px-4 py-2.5'
            }`}
            title="Quick Field Entry"
          >
            <Plus className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm">Quick Log</span>}
          </button>
        )}
      </div>

      {/* Sector Status Badges */}
      {!isCollapsed && (
        <div className="mx-3 mb-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Live Herd Allocation</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-blue-900/40">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span>Dairy</span>
                <span className="text-sm text-white">{stats.dairyCount}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Lactating & Dry</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-red-900/40">
              <div className="flex items-center justify-between text-red-400 font-bold">
                <span>Beef</span>
                <span className="text-sm text-white">{stats.beefCount}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Finishing Feedlot</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-farm-600 text-white shadow-md shadow-farm-950/40 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-white transition-colors" />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-slate-200">
                      {item.badge}
                    </span>
                  )}
                  {item.warning && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      {item.warning}
                    </span>
                  )}
                  {item.highlight && !item.warning && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {item.highlight}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status in Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Local Database
            </span>
            <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};
