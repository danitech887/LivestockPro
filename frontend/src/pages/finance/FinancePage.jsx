import React, { useState } from 'react';
import { DollarSign, PieChart, Receipt } from 'lucide-react';
import { SectorProfitLoss } from './SectorProfitLoss';
import { ExpenseManager } from './ExpenseManager';

export const FinancePage = () => {
  const [activeTab, setActiveTab] = useState('pnl'); // 'pnl', 'expenses'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Financial & Profitability Ledger
        </h2>
        <p className="text-xs md:text-sm text-slate-600 mt-0.5">
          Enterprise margins, comparative Dairy vs Beef P&L statements, and itemized operational outflows.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'pnl'
              ? 'border-farm-600 text-farm-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Sector Profit & Loss (P&L)</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'border-farm-600 text-farm-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Categorized Expense Tracking</span>
        </button>
      </div>

      {activeTab === 'pnl' && <SectorProfitLoss />}
      {activeTab === 'expenses' && <ExpenseManager />}
    </div>
  );
};
