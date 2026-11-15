import React, { useState } from 'react';
import {
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
  Building2,
  ChevronDown,
  Bell,
  Check,
  Milk,
  Beef,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';

export const Header = ({ onSearchChange, searchTerm = '' }) => {
  const { user, farms, currentFarm, setCurrentFarm } = useAuth();
  const { sectorFilter, setSectorFilter, stats } = useFarm();
  const { isOnline, isSyncing, pendingCount, toggleSimulatedOffline } = useOfflineSync();

  const [farmMenuOpen, setFarmMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Universal Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search Tag ID, RFID, Breed, Cow Name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-farm-600 focus:ring-2 focus:ring-farm-100 rounded-xl transition-all outline-none"
          />
        </div>
      </div>

      {/* Sector Quick Switcher (Blended / Dairy / Beef) */}
      <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => setSectorFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            sectorFilter === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-farm-600" />
          <span>Blended Herd</span>
        </button>
        <button
          onClick={() => setSectorFilter('dairy')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            sectorFilter === 'dairy'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Milk className="w-3.5 h-3.5" />
          <span>Dairy ({stats.dairyCount})</span>
        </button>
        <button
          onClick={() => setSectorFilter('beef')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            sectorFilter === 'beef'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Beef className="w-3.5 h-3.5" />
          <span>Beef ({stats.beefCount})</span>
        </button>
      </div>

      {/* Right controls: Offline status, Farm Selector, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline Sync Status Indicator */}
        <button
          onClick={toggleSimulatedOffline}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            !isOnline
              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              : isSyncing
              ? 'bg-sky-50 text-sky-800 border-sky-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          }`}
          title="Click to toggle Field Offline Simulation"
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Offline Cached</span>
              {pendingCount > 0 && (
                <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
              <span className="hidden sm:inline">Syncing...</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Online</span>
            </>
          )}
        </button>

        {/* Farm Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setFarmMenuOpen(!farmMenuOpen);
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800 touch-target"
          >
            <Building2 className="w-4 h-4 text-farm-600" />
            <span className="hidden md:inline max-w-[120px] truncate">{currentFarm.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {farmMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Active Operation
              </div>
              {farms.map((farm) => (
                <button
                  key={farm.id}
                  onClick={() => {
                    setCurrentFarm(farm);
                    setFarmMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between text-xs font-medium text-slate-800"
                >
                  <div>
                    <div className="font-bold text-slate-900">{farm.name}</div>
                    <div className="text-[11px] text-slate-500">{farm.location}</div>
                  </div>
                  {farm.id === currentFarm.id && <Check className="w-4 h-4 text-farm-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setFarmMenuOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors touch-target"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-farm-600/30"
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                <div className="text-xs text-slate-500 font-medium">{user.role}</div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">{user.email}</div>
              </div>
              <div className="p-2 text-xs">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Role: Manager Admin</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
