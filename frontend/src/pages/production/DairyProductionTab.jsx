import React, { useState } from 'react';
import { Milk, Plus, Calendar, TrendingUp, CheckCircle, BarChart2 } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LactationCurveChart } from '../../components/charts/LactationCurveChart';
import { formatDate } from '../../utils/formatters';
import { lactationCurveBenchmark } from '../../services/mockData';

export const DairyProductionTab = () => {
  const { milkRecords, addMilkRecord, animals } = useFarm();
  const dairyCows = animals.filter(a => a.sector === 'dairy' && a.status === 'active');

  const [logFormOpen, setLogFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    tagId: dairyCows[0]?.tagId || 'LP-101',
    morningL: '16.5',
    eveningL: '14.0',
    fatPct: '4.2',
    proteinPct: '3.5',
    loggedBy: 'John (Milker)'
  });

  const selectedCow = dairyCows.find(c => c.tagId === formData.tagId);

  const handleSubmit = (e) => {
    e.preventDefault();
    addMilkRecord({
      date: formData.date,
      tagId: formData.tagId,
      name: selectedCow?.name || 'Dairy Cow',
      morningL: parseFloat(formData.morningL) || 0,
      eveningL: parseFloat(formData.eveningL) || 0,
      fatPct: parseFloat(formData.fatPct) || 4.0,
      proteinPct: parseFloat(formData.proteinPct) || 3.4,
      loggedBy: formData.loggedBy
    });
    setLogFormOpen(false);
  };

  // Quick aggregates
  const todayTotal = milkRecords
    .filter(r => r.date === new Date().toISOString().split('T')[0] || r.date === '2026-11-14')
    .reduce((sum, r) => sum + r.totalL, 0);

  const avgFat = (
    milkRecords.reduce((sum, r) => sum + (r.fatPct || 4.0), 0) / (milkRecords.length || 1)
  ).toFixed(1);

  const avgProtein = (
    milkRecords.reduce((sum, r) => sum + (r.proteinPct || 3.4), 0) / (milkRecords.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Dairy KPI bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Total Bulk Yield</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{todayTotal.toFixed(1)} Liters</div>
          <p className="text-xs text-blue-700 font-semibold mt-1">2 Milking Sessions</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Milk Fat Content</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{avgFat}% Butterfat</div>
          <p className="text-xs text-emerald-700 font-semibold mt-1">Premium Grade A</p>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Crude Protein</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{avgProtein}% Protein</div>
          <p className="text-xs text-purple-700 font-semibold mt-1">Casein Optimized</p>
        </Card>

        <Card className="border-l-4 border-l-farm-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Milking Herd In Milk</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{dairyCows.length} Cows</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">0 Dry Cows</p>
        </Card>
      </div>

      {/* Lactation Curve Chart */}
      <Card
        title="Lactation Curve Benchmarking"
        subtitle="Individual herd performance curve mapped against the 305-day standard"
        action={
          <Button
            size="sm"
            variant="dairy"
            icon={Plus}
            onClick={() => setLogFormOpen(true)}
          >
            Log Milking Session
          </Button>
        }
      >
        <LactationCurveChart data={lactationCurveBenchmark} title="" />
      </Card>

      {/* New Milking Log Form Drawer / Modal */}
      {logFormOpen && (
        <Card
          title="Record Daily Milking Session"
          subtitle="Input morning & evening yield liters for individual dairy cows"
          className="border-2 border-blue-400 bg-blue-50/20"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
              <Select
                label="Select Cow (Dairy Tag)"
                value={formData.tagId}
                onChange={(e) => setFormData(prev => ({ ...prev, tagId: e.target.value }))}
                options={dairyCows.map(c => ({
                  value: c.tagId,
                  label: `${c.tagId} - ${c.name} (${c.breed})`
                }))}
                required
              />
              <Input
                label="Milker / Operator"
                value={formData.loggedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, loggedBy: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Morning Milking (L)"
                type="number"
                step="0.1"
                value={formData.morningL}
                onChange={(e) => setFormData(prev => ({ ...prev, morningL: e.target.value }))}
                required
              />
              <Input
                label="Evening Milking (L)"
                type="number"
                step="0.1"
                value={formData.eveningL}
                onChange={(e) => setFormData(prev => ({ ...prev, eveningL: e.target.value }))}
                required
              />
              <Input
                label="Butterfat %"
                type="number"
                step="0.1"
                value={formData.fatPct}
                onChange={(e) => setFormData(prev => ({ ...prev, fatPct: e.target.value }))}
              />
              <Input
                label="Protein %"
                type="number"
                step="0.1"
                value={formData.proteinPct}
                onChange={(e) => setFormData(prev => ({ ...prev, proteinPct: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setLogFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="dairy">
                Save Milking Record
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Production Log Table */}
      <Card title="Milking Log Archive" subtitle="Daily production entries sorted by date">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Cow Tag ID</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Morning (L)</th>
                <th className="py-3 px-3">Evening (L)</th>
                <th className="py-3 px-3">Daily Total (L)</th>
                <th className="py-3 px-3">Fat %</th>
                <th className="py-3 px-3">Protein %</th>
                <th className="py-3 px-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {milkRecords.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-800">{formatDate(m.date)}</td>
                  <td className="py-3 px-3 font-bold text-blue-700">{m.tagId}</td>
                  <td className="py-3 px-3 text-slate-700">{m.name}</td>
                  <td className="py-3 px-3">{m.morningL} L</td>
                  <td className="py-3 px-3">{m.eveningL} L</td>
                  <td className="py-3 px-3 font-black text-slate-900 bg-blue-50/50">{m.totalL} L</td>
                  <td className="py-3 px-3 text-slate-600">{m.fatPct}%</td>
                  <td className="py-3 px-3 text-slate-600">{m.proteinPct}%</td>
                  <td className="py-3 px-3 text-slate-500">{m.loggedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
