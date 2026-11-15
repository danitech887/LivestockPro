import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Tag,
  TrendingUp,
  Percent,
  Info,
  BadgeAlert,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { useFarm } from '../../context/FarmContext';
import { formatCurrency, formatWeight } from '../../utils/formatters';

export const SellAnimalModal = ({ isOpen, onClose, selectedAnimalId = null }) => {
  const { animals, sellAnimal } = useFarm();

  const eligibleAnimals = animals.filter(a => a.status === 'active');
  const [animalId, setAnimalId] = useState(selectedAnimalId || eligibleAnimals[0]?.id || '');

  // Keep sync when prop changes
  useEffect(() => {
    if (selectedAnimalId) {
      setAnimalId(selectedAnimalId);
    } else if (!animalId && eligibleAnimals.length > 0) {
      setAnimalId(eligibleAnimals[0].id);
    }
  }, [selectedAnimalId, eligibleAnimals]);

  const targetAnimal = animals.find(a => a.id === animalId) || eligibleAnimals[0];

  // Pricing & Negotiation State
  const defaultBasePrice = targetAnimal?.askingPrice || Math.round((targetAnimal?.costsIncurred || 800) * 1.35);
  const [negotiatedPrice, setNegotiatedPrice] = useState(defaultBasePrice.toString());
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Optional Discount State
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('50');
  const [discountReason, setDiscountReason] = useState('Unnegotiated price incentive');

  const [feedback, setFeedback] = useState(null);

  // Update default price when animal changes
  useEffect(() => {
    if (targetAnimal) {
      const suggested = targetAnimal.askingPrice || Math.round((targetAnimal.costsIncurred || 800) * 1.35);
      setNegotiatedPrice(suggested.toString());
    }
  }, [targetAnimal?.id]);

  // Health gate
  const isHealthUnfit = !targetAnimal || targetAnimal.healthStatus !== 'healthy' || targetAnimal.withdrawalActive;

  // Numerical calculations
  const acquisitionCost = Number(targetAnimal?.costsIncurred || 0);
  const grossNegotiated = Number(negotiatedPrice) || 0;
  const effectiveDiscount = applyDiscount ? Math.min(grossNegotiated, Number(discountAmount) || 0) : 0;
  const netSalePrice = Math.max(0, grossNegotiated - effectiveDiscount);
  const netProfit = netSalePrice - acquisitionCost;
  const profitMarginPct = acquisitionCost > 0 ? ((netProfit / acquisitionCost) * 100).toFixed(1) : '0';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isHealthUnfit) return;

    if (!buyerName.trim()) {
      setFeedback({ type: 'error', message: 'Please specify the buyer or purchasing entity.' });
      return;
    }

    if (grossNegotiated <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid negotiated selling price.' });
      return;
    }

    const res = sellAnimal({
      animalId: targetAnimal.id,
      buyer: buyerName.trim(),
      negotiatedPrice: grossNegotiated,
      discount: effectiveDiscount,
      date: saleDate,
      notes: `${notes ? notes + ' | ' : ''}${applyDiscount ? `Discount: -$${effectiveDiscount} (${discountReason})` : 'Full negotiated rate'}`
    });

    if (res.success) {
      setFeedback({ type: 'success', message: `Livestock Tag ${targetAnimal.tagId} successfully sold! Recorded net profit of ${formatCurrency(netProfit)}.` });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to complete sale.' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Livestock Commercial Sale & Transfer"
      subtitle="Negotiated sale amount entry, profit calculation, and food-safety clearance checks"
      maxWidth="max-w-2xl"
    >
      {feedback ? (
        <div className="py-8 text-center space-y-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            feedback.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <h4 className="text-lg font-bold text-slate-900">{feedback.message}</h4>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animal Selector */}
          <Select
            label="Select Livestock for Sale"
            value={animalId}
            onChange={(e) => setAnimalId(e.target.value)}
            options={eligibleAnimals.map(a => ({
              value: a.id,
              label: `${a.tagId} - ${a.name || 'Unnamed'} (${a.breed}, ${a.sector.toUpperCase()}) - Cost: ${formatCurrency(a.costsIncurred || 0)}`
            }))}
            required
          />

          {targetAnimal && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">{targetAnimal.tagId} - "{targetAnimal.name || 'Unnamed'}"</span>
                <div className="text-slate-500 mt-0.5">
                  {targetAnimal.breed} • {formatWeight(targetAnimal.weight)} • Sector: <strong className="text-slate-800 uppercase">{targetAnimal.sector}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={targetAnimal.healthStatus === 'healthy' && !targetAnimal.withdrawalActive ? 'active' : 'danger'}>
                  {targetAnimal.healthStatus === 'healthy' && !targetAnimal.withdrawalActive ? 'HEALTHY & CLEARED' : 'HEALTH RESTRICTION'}
                </Badge>
                {targetAnimal.isAvailableForSale && (
                  <Badge variant="info">LISTED FOR SALE</Badge>
                )}
              </div>
            </div>
          )}

          {/* HEALTH CONDITION BLOCKING GATE */}
          {isHealthUnfit ? (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2.5 font-black text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>MANDATORY HEALTH RESTRICTION: LIVESTOCK CANNOT BE SOLD</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                This animal's health condition is flagged as <strong>"{targetAnimal?.healthStatus}"</strong>
                {targetAnimal?.withdrawalActive && ` and is currently under an active veterinary drug withdrawal period (${targetAnimal.withdrawalDaysLeft} days remaining)`}.
                Per animal welfare standards and livestock food safety compliance, sick animals or animals under withdrawal holds cannot be sold or transferred.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Veterinary Clearance: Animal is healthy, off medication, and legally cleared for commercial sale.</span>
            </div>
          )}

          {/* Pricing, Acquisition Cost & Negotiated Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Acquisition / Incurred Rearing Cost
              </span>
              <div className="text-2xl font-black text-slate-900">
                {formatCurrency(acquisitionCost)}
              </div>
              <p className="text-[11px] text-slate-500">
                Initial purchase price or accumulated feed, medical & management expense.
              </p>
            </div>

            <div className="space-y-1.5">
              <Input
                label="Negotiated Selling Price ($)"
                type="number"
                step="1"
                value={negotiatedPrice}
                onChange={(e) => setNegotiatedPrice(e.target.value)}
                placeholder="e.g. 1850"
                helperText="Amount negotiated with the buyer"
                disabled={isHealthUnfit}
                required
              />
            </div>
          </div>

          {/* Optional Discount Toggle & Concession Feature */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyDiscount}
                  onChange={(e) => setApplyDiscount(e.target.checked)}
                  disabled={isHealthUnfit}
                  className="w-4 h-4 rounded text-farm-600 focus:ring-farm-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  Provide Discretionary Buyer Discount / Concession (Optional)
                </span>
              </label>
              {applyDiscount && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Discount Active
                </span>
              )}
            </div>

            {applyDiscount && (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Discount Amount ($)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="5"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-farm-600"
                      placeholder="e.g. 50"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      {['25', '50', '100'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDiscountAmount(amt)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded"
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Input
                    label="Reason for Discount"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="e.g. Unnegotiated price concession, cash on delivery"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Net Profit & Margin Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>Financial Profit Summary</span>
              <span>{netSalePrice >= acquisitionCost ? 'Profitable Sale' : 'Selling Below Incurred Cost'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-700 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Final Sale Price</span>
                <span className="text-base font-black text-white">{formatCurrency(netSalePrice)}</span>
                {applyDiscount && effectiveDiscount > 0 && (
                  <span className="text-[10px] text-amber-400 block">(-${effectiveDiscount})</span>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Incurred Cost</span>
                <span className="text-base font-black text-slate-300">-{formatCurrency(acquisitionCost)}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Profit / Gain</span>
                <span className={`text-base font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {netProfit >= 0 ? `+${formatCurrency(netProfit)}` : formatCurrency(netProfit)}
                </span>
                <span className="text-[10px] text-slate-300 block font-semibold">({profitMarginPct}% ROI)</span>
              </div>
            </div>
          </div>

          {/* Buyer & Date Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Buyer / Purchasing Farm"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="e.g. High Valley Pastures / John Doe"
              disabled={isHealthUnfit}
              required
            />
            <Input
              label="Buyer Contact / RFID Transfer"
              value={buyerContact}
              onChange={(e) => setBuyerContact(e.target.value)}
              placeholder="e.g. +1 555-0192 or Permit #82"
              disabled={isHealthUnfit}
            />
            <Input
              label="Transfer / Sale Date"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              disabled={isHealthUnfit}
              required
            />
          </div>

          <Input
            label="Sale Notes & Transfer Stipulations"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Pedigree papers transferred, ear tag verified at gate"
            disabled={isHealthUnfit}
          />

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isHealthUnfit || grossNegotiated <= 0}
              icon={ShoppingBag}
            >
              Confirm Sale ({formatCurrency(netSalePrice)})
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
