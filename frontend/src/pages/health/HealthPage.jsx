import React, { useState } from 'react';
import { Stethoscope, Heart, ShieldAlert } from 'lucide-react';
import { TreatmentLogTable } from './TreatmentLogTable';
import { ReproductionTracker } from './ReproductionTracker';
import { useFarm } from '../../context/FarmContext';

export const HealthPage = () => {
  const [activeTab, setActiveTab] = useState('treatments'); // 'treatments', 'reproduction'
  const { stats } = useFarm();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Veterinary Health, Medicine & Breeding
        </h2>
        <p className="text-xs md:text-sm text-slate-600 mt-0.5">
          Maintain mandatory food safety withdrawal compliance, prescription logs, and reproductive cycles.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('treatments')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'treatments'
              ? 'border-farm-600 text-farm-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Treatments & Drug Withdrawals</span>
          {stats.withdrawalCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
              {stats.withdrawalCount} HOLD
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reproduction')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'reproduction'
              ? 'border-purple-600 text-purple-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Estrus, AI & Calving Tracker</span>
        </button>
      </div>

      {/* Sub Views */}
      {activeTab === 'treatments' && <TreatmentLogTable />}
      {activeTab === 'reproduction' && <ReproductionTracker />}
    </div>
  );
};
