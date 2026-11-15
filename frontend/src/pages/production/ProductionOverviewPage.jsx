import React, { useState } from 'react';
import { Milk, Scale, DollarSign, TrendingUp } from 'lucide-react';
import { DairyProductionTab } from './DairyProductionTab';
import { BeefGrowthTab } from './BeefGrowthTab';
import { SalesTrackerTab } from './SalesTrackerTab';

export const ProductionOverviewPage = () => {
  const [activeTab, setActiveTab] = useState('dairy'); // 'dairy', 'beef', 'sales'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Production & Commercial Sales Hub
        </h2>
        <p className="text-xs md:text-sm text-slate-600 mt-0.5">
          Monitor daily dairy milking yields, beef rate of gain (ADG), and commercial market transactions.
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('dairy')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'dairy'
              ? 'border-blue-600 text-blue-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Milk className="w-4 h-4" />
          <span>Dairy Milk Yields & Lactation</span>
        </button>

        <button
          onClick={() => setActiveTab('beef')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'beef'
              ? 'border-red-600 text-red-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Beef ADG & Growth Rates</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sales'
              ? 'border-emerald-600 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Sales & Commercial Receipts</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'dairy' && <DairyProductionTab />}
      {activeTab === 'beef' && <BeefGrowthTab />}
      {activeTab === 'sales' && <SalesTrackerTab />}
    </div>
  );
};
