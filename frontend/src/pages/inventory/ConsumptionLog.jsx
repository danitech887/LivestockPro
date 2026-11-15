import React, { useState } from 'react';
import { Utensils, Plus, DollarSign, Milk, Scale, Calculator } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ConsumptionLog = () => {
  const { feedStock, feedConsumption, addFeedConsumption, stats } = useFarm();
  const [formOpen, setFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sector: 'dairy',
    group: 'Milking Herd (4 cows)',
    feedId: feedStock[0]?.id || '',
    quantityKg: '45'
  });

  const selectedFeed = feedStock.find(f => f.id === formData.feedId) || feedStock[0];
  const unitCost = selectedFeed?.costPerUnit || 0.45;
  const calculatedTotalCost = (parseFloat(formData.quantityKg) || 0) * unitCost;

  const handleSubmit = (e) => {
    e.preventDefault();
    addFeedConsumption({
      date: formData.date,
      sector: formData.sector,
      group: formData.group,
      feedId: selectedFeed?.id,
      feedName: selectedFeed?.name || 'Feed Ration',
      quantityKg: parseFloat(formData.quantityKg) || 0,
      costTotal: calculatedTotalCost
    });
    setFormOpen(false);
  };

  // Calculations for unit production cost
  const totalDairyFeedToday = feedConsumption
    .filter(c => c.sector === 'dairy')
    .reduce((sum, c) => sum + c.costTotal, 0);

  const totalBeefFeedToday = feedConsumption
    .filter(c => c.sector === 'beef')
    .reduce((sum, c) => sum + c.costTotal, 0);

  const approxMilkDailyLiters = (stats.dairyCount || 4) * (stats.avgMilkYield || 26.5);
  const feedCostPerLiter = approxMilkDailyLiters > 0
    ? (totalDairyFeedToday / approxMilkDailyLiters).toFixed(2)
    : '0.48';

  const approxBeefDailyGainKg = (stats.beefCount || 3) * (stats.avgAdg || 1.65);
  const feedCostPerKgBeef = approxBeefDailyGainKg > 0
    ? (totalBeefFeedToday / approxBeefDailyGainKg).toFixed(2)
    : '5.20';

  return (
    <div className="space-y-6">
      {/* Unit Feed Cost Efficiency KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Feed Cost Per Liter of Milk</span>
          <div className="text-2xl font-black text-blue-700 mt-1">${feedCostPerLiter} / L</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Based on daily ration allocation</p>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Feed Cost Per kg Beef Gained</span>
          <div className="text-2xl font-black text-red-700 mt-1">${feedCostPerKgBeef} / kg gain</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Cost of average daily gain</p>
        </Card>

        <Card className="border-l-4 border-l-farm-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Feed Dispatched Today</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {feedConsumption.reduce((sum, c) => sum + c.quantityKg, 0)} kg
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">All herd groups combined</p>
        </Card>
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Ration Distribution & Consumption Logs</h3>
          <p className="text-xs text-slate-500">Record daily feed weighed out to pens, pastures, and automated feeding troughs</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setFormOpen(true)}
        >
          Log Ration Dispatch
        </Button>
      </div>

      {/* Record Consumption Drawer */}
      {formOpen && (
        <Card
          title="Log Daily Herd Ration Allocation"
          subtitle="Deducts automatically from feed inventory stockpile"
          className="border-2 border-farm-400 bg-farm-50/20"
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
                label="Sector"
                value={formData.sector}
                onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                options={[
                  { value: 'dairy', label: 'Dairy Milking Herd' },
                  { value: 'beef', label: 'Beef Feedlot Cohort' }
                ]}
              />
              <Input
                label="Herd Group / Pen"
                value={formData.group}
                onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
                placeholder="e.g. Milking Herd Barn A"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Feed Stock Commodity"
                value={formData.feedId}
                onChange={(e) => setFormData(prev => ({ ...prev, feedId: e.target.value }))}
                options={feedStock.map(f => ({
                  value: f.id,
                  label: `${f.name} (${f.currentStock} ${f.unit} in stock - $${f.costPerUnit}/${f.unit})`
                }))}
                required
              />
              <Input
                label="Quantity Dispatched (kg)"
                type="number"
                step="0.5"
                value={formData.quantityKg}
                onChange={(e) => setFormData(prev => ({ ...prev, quantityKg: e.target.value }))}
                required
              />
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Calculated Batch Cost</span>
                <span className="text-base font-black text-emerald-700">{formatCurrency(calculatedTotalCost)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Allocation Record
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Consumption Table */}
      <Card title="Feed Allocation History" subtitle="Audited logs of feed distributions">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Sector</th>
                <th className="py-3 px-3">Herd Group</th>
                <th className="py-3 px-3">Feed Commodity</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3 text-right">Total Ration Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {feedConsumption.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-800">{formatDate(c.date)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.sector === 'dairy' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {c.sector}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{c.group}</td>
                  <td className="py-3 px-3 text-slate-700">{c.feedName}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{c.quantityKg} kg</td>
                  <td className="py-3 px-3 text-right font-black text-slate-900">
                    {formatCurrency(c.costTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
