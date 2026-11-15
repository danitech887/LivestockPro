import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Milk,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Layers,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LactationCurveChart } from '../../components/charts/LactationCurveChart';
import { WeightProgressionChart } from '../../components/charts/WeightProgressionChart';
import { FinancialBreakdownChart } from '../../components/charts/FinancialBreakdownChart';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { lactationCurveBenchmark, monthlyFinancialTrend } from '../../services/mockData';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { stats, sectorFilter, setSectorFilter, activities, animals, weightLogs } = useFarm();

  // Transform weight logs for the weight chart
  const weightChartData = [
    { date: 'Sep 10', weight: 420 },
    { date: 'Oct 10', weight: 470 },
    { date: 'Nov 10', weight: 520 },
    { date: 'Target Dec', weight: 610 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Sector Filter & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-farm-700 uppercase tracking-wider bg-farm-50 px-2.5 py-1 rounded-md border border-farm-200">
              Operations Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">Real-Time Sensor & Field Sync</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Livestock Executive Overview
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-0.5">
            Monitoring herd yields, growth rates, medication withdrawals, and sector profitability.
          </p>
        </div>

        {/* Sector Toggle Buttons */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setSectorFilter('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              sectorFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Blended View
          </button>
          <button
            onClick={() => setSectorFilter('dairy')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              sectorFilter === 'dairy'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dairy Focus
          </button>
          <button
            onClick={() => setSectorFilter('beef')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              sectorFilter === 'beef'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Beef Focus
          </button>
        </div>
      </div>

      {/* High-Risk Withdrawal Alert Warning Banner */}
      {stats.withdrawalCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <ShieldAlert className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-wide flex items-center gap-2">
                <span>Active Withdrawal Safety Alert</span>
                <span className="bg-black/30 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.withdrawalCount} Animal{stats.withdrawalCount > 1 ? 's' : ''} Under Hold
                </span>
              </div>
              <p className="text-xs text-amber-50 mt-0.5">
                Animals treated with antibiotics/meds must not enter the milk bulk tank or slaughterhouse until withdrawal days elapse.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/health')}
            className="shrink-0 bg-white text-amber-900 border-none hover:bg-amber-50 font-bold"
          >
            Review Hold List
          </Button>
        </div>
      )}

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Herd Count */}
        <Card className="border-l-4 border-l-farm-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Herd Size</span>
            <div className="p-2 rounded-xl bg-farm-50 text-farm-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalActiveCount}</span>
            <span className="text-xs text-slate-500 font-semibold">Head of cattle</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Dairy: <strong className="text-blue-600">{stats.dairyCount}</strong></span>
            <span className="text-slate-500">Beef: <strong className="text-red-600">{stats.beefCount}</strong></span>
          </div>
        </Card>

        {/* Average Daily Milk Yield */}
        <Card className="border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Daily Milk Yield</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Milk className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.avgMilkYield}</span>
            <span className="text-xs text-slate-500 font-semibold">Liters / cow / day</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +4.2% vs last week
            </span>
            <span className="text-slate-400 font-normal">2x Daily Milking</span>
          </div>
        </Card>

        {/* Average Daily Gain (ADG) for Beef */}
        <Card className="border-l-4 border-l-red-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Beef Growth (ADG)</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">+{stats.avgAdg}</span>
            <span className="text-xs text-slate-500 font-semibold">kg / head / day</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> FCR 6.2 Target
            </span>
            <span className="text-slate-400 font-normal">High-Energy Ration</span>
          </div>
        </Card>

        {/* Net Farm Income (MTD) */}
        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Margin (MTD)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{formatCurrency(stats.netIncomeMTD)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Revenue: <strong className="text-slate-800">{formatCurrency(stats.totalSales)}</strong></span>
            <span className="text-slate-500">Costs: <strong className="text-slate-800">{formatCurrency(stats.totalExpenses)}</strong></span>
          </div>
        </Card>
      </div>

      {/* Production Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lactation Curve */}
        <Card
          title="Dairy Lactation Curve Benchmark"
          subtitle="Herd average vs standard 305-day dairy production curve"
          action={
            <Button size="sm" variant="outline" onClick={() => navigate('/production')}>
              Milk Logs
            </Button>
          }
        >
          <LactationCurveChart data={lactationCurveBenchmark} title="" />
        </Card>

        {/* Beef Weight Progression */}
        <Card
          title="Beef Growth & Finishing Trajectory"
          subtitle="Feedlot lot weight sampling curve leading to slaughter target (610 kg)"
          action={
            <Button size="sm" variant="outline" onClick={() => navigate('/production')}>
              Weight Sampling
            </Button>
          }
        >
          <WeightProgressionChart data={weightChartData} title="" />
        </Card>
      </div>

      {/* Financial Overview & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Sector Revenue Breakdown */}
        <div className="lg:col-span-2">
          <Card
            title="Multi-Sector P&L Performance"
            subtitle="Comparing Dairy milk sales vs Beef sales against operational farm costs"
            action={
              <Button size="sm" variant="secondary" onClick={() => navigate('/finance')}>
                View Ledger
              </Button>
            }
          >
            <FinancialBreakdownChart data={monthlyFinancialTrend} title="" />
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-1">
          <Card
            title="Recent Activity Feed"
            subtitle="Real-time log of farm events"
            action={
              <span className="text-xs font-bold text-farm-700 bg-farm-50 px-2 py-1 rounded-md">
                Live
              </span>
            }
          >
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {activities.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 flex items-start gap-3"
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      act.type === 'alert'
                        ? 'bg-amber-100 text-amber-700'
                        : act.type === 'production'
                        ? 'bg-blue-100 text-blue-700'
                        : act.type === 'weight'
                        ? 'bg-red-100 text-red-700'
                        : act.type === 'sale'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {act.type === 'alert' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : act.type === 'production' ? (
                      <Milk className="w-4 h-4" />
                    ) : act.type === 'weight' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{act.title}</h4>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {formatRelativeTime(act.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
