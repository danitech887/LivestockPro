import React, { useState } from 'react';
import { Scale, TrendingUp, Plus, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { WeightProgressionChart } from '../../components/charts/WeightProgressionChart';
import { calculateADG, calculateFCR } from '../../utils/calculations';
import { formatDate } from '../../utils/formatters';

export const BeefGrowthTab = () => {
  const { weightLogs, addWeightLog, animals } = useFarm();
  const beefCattle = animals.filter(a => a.sector === 'beef' && a.status === 'active');

  const [formOpen, setFormOpen] = useState(false);
  const [fcrModalOpen, setFcrModalOpen] = useState(false);

  // New weight log form
  const [formData, setFormData] = useState({
    tagId: beefCattle[0]?.tagId || 'LP-201',
    date: new Date().toISOString().split('T')[0],
    currentWeight: '535',
    notes: 'Routine 30-day feedlot check'
  });

  // FCR Calculator State
  const [fcrInputs, setFcrInputs] = useState({
    totalFeedKg: '620',
    weightGainedKg: '100'
  });

  const selectedAnimal = beefCattle.find(b => b.tagId === formData.tagId);
  const prevWeight = selectedAnimal?.weight || 480;
  const prevDate = '2026-10-10'; // default 1 month prior

  const calculatedAdg = calculateADG(
    prevWeight,
    prevDate,
    parseFloat(formData.currentWeight) || prevWeight,
    formData.date
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addWeightLog({
      tagId: formData.tagId,
      name: selectedAnimal?.name || 'Steer',
      date: formData.date,
      weight: parseFloat(formData.currentWeight) || 500,
      prevWeight: prevWeight,
      prevDate: prevDate,
      adg: calculatedAdg,
      notes: formData.notes
    });
    setFormOpen(false);
  };

  const currentFcr = calculateFCR(
    parseFloat(fcrInputs.totalFeedKg) || 0,
    parseFloat(fcrInputs.weightGainedKg) || 0
  );

  // Growth trajectory chart data
  const growthChartData = [
    { date: 'Weaning (6mo)', weight: 240 },
    { date: 'Backgrounding (10mo)', weight: 360 },
    { date: 'Feedlot Intake (14mo)', weight: 450 },
    { date: 'Current (18mo)', weight: 520 },
    { date: 'Finish Target', weight: 620 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Beef Growth KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Feedlot Herd Avg ADG</span>
          <div className="text-2xl font-black text-slate-900 mt-1">+1.65 kg/day</div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Prime Growth Band</p>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Herd Average Weight</span>
          <div className="text-2xl font-black text-slate-900 mt-1">521.6 kg</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Target Finish: 610 - 630 kg</p>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Feed Conversion Ratio</span>
          <div className="text-2xl font-black text-slate-900 mt-1">6.2 : 1</div>
          <p className="text-xs text-blue-700 font-semibold mt-1">kg ration / kg gain</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Days to Finish</span>
          <div className="text-2xl font-black text-slate-900 mt-1">54 Days</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Target slaughter: Dec/Jan</p>
        </Card>
      </div>

      {/* Weight Progression Chart & FCR Calculator Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Beef Cattle Growth & Weight Trajectory"
            subtitle="Feedlot cohorts monitored through finishing phase"
            action={
              <Button
                size="sm"
                variant="beef"
                icon={Plus}
                onClick={() => setFormOpen(true)}
              >
                Log Weight Sampling
              </Button>
            }
          >
            <WeightProgressionChart data={growthChartData} title="" />
          </Card>
        </div>

        {/* FCR Interactive Calculator */}
        <div className="lg:col-span-1">
          <Card
            title="FCR Growth Calculator"
            subtitle="Measure Feed Conversion Ratio efficiency"
            icon={Calculator}
          >
            <div className="space-y-4">
              <Input
                label="Total Feed Consumed (kg)"
                type="number"
                value={fcrInputs.totalFeedKg}
                onChange={(e) => setFcrInputs(prev => ({ ...prev, totalFeedKg: e.target.value }))}
                helperText="Dry matter or blended ration intake"
              />

              <Input
                label="Weight Gained Over Period (kg)"
                type="number"
                value={fcrInputs.weightGainedKg}
                onChange={(e) => setFcrInputs(prev => ({ ...prev, weightGainedKg: e.target.value }))}
                helperText="Scale difference between weigh-ins"
              />

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calculated FCR</span>
                <div className="text-3xl font-black text-red-600 mt-1">
                  {currentFcr > 0 ? `${currentFcr} : 1` : '—'}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {currentFcr < 6.5 ? (
                    <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> High Efficiency Conversion
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Consider High-Energy Finisher Ration
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* New Weight Form Drawer */}
      {formOpen && (
        <Card
          title="Sample Beef Cattle Weight"
          subtitle="Automatic ADG calculated against previous logged weigh-in"
          className="border-2 border-red-300 bg-red-50/20"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Select Steer / Bull"
                value={formData.tagId}
                onChange={(e) => setFormData(prev => ({ ...prev, tagId: e.target.value }))}
                options={beefCattle.map(b => ({
                  value: b.tagId,
                  label: `${b.tagId} - ${b.name} (${b.breed})`
                }))}
                required
              />
              <Input
                label="Weigh Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
              <Input
                label="Scale Weight (kg)"
                type="number"
                step="0.5"
                value={formData.currentWeight}
                onChange={(e) => setFormData(prev => ({ ...prev, currentWeight: e.target.value }))}
                required
              />
            </div>

            {/* Live calculation banner */}
            <div className="p-3 rounded-xl bg-white border border-red-200 flex items-center justify-between">
              <div className="text-xs text-slate-700">
                Previous Weight: <strong>{prevWeight} kg</strong> on {prevDate}
              </div>
              <div className="text-xs font-bold text-red-600">
                Calculated ADG: <strong className="text-sm font-black text-red-700">+{calculatedAdg} kg/day</strong>
              </div>
            </div>

            <Input
              label="Field Notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Body condition score 4, transitioning to finishing pen"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="beef">
                Save Weight Record
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Weight History Table */}
      <Card title="Weight Sampling History" subtitle="Track individual Average Daily Gain (ADG)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Tag ID</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Scale Weight</th>
                <th className="py-3 px-3">Previous Weight</th>
                <th className="py-3 px-3">ADG Rate</th>
                <th className="py-3 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {weightLogs.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-800">{formatDate(w.date)}</td>
                  <td className="py-3 px-3 font-bold text-red-700">{w.tagId}</td>
                  <td className="py-3 px-3 text-slate-700">{w.name}</td>
                  <td className="py-3 px-3 font-black text-slate-900">{w.weight} kg</td>
                  <td className="py-3 px-3 text-slate-500">{w.prevWeight || '—'} kg</td>
                  <td className="py-3 px-3 font-bold text-emerald-700 bg-emerald-50/40">
                    +{w.adg} kg/day
                  </td>
                  <td className="py-3 px-3 text-slate-500">{w.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
