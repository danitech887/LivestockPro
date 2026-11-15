import React, { useState } from 'react';
import { Milk, Scale, Stethoscope, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { useFarm } from '../../context/FarmContext';

export const QuickLogModal = ({ isOpen, onClose, defaultType = 'milk', preselectedAnimal = null }) => {
  const { animals, addMilkRecord, addWeightLog, addTreatment } = useFarm();
  const [activeTab, setActiveTab] = useState(defaultType); // 'milk', 'weight', 'treatment'
  const [submitted, setSubmitted] = useState(false);

  // Form states
  const [tagId, setTagId] = useState(preselectedAnimal?.tagId || (animals[0]?.tagId || ''));
  const [morningL, setMorningL] = useState('14.5');
  const [eveningL, setEveningL] = useState('13.0');
  const [weightKg, setWeightKg] = useState('510');
  const [treatmentType, setTreatmentType] = useState('Vaccination');
  const [drug, setDrug] = useState('');
  const [withdrawalDays, setWithdrawalDays] = useState('0');

  const selectedCow = animals.find(a => a.tagId === tagId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    if (activeTab === 'milk') {
      addMilkRecord({
        tagId,
        name: selectedCow?.name || 'Cow',
        morningL: parseFloat(morningL) || 0,
        eveningL: parseFloat(eveningL) || 0,
        fatPct: 4.1,
        proteinPct: 3.4,
        date: today,
        loggedBy: 'Barn Hand (Quick Log)'
      });
    } else if (activeTab === 'weight') {
      const prevW = selectedCow?.weight || 480;
      const curW = parseFloat(weightKg) || 500;
      const adg = ((curW - prevW) / 30).toFixed(2);
      addWeightLog({
        tagId,
        name: selectedCow?.name || 'Steer',
        date: today,
        weight: curW,
        prevWeight: prevW,
        adg: Math.max(0.1, parseFloat(adg)),
        notes: 'Logged via quick field scale'
      });
    } else if (activeTab === 'treatment') {
      const days = parseInt(withdrawalDays) || 0;
      addTreatment({
        tagId,
        name: selectedCow?.name || 'Animal',
        date: today,
        type: treatmentType,
        diagnosis: `Field treatment: ${drug || 'Routine preventative'}`,
        drug: drug || 'Standard Dose',
        dosage: 'As prescribed',
        administeredBy: 'Field Vet',
        withdrawalMilkDays: days,
        withdrawalMeatDays: days * 2,
        cost: 25.00
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Barn & Field Logging"
      subtitle="Instantly register milk yields, beef weights, or vet applications"
      maxWidth="max-w-lg"
    >
      {submitted ? (
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Record Saved Successfully!</h4>
          <p className="text-xs text-slate-500 mt-1">Updated in local barn database and queued for sync.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('milk')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'milk'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Milk className="w-4 h-4" />
              <span>Milk Yield</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('weight')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'weight'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Beef Weight</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('treatment')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'treatment'
                  ? 'bg-farm-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Vet Treatment</span>
            </button>
          </div>

          {/* Cow / Animal Selector */}
          <Select
            label="Select Livestock"
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            options={animals.map(a => ({
              value: a.tagId,
              label: `${a.tagId} - ${a.name} (${a.breed}, ${a.sector.toUpperCase()})`
            }))}
            required
          />

          {/* Conditional inputs */}
          {activeTab === 'milk' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Morning Milking (L)"
                type="number"
                step="0.1"
                value={morningL}
                onChange={(e) => setMorningL(e.target.value)}
                required
              />
              <Input
                label="Evening Milking (L)"
                type="number"
                step="0.1"
                value={eveningL}
                onChange={(e) => setEveningL(e.target.value)}
                required
              />
            </div>
          )}

          {activeTab === 'weight' && (
            <div className="space-y-3">
              <Input
                label="Current Weight Scale Reading (kg)"
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
              />
              {selectedCow && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Previous logged weight: <strong className="text-slate-900">{selectedCow.weight} kg</strong>
                </div>
              )}
            </div>
          )}

          {activeTab === 'treatment' && (
            <div className="space-y-3">
              <Select
                label="Treatment Type"
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value)}
                options={[
                  'Vaccination',
                  'Curative Treatment',
                  'Deworming',
                  'Hoof Trimming & Care',
                  'Vitamin Injection'
                ]}
              />
              <Input
                label="Medication / Drug Name"
                value={drug}
                onChange={(e) => setDrug(e.target.value)}
                placeholder="e.g. Penicillin, Oxytetracycline 20%"
                required
              />
              <Input
                label="Milk/Meat Withdrawal Period (Days)"
                type="number"
                value={withdrawalDays}
                onChange={(e) => setWithdrawalDays(e.target.value)}
                helperText="Animals under withdrawal will trigger mandatory compliance warnings"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Entry
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
