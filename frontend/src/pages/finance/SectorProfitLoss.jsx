import React from 'react';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Layers, Milk, Beef } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { FinancialBreakdownChart } from '../../components/charts/FinancialBreakdownChart';
import { formatCurrency } from '../../utils/formatters';
import { monthlyFinancialTrend } from '../../services/mockData';

export const SectorProfitLoss = () => {
  const { sales, expenses } = useFarm();

  // Dairy P&L
  const dairyRevenue = sales
    .filter(s => s.sector === 'dairy')
    .reduce((sum, s) => sum + s.amount, 0);

  const dairyExpenses = expenses
    .filter(e => e.sector === 'dairy' || e.allocatedTo?.includes('Dairy'))
    .reduce((sum, e) => sum + e.amount, 0);

  const dairyNet = dairyRevenue - dairyExpenses;
  const dairyMarginPct = dairyRevenue > 0 ? ((dairyNet / dairyRevenue) * 100).toFixed(1) : '0';

  // Beef P&L
  const beefRevenue = sales
    .filter(s => s.sector === 'beef')
    .reduce((sum, s) => sum + s.amount, 0);

  const beefExpenses = expenses
    .filter(e => e.sector === 'beef' || e.allocatedTo?.includes('Beef') || e.allocatedTo?.includes('Feedlot'))
    .reduce((sum, e) => sum + e.amount, 0);

  const beefNet = beefRevenue - beefExpenses;
  const beefMarginPct = beefRevenue > 0 ? ((beefNet / beefRevenue) * 100).toFixed(1) : '0';

  // Overall Blended
  const totalRev = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalNet = totalRev - totalExp;
  const totalMarginPct = totalRev > 0 ? ((totalNet / totalRev) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Comparative Sector Margin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Dairy Sector P&L Card */}
        <Card className="border-t-4 border-t-blue-600 bg-gradient-to-b from-blue-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Milk className="w-4 h-4" /> Dairy Sector P&L
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {dairyMarginPct}% Margin
            </span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Dairy Revenue:</span>
              <strong className="text-slate-900">{formatCurrency(dairyRevenue)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Direct Production Costs:</span>
              <strong className="text-red-700">-{formatCurrency(dairyExpenses)}</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black">
              <span>Dairy Net Profit:</span>
              <span className={dairyNet >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                {formatCurrency(dairyNet)}
              </span>
            </div>
          </div>
        </Card>

        {/* Beef Sector P&L Card */}
        <Card className="border-t-4 border-t-red-600 bg-gradient-to-b from-red-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-red-700 flex items-center gap-1.5">
              <Beef className="w-4 h-4" /> Beef Sector P&L
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-100 text-red-800">
              {beefMarginPct}% Margin
            </span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Steer Sales:</span>
              <strong className="text-slate-900">{formatCurrency(beefRevenue)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Feedlot & Ration Costs:</span>
              <strong className="text-red-700">-{formatCurrency(beefExpenses)}</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black">
              <span>Beef Net Profit:</span>
              <span className={beefNet >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                {formatCurrency(beefNet)}
              </span>
            </div>
          </div>
        </Card>

        {/* Total Farm Consolidated Card */}
        <Card className="border-t-4 border-t-emerald-600 bg-gradient-to-b from-emerald-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Consolidated Operations
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {totalMarginPct}% Margin
            </span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Farm Revenue:</span>
              <strong className="text-slate-900">{formatCurrency(totalRev)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Consolidated Outflows:</span>
              <strong className="text-red-700">-{formatCurrency(totalExp)}</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black">
              <span>Net Farm Operating Income:</span>
              <span className={totalNet >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                {formatCurrency(totalNet)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Multi-Sector Financial Chart */}
      <Card
        title="Multi-Sector Revenue vs Operating Expenses"
        subtitle="Audited financial trends showing monthly profitability across sectors"
      >
        <FinancialBreakdownChart data={monthlyFinancialTrend} title="" />
      </Card>

      {/* Financial Statement Line-Item Table */}
      <Card title="Comparative Sector Statement" subtitle="Detailed breakdown of revenues and apportionment">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-3">Financial Category</th>
                <th className="py-3 px-3 text-right">Dairy Enterprise</th>
                <th className="py-3 px-3 text-right">Beef Enterprise</th>
                <th className="py-3 px-3 text-right">General / Overhead</th>
                <th className="py-3 px-3 text-right">Consolidated Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-bold text-slate-900">Commercial Product Sales</td>
                <td className="py-3 px-3 text-right text-emerald-700 font-bold">{formatCurrency(dairyRevenue)}</td>
                <td className="py-3 px-3 text-right text-emerald-700 font-bold">{formatCurrency(beefRevenue)}</td>
                <td className="py-3 px-3 text-right text-slate-400">$0.00</td>
                <td className="py-3 px-3 text-right font-black text-emerald-800">{formatCurrency(totalRev)}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 text-slate-700 pl-6">↳ Feed Concentrate & Forage</td>
                <td className="py-3 px-3 text-right text-red-600">-${(dairyExpenses * 0.65).toFixed(2)}</td>
                <td className="py-3 px-3 text-right text-red-600">-${(beefExpenses * 0.85).toFixed(2)}</td>
                <td className="py-3 px-3 text-right text-slate-400">$0.00</td>
                <td className="py-3 px-3 text-right font-bold text-red-700">-${((dairyExpenses * 0.65) + (beefExpenses * 0.85)).toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 text-slate-700 pl-6">↳ Veterinary & Pharmaceuticals</td>
                <td className="py-3 px-3 text-right text-red-600">-${(dairyExpenses * 0.20).toFixed(2)}</td>
                <td className="py-3 px-3 text-right text-red-600">-${(beefExpenses * 0.15).toFixed(2)}</td>
                <td className="py-3 px-3 text-right text-slate-400">$0.00</td>
                <td className="py-3 px-3 text-right font-bold text-red-700">-${((dairyExpenses * 0.20) + (beefExpenses * 0.15)).toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 text-slate-700 pl-6">↳ Labor, Power & Machinery</td>
                <td className="py-3 px-3 text-right text-red-600">-${(dairyExpenses * 0.15).toFixed(2)}</td>
                <td className="py-3 px-3 text-right text-slate-400">$0.00</td>
                <td className="py-3 px-3 text-right text-red-600">-$1,760.00</td>
                <td className="py-3 px-3 text-right font-bold text-red-700">-${((dairyExpenses * 0.15) + 1760).toFixed(2)}</td>
              </tr>
              <tr className="bg-slate-100/80 font-black text-slate-900">
                <td className="py-3 px-3 uppercase">Net Sector Operating Profit</td>
                <td className="py-3 px-3 text-right text-blue-700">{formatCurrency(dairyNet)}</td>
                <td className="py-3 px-3 text-right text-red-700">{formatCurrency(beefNet)}</td>
                <td className="py-3 px-3 text-right text-slate-600">-$1,760.00</td>
                <td className="py-3 px-3 text-right text-emerald-800 text-sm">{formatCurrency(totalNet)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
