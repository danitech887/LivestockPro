import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Wheat,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  DollarSign,
  Users,
  ShieldAlert,
  Sparkles,
  Droplets,
  Calendar
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { useFarm } from '../../context/FarmContext';
import { formatCurrency } from '../../utils/formatters';

export const InitialiseFeedingModal = ({ isOpen, onClose, feedItem = null }) => {
  const { addFeedConsumption, feedStock, animals } = useFarm();

  const [selectedFeedId, setSelectedFeedId] = useState(feedItem?.id || feedStock[0]?.id || '');
  const activeFeed = feedStock.find(f => f.id === selectedFeedId) || feedItem || feedStock[0];

  // Update selection if feedItem prop changes
  useEffect(() => {
    if (feedItem?.id) {
      setSelectedFeedId(feedItem.id);
    }
  }, [feedItem]);

  // Specifications state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState('Morning Ration (AM)');
  const [sector, setSector] = useState(activeFeed?.category?.toLowerCase().includes('dairy') ? 'dairy' : 'beef');
  const [herdGroup, setHerdGroup] = useState('Milking Herd Barn 1 (Pen A & B)');
  const [headCount, setHeadCount] = useState('4');
  
  // Ration calculation mode
  const [calcMode, setCalcMode] = useState('total'); // 'total' or 'perHead'
  const [perHeadAmount, setPerHeadAmount] = useState('12');
  const [totalQuantity, setTotalQuantity] = useState('48');

  // Operational specifications
  const [feederOperator, setFeederOperator] = useState('John (Barn Feeder)');
  const [feedBunk, setFeedBunk] = useState('Bunk Line 1 (North Side)');
  const [includeMineralPremix, setIncludeMineralPremix] = useState(false);
  const [mineralPremixNotes, setMineralPremixNotes] = useState('Add 2 kg Calcium/Phosphorus Mineral Pack');
  const [moistureTmrPct, setMoistureTmrPct] = useState('45');
  const [notes, setNotes] = useState('');

  const [feedback, setFeedback] = useState(null);

  // Auto-calculate total quantity if in perHead mode
  useEffect(() => {
    if (calcMode === 'perHead') {
      const heads = parseFloat(headCount) || 0;
      const perHead = parseFloat(perHeadAmount) || 0;
      setTotalQuantity((heads * perHead).toFixed(1));
    }
  }, [headCount, perHeadAmount, calcMode]);

  const dispensedQty = parseFloat(totalQuantity) || 0;
  const unitCost = activeFeed?.costPerUnit || 0.45;
  const batchTotalCost = dispensedQty * unitCost;

  // Inventory projections
  const currentStock = activeFeed?.currentStock || 0;
  const remainingStock = currentStock - dispensedQty;
  const isOverdraw = dispensedQty > currentStock;
  const isBelowThreshold = remainingStock <= (activeFeed?.reorderThreshold || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isOverdraw) {
      setFeedback({
        type: 'error',
        message: `Overdraw error: Requested ${dispensedQty} ${activeFeed?.unit}, but only ${currentStock} ${activeFeed?.unit} remain in ${activeFeed?.location}.`
      });
      return;
    }

    if (dispensedQty <= 0) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid feeding quantity greater than 0.'
      });
      return;
    }

    const newRecord = addFeedConsumption({
      date,
      sector,
      group: `${herdGroup} (${headCount} head)`,
      feedId: activeFeed?.id,
      feedName: activeFeed?.name || 'Feed Ration',
      quantityKg: dispensedQty,
      costTotal: batchTotalCost,
      sessionTime,
      feederOperator,
      feedBunk,
      mineralPremix: includeMineralPremix ? mineralPremixNotes : null,
      notes: `${notes ? notes + ' | ' : ''}Bunk: ${feedBunk} | Session: ${sessionTime}`
    });

    setFeedback({
      type: 'success',
      message: `Feeding session confirmed! Successfully dispensed ${dispensedQty} ${activeFeed?.unit} of ${activeFeed?.name} to ${herdGroup}.`
    });

    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Initialise Herd Feeding Session"
      subtitle="Configure ration specifications, herd targets, bunk delivery, and stock deduction"
      maxWidth="max-w-2xl"
    >
      {feedback ? (
        <div className="py-8 text-center space-y-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            feedback.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <h4 className="text-lg font-bold text-slate-900">{feedback.message}</h4>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feed Commodity Stock Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-farm-50 to-emerald-50/50 border border-farm-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-farm-700 bg-farm-100/80 px-2 py-0.5 rounded">
                  Selected Stockpile Commodity
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{activeFeed?.name}</h3>
                <p className="text-xs text-slate-500">
                  Stored at: <strong className="text-slate-800">{activeFeed?.location}</strong> • {activeFeed?.category}
                </p>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Available Stock</span>
                  <span className={`text-lg font-black ${isOverdraw ? 'text-rose-600' : 'text-slate-900'}`}>
                    {currentStock.toLocaleString()} {activeFeed?.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Procurement Cost</span>
                  <span className="text-lg font-black text-emerald-700">
                    {formatCurrency(unitCost)} / {activeFeed?.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Target Herd & Shift Timing Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Dispensing Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <Select
              label="Feeding Shift / Session"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              options={[
                'Morning Ration (AM)',
                'Midday Supplement',
                'Evening Ration (PM)',
                'Night Trough Top-up'
              ]}
            />

            <Select
              label="Enterprise Sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              options={[
                { value: 'dairy', label: 'Dairy Enterprise' },
                { value: 'beef', label: 'Beef Enterprise' },
                { value: 'breeding', label: 'Breeding Herd' }
              ]}
            />
          </div>

          {/* Section 2: Pen & Herd Target Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Target Pen / Herd Group"
              value={herdGroup}
              onChange={(e) => setHerdGroup(e.target.value)}
              options={[
                'Milking Herd Barn 1 (Pen A & B)',
                'Dry Cows Pasture C',
                'Fresh Calved Maternity Pen',
                'Feedlot Finisher Steers (Paddock 1)',
                'Feedlot Finisher Steers (Paddock 2)',
                'Calf Starter Nursery Pen',
                'Breeding Herd Bulls Paddock'
              ]}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Head Count"
                type="number"
                min="1"
                value={headCount}
                onChange={(e) => setHeadCount(e.target.value)}
                required
              />

              <Input
                label="Bunk / Trough Location"
                value={feedBunk}
                onChange={(e) => setFeedBunk(e.target.value)}
                placeholder="e.g. Bunk Line 1"
              />
            </div>
          </div>

          {/* Section 3: Ration Quantity Specifications & Mode Toggle */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-farm-600" /> Ration Quantity Specifications
              </span>

              {/* Mode Switcher */}
              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCalcMode('total')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    calcMode === 'total' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
                  }`}
                >
                  Direct Batch Total
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('perHead')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    calcMode === 'perHead' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
                  }`}
                >
                  Per Head Breakdown
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {calcMode === 'perHead' ? (
                <div>
                  <Input
                    label={`Ration per Head (${activeFeed?.unit}/head)`}
                    type="number"
                    step="0.1"
                    value={perHeadAmount}
                    onChange={(e) => setPerHeadAmount(e.target.value)}
                    helperText={`${headCount} head × ${perHeadAmount} ${activeFeed?.unit} = ${totalQuantity} ${activeFeed?.unit} total`}
                    required
                  />
                </div>
              ) : null}

              <div>
                <Input
                  label={`Total Batch Quantity to Dispense (${activeFeed?.unit})`}
                  type="number"
                  step="0.5"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(e.target.value)}
                  disabled={calcMode === 'perHead'}
                  error={isOverdraw ? `Exceeds available stock (${currentStock} ${activeFeed?.unit})` : null}
                  required
                />
              </div>

              <div>
                <Input
                  label="Feeder / Machine Operator"
                  value={feederOperator}
                  onChange={(e) => setFeederOperator(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Inventory Impact & Cost Preview */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock After Dispense</span>
                <span className={`font-black text-sm ${isOverdraw ? 'text-rose-600' : isBelowThreshold ? 'text-amber-600' : 'text-slate-900'}`}>
                  {remainingStock.toLocaleString()} {activeFeed?.unit}
                </span>
                {isBelowThreshold && !isOverdraw && (
                  <span className="text-[9px] text-amber-700 block font-bold">Triggers Reorder Level</span>
                )}
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Quantity per Animal</span>
                <span className="font-bold text-slate-800 text-sm">
                  {headCount > 0 ? (dispensedQty / headCount).toFixed(1) : 0} {activeFeed?.unit} / head
                </span>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Calculated Batch Cost</span>
                <span className="font-black text-emerald-700 text-sm">
                  {formatCurrency(batchTotalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Additives & Mixed Ration (TMR) Specifications */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeMineralPremix}
                  onChange={(e) => setIncludeMineralPremix(e.target.checked)}
                  className="w-4 h-4 rounded text-farm-600 focus:ring-farm-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  Include Mineral Pack / Supplement Additive
                </span>
              </label>

              {includeMineralPremix && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Additive Configured
                </span>
              )}
            </div>

            {includeMineralPremix && (
              <div className="pt-2 border-t border-slate-100">
                <Input
                  label="Supplement / Premix Specification"
                  value={mineralPremixNotes}
                  onChange={(e) => setMineralPremixNotes(e.target.value)}
                  placeholder="e.g. 2 kg Calcium/Phosphorus premix or Bovatec"
                />
              </div>
            )}
          </div>

          {/* Bunk Observations & Notes */}
          <Input
            label="Feed Bunk Condition & Feeding Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Clean slick bunks, eager appetite, no leftover spoilage"
          />

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isOverdraw || dispensedQty <= 0}
              icon={Utensils}
            >
              Confirm & Dispense Feeding ({dispensedQty} {activeFeed?.unit})
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
