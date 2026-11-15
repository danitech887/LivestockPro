import React, { useState } from 'react';
import { Stethoscope, ShieldAlert, Plus, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

export const TreatmentLogTable = () => {
  const { treatments, addTreatment, animals } = useFarm();
  const [formOpen, setFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    tagId: animals[0]?.tagId || 'LP-102',
    type: 'Curative Treatment',
    diagnosis: 'Clinical Mastitis',
    drug: 'Penicillin-G Procaine 300mg/mL',
    dosage: '15 mL IM daily (3-day course)',
    administeredBy: 'Dr. Evans (Vet)',
    withdrawalMilkDays: '5',
    withdrawalMeatDays: '14',
    cost: '45.00',
    notes: 'Milk must be discarded. Do not route to bulk refrigeration tank.'
  });

  const selectedAnimal = animals.find(a => a.tagId === formData.tagId);

  const handleSubmit = (e) => {
    e.preventDefault();
    addTreatment({
      ...formData,
      name: selectedAnimal?.name || 'Animal',
      withdrawalMilkDays: parseInt(formData.withdrawalMilkDays) || 0,
      withdrawalMeatDays: parseInt(formData.withdrawalMeatDays) || 0,
      cost: parseFloat(formData.cost) || 0
    });
    setFormOpen(false);
  };

  const activeWithdrawalCount = treatments.filter(t => t.withdrawalStatus === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Warning Alert Banner */}
      {activeWithdrawalCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wide">
                Mandatory Food Safety Warning: {activeWithdrawalCount} Active Drug Withdrawal Hold(s)
              </h4>
              <p className="text-xs text-amber-50 mt-0.5">
                Animals undergoing antibiotic treatment are legally quarantined from commercial milk sales and meat slaughter.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setFormOpen(true)}
            className="shrink-0 bg-white text-amber-900 border-none font-bold"
          >
            + New Treatment
          </Button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Veterinary Log & Medical Withdrawals</h3>
          <p className="text-xs text-slate-500">Record prescriptions, vaccinations, and track mandatory clearance periods</p>
        </div>
        {!activeWithdrawalCount && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setFormOpen(true)}
          >
            Record Treatment
          </Button>
        )}
      </div>

      {/* Record Treatment Drawer */}
      {formOpen && (
        <Card
          title="Administer Veterinary Treatment"
          subtitle="All records automatically update individual animal health hold status"
          className="border-2 border-farm-400 bg-farm-50/20"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Treated Animal"
                value={formData.tagId}
                onChange={(e) => setFormData(prev => ({ ...prev, tagId: e.target.value }))}
                options={animals.map(a => ({
                  value: a.tagId,
                  label: `${a.tagId} - ${a.name} (${a.breed})`
                }))}
                required
              />
              <Input
                label="Date of Administration"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
              <Select
                label="Treatment Category"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                options={[
                  'Curative Treatment',
                  'Vaccination',
                  'Deworming',
                  'Hoof Trimming & Care',
                  'Surgical Procedure',
                  'Hormone Therapy'
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Diagnosis / Condition"
                value={formData.diagnosis}
                onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="e.g. Mastitis, Foot Rot, Pneumonia"
                required
              />
              <Input
                label="Drug / Medication Name"
                value={formData.drug}
                onChange={(e) => setFormData(prev => ({ ...prev, drug: e.target.value }))}
                placeholder="e.g. Penicillin, Draxxin, Ivermectin"
                required
              />
              <Input
                label="Dosage & Route"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g. 15 mL IM"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <Input
                label="Milk Withdrawal (Days)"
                type="number"
                value={formData.withdrawalMilkDays}
                onChange={(e) => setFormData(prev => ({ ...prev, withdrawalMilkDays: e.target.value }))}
                helperText="Days milk cannot be collected"
              />
              <Input
                label="Meat Withdrawal (Days)"
                type="number"
                value={formData.withdrawalMeatDays}
                onChange={(e) => setFormData(prev => ({ ...prev, withdrawalMeatDays: e.target.value }))}
                helperText="Days before safe for slaughter"
              />
              <Input
                label="Attending Vet / Herdsman"
                value={formData.administeredBy}
                onChange={(e) => setFormData(prev => ({ ...prev, administeredBy: e.target.value }))}
                required
              />
            </div>

            <Input
              label="Treatment Directives & Safety Notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Treatment Log
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Treatments Log Table */}
      <Card title="Treatments & Medication Log" subtitle="Complete regulatory history">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Tag ID</th>
                <th className="py-3 px-3">Condition / Type</th>
                <th className="py-3 px-3">Medication & Dose</th>
                <th className="py-3 px-3">Attending Vet</th>
                <th className="py-3 px-3">Milk Hold</th>
                <th className="py-3 px-3">Meat Hold</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {treatments.map((t) => (
                <tr
                  key={t.id}
                  className={`transition-colors ${
                    t.withdrawalStatus === 'active' ? 'bg-amber-50/70 hover:bg-amber-100/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-slate-800">{formatDate(t.date)}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{t.tagId}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{t.diagnosis}</div>
                    <div className="text-[10px] text-slate-500">{t.type}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{t.drug}</div>
                    <div className="text-[10px] text-slate-500">{t.dosage}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{t.administeredBy}</td>
                  <td className="py-3 px-3">
                    {t.withdrawalStatus === 'active' && t.daysRemainingMilk > 0 ? (
                      <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {t.daysRemainingMilk}d Left
                      </span>
                    ) : (
                      <span className="text-slate-400">Cleared</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {t.withdrawalStatus === 'active' && t.daysRemainingMeat > 0 ? (
                      <span className="font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        {t.daysRemainingMeat}d Left
                      </span>
                    ) : (
                      <span className="text-slate-400">Cleared</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={t.withdrawalStatus === 'active' ? 'warning' : 'active'} size="sm">
                      {t.withdrawalStatus === 'active' ? 'WITHDRAWAL' : 'CLEARED'}
                    </Badge>
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
