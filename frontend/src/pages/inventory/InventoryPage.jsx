import React, { useState } from 'react';
import { Wheat, Utensils, AlertTriangle } from 'lucide-react';
import { FeedStockTable } from './FeedStockTable';
import { ConsumptionLog } from './ConsumptionLog';
import { useFarm } from '../../context/FarmContext';

export const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'consumption'
  const { stats } = useFarm();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Feed Inventory & Ration Management
        </h2>
        <p className="text-xs md:text-sm text-slate-600 mt-0.5">
          Automated stock replenishment alerts, storage depots, and daily ration apportionment.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'stock'
              ? 'border-farm-600 text-farm-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>Feed Stock Levels & Silos</span>
          {stats.lowStockCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
              {stats.lowStockCount} LOW
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('consumption')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'consumption'
              ? 'border-farm-600 text-farm-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Daily Ration Consumption Logs</span>
        </button>
      </div>

      {activeTab === 'stock' && <FeedStockTable />}
      {activeTab === 'consumption' && <ConsumptionLog />}
    </div>
  );
};
