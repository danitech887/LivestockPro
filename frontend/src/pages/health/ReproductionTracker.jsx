import React, { useState } from 'react';
import { Calendar, Plus, Heart, Sparkles, CheckCircle2, AlertCircle, Baby } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

export const ReproductionTracker = () => {
  const { reproduction, addReproduction, animals } = useFarm();
  const femaleCows = animals.filter(a => a.gender === 'female' && a.status === 'active');

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    tagId: femaleCows[0]?.tagId || 'LP-101',
    heatObservedDate: new Date().toISOString().split('T')[0],
    serviceType: 'Artificial Insemination (AI)',
    serviceDate: new Date().toISOString().split('T')[0],
    sireUsed: 'LP-S02 (Nordic Star - Straw #894)',
    technician: 'Sarah (AI Certified)',
    status: 'Pending Check',
    pregnancyCheckDate: '',
    gestationDays: 0,
    expectedCalvingDate: '',
    notes: 'Standing heat observed at morning feeding'
  });

  const selectedCow = femaleCows.find(c => c.tagId === formData.tagId);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Approximate expected calving: Service date + 283 days
    const sDate = new Date(formData.serviceDate);
    const expectedCalv = new Date(sDate.getTime() + 283 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const pregCheck = new Date(sDate.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    addReproduction({
      ...formData,
      name: selectedCow?.name || 'Cow',
      expectedCalvingDate: formData.expectedCalvingDate || expectedCalv,
      pregnancyCheckDate: formData.pregnancyCheckDate || pregCheck,
      gestationDays: 1
    });

    setFormOpen(false);
  };

  const pregnantCount = reproduction.filter(r => r.status === 'Confirmed Pregnant').length;
  const pendingCount = reproduction.filter(r => r.status === 'Pending Check').length;

  return (
    <div className="space-y-6">
      {/* Top Reproduction KPI bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-purple-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmed Pregnant Herd</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{pregnantCount} Head</div>
          <p className="text-xs text-purple-700 font-semibold mt-1">Gestation active & monitored</p>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Pregnancy Check</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{pendingCount} Head</div>
          <p className="text-xs text-amber-700 font-semibold mt-1">Ultrasound scan due (Day 35-45)</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Expected Calving</span>
          <div className="text-2xl font-black text-slate-900 mt-1">Dec 18, 2026</div>
          <p className="text-xs text-emerald-700 font-semibold mt-1">Tag LP-101 (Bella) • Heifer</p>
        </Card>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Breeding Cycles & Calving Calendar</h3>
          <p className="text-xs text-slate-500">Track estrus cycles, artificial insemination, and 283-day gestation progression</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setFormOpen(true)}
        >
          Record Service / Heat
        </Button>
      </div>

      {/* Record AI Form Drawer */}
      {formOpen && (
        <Card
          title="Log Insemination or Natural Service"
          subtitle="Automatically schedules ultrasound confirmation and calving target dates"
          className="border-2 border-purple-300 bg-purple-50/20"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Dam (Female Cow)"
                value={formData.tagId}
                onChange={(e) => setFormData(prev => ({ ...prev, tagId: e.target.value }))}
                options={femaleCows.map(c => ({
                  value: c.tagId,
                  label: `${c.tagId} - ${c.name} (${c.breed})`
                }))}
                required
              />
              <Input
                label="Heat Observed Date"
                type="date"
                value={formData.heatObservedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, heatObservedDate: e.target.value }))}
                required
              />
              <Input
                label="Service / Insemination Date"
                type="date"
                value={formData.serviceDate}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceDate: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Breeding Method"
                value={formData.serviceType}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                options={[
                  'Artificial Insemination (AI)',
                  'Natural Service (Pasture Bull)',
                  'Embryo Transfer (ET)'
                ]}
              />
              <Input
                label="Sire Used / Straw Code"
                value={formData.sireUsed}
                onChange={(e) => setFormData(prev => ({ ...prev, sireUsed: e.target.value }))}
                placeholder="e.g. LP-S02 (Nordic Star)"
                required
              />
              <Input
                label="AI Technician / Inseminator"
                value={formData.technician}
                onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                required
              />
            </div>

            <Input
              label="Observation Notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Breeding Event
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Gestation Pipeline Visual Cards */}
      <div className="space-y-4">
        {reproduction.map((item) => {
          const gestationPct = Math.min(100, Math.round(((item.gestationDays || 1) / 283) * 100));
          const isNearCalving = (item.gestationDays || 0) > 240;

          return (
            <Card key={item.id} className="p-5 border-l-4 border-l-purple-600">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-base">{item.tagId}</span>
                    <span className="font-bold text-slate-600">"{item.name}"</span>
                    <Badge
                      variant={item.status === 'Confirmed Pregnant' ? 'active' : 'warning'}
                      size="sm"
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Bred via {item.serviceType} with <strong className="text-slate-800">{item.sireUsed}</strong> • Served {formatDate(item.serviceDate)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Calving</div>
                  <div className="text-base font-black text-purple-700 mt-0.5">
                    {formatDate(item.expectedCalvingDate)}
                  </div>
                  {isNearCalving && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                      PREPARE MATERNITY STALL
                    </span>
                  )}
                </div>
              </div>

              {/* Gestation Progress Bar */}
              {item.status === 'Confirmed Pregnant' && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Gestation: Day {item.gestationDays} of 283</span>
                    <span>{gestationPct}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNearCalving ? 'bg-gradient-to-r from-purple-500 to-amber-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${gestationPct}%` }}
                    />
                  </div>
                </div>
              )}

              {item.notes && (
                <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {item.notes}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
