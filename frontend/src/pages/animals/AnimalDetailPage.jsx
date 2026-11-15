import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Milk,
  Scale,
  Stethoscope,
  DollarSign,
  GitBranch,
  ShieldAlert,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShoppingBag,
  Printer
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { QuickLogModal } from '../../components/common/QuickLogModal';
import { SellAnimalModal } from './SellAnimalModal';
import { AnimalPrintDossier } from '../../components/common/AnimalPrintDossier';
import { LactationCurveChart } from '../../components/charts/LactationCurveChart';
import { WeightProgressionChart } from '../../components/charts/WeightProgressionChart';
import { calculateAge, formatWeight, formatCurrency, formatDate } from '../../utils/formatters';

export const AnimalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { animals, milkRecords, weightLogs, treatments, sales, expenses, toggleAnimalSaleAvailability } = useFarm();

  const [activeTab, setActiveTab] = useState('production'); // 'lineage', 'production', 'health', 'financial'
  const [quickLogModal, setQuickLogModal] = useState({ isOpen: false, type: 'milk' });
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Find animal by ID or tagId
  const animal = animals.find(a => a.id === id || a.tagId === id) || animals[0];

  if (!animal) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-800">Livestock Record Not Found</h3>
        <Button variant="secondary" onClick={() => navigate('/animals')} className="mt-4">
          Return to Registry
        </Button>
      </div>
    );
  }

  // Filter individual data
  const animalMilk = milkRecords.filter(m => m.tagId === animal.tagId);
  const animalWeights = weightLogs.filter(w => w.tagId === animal.tagId);
  const animalTreatments = treatments.filter(t => t.tagId === animal.tagId);

  // Financial calculations
  const totalRevenue = animal.revenueGenerated || (animalMilk.length * 28.5 * 0.85);
  const totalCost = animal.costsIncurred || 950.00;
  const netMargin = totalRevenue - totalCost;

  // Mock individual yield trajectory
  const individualLactation = [
    { dayInMilk: 15, actualYield: animal.currentYield ? animal.currentYield * 0.85 : 22, benchmarkYield: 22 },
    { dayInMilk: 45, actualYield: animal.currentYield ? animal.currentYield * 1.05 : 30, benchmarkYield: 29 },
    { dayInMilk: 90, actualYield: animal.currentYield ? animal.currentYield * 1.0 : 34, benchmarkYield: 33 },
    { dayInMilk: 150, actualYield: animal.currentYield ? animal.currentYield * 0.95 : 29, benchmarkYield: 28 },
    { dayInMilk: 210, actualYield: animal.currentYield ? animal.currentYield * 0.80 : 23, benchmarkYield: 23 },
    { dayInMilk: 280, actualYield: animal.currentYield ? animal.currentYield * 0.65 : 17, benchmarkYield: 17 }
  ];

  const individualWeightProgression = animalWeights.length > 0
    ? animalWeights.map(w => ({ date: w.date, weight: w.weight }))
    : [
        { date: '2026-08-10', weight: animal.weight - 90 },
        { date: '2026-09-10', weight: animal.weight - 45 },
        { date: '2026-10-10', weight: animal.weight }
      ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/animals')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-farm-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Livestock Registry</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex flex-col items-center justify-center font-black shadow-md shrink-0">
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider">TAG</span>
              <span className="text-base tracking-tight">{animal.tagId.replace('LP-', '')}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{animal.tagId}</h1>
                <span className="text-xl font-bold text-slate-600">"{animal.name || 'Unnamed'}"</span>
                <Badge variant={animal.sector} size="md">
                  {animal.sector.toUpperCase()}
                </Badge>
                <Badge variant={animal.status} size="md">
                  {animal.status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-slate-500 mt-2">
                <span>Breed: <strong className="text-slate-800">{animal.breed}</strong></span>
                <span>•</span>
                <span>RFID: <strong className="font-mono text-slate-800">{animal.rfid || 'Not Assigned'}</strong></span>
                <span>•</span>
                <span>Gender: <strong className="text-slate-800">{animal.gender === 'female' ? 'Cow / Heifer' : 'Bull / Steer'}</strong></span>
                <span>•</span>
                <span>Location: <strong className="text-slate-800">{animal.penLocation || 'Main Pasture'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {animal.status === 'active' ? (
              <>
                <Button
                  variant="primary"
                  icon={ShoppingBag}
                  onClick={() => setSellModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Sell Livestock
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleAnimalSaleAvailability(animal.id, !animal.isAvailableForSale)}
                >
                  {animal.isAvailableForSale ? 'Unlist from Sale' : 'Mark Available for Sale'}
                </Button>
              </>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs">
                Sold: {formatCurrency(animal.soldPrice || 0)} (+{formatCurrency(animal.soldProfit || 0)} profit)
              </span>
            )}

            {animal.sector === 'dairy' && animal.status === 'active' && (
              <Button
                variant="dairy"
                icon={Milk}
                onClick={() => setQuickLogModal({ isOpen: true, type: 'milk' })}
              >
                Log Milk
              </Button>
            )}
            {animal.sector === 'beef' && animal.status === 'active' && (
              <Button
                variant="beef"
                icon={Scale}
                onClick={() => setQuickLogModal({ isOpen: true, type: 'weight' })}
              >
                Record Weight
              </Button>
            )}
            <Button
              variant="secondary"
              icon={Printer}
              onClick={() => setPrintModalOpen(true)}
            >
              Print Passport (PDF)
            </Button>
            <Button
              variant="secondary"
              icon={Stethoscope}
              onClick={() => setQuickLogModal({ isOpen: true, type: 'treatment' })}
            >
              Add Health Event
            </Button>
          </div>
        </div>

        {/* Withdrawal warning banner on animal profile */}
        {animal.withdrawalActive && (
          <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="text-xs uppercase tracking-wider block">
                  Mandatory Drug Withdrawal Active: {animal.withdrawalDaysLeft} Day(s) Remaining
                </strong>
                <p className="text-xs text-amber-800 mt-0.5">
                  Treated with {animal.notes || 'prescription veterinary medication'}. Milk and slaughter sales strictly prohibited until withdrawal completes.
                </p>
              </div>
            </div>
            <Badge variant="warning" size="md">
              MARKET HOLD
            </Badge>
          </div>
        )}

        {/* Quick Vital Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Age</span>
            <div className="text-base font-black text-slate-900 mt-0.5">{calculateAge(animal.birthDate)}</div>
            <span className="text-[10px] text-slate-400">Born {formatDate(animal.birthDate)}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Weight</span>
            <div className="text-base font-black text-slate-900 mt-0.5">{formatWeight(animal.weight)}</div>
            <span className="text-[10px] text-slate-400">Scale sampled</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {animal.sector === 'dairy' ? 'Current Yield' : 'Growth Rate'}
            </span>
            <div className="text-base font-black text-slate-900 mt-0.5">
              {animal.sector === 'dairy' ? `${animal.currentYield || 0} L/day` : `+${animal.adg || 1.65} kg/day`}
            </div>
            <span className="text-[10px] text-slate-400">
              {animal.sector === 'dairy' ? `Lactation #${animal.lactationNumber || 1}` : 'ADG Feedlot'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lifetime Net P&L</span>
            <div className={`text-base font-black mt-0.5 ${netMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(netMargin)}
            </div>
            <span className="text-[10px] text-slate-400">Revenue minus rearing cost</span>
          </div>
        </div>
      </div>

      {/* Profile Detail Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('production')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'production'
              ? 'border-farm-600 text-farm-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Milk className="w-4 h-4" />
          <span>Production & Yield History</span>
        </button>

        <button
          onClick={() => setActiveTab('lineage')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'lineage'
              ? 'border-farm-600 text-farm-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Lineage & Pedigree Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'health'
              ? 'border-farm-600 text-farm-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Health & Vet Timeline ({animalTreatments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'financial'
              ? 'border-farm-600 text-farm-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Individual Financial Ledger</span>
        </button>
      </div>

      {/* Tab 1: Production History */}
      {activeTab === 'production' && (
        <div className="space-y-6">
          <Card
            title={animal.sector === 'dairy' ? "Lactation Curve Performance" : "Beef Weight Progression"}
            subtitle="Historical metrics recorded for this animal"
          >
            {animal.sector === 'dairy' ? (
              <LactationCurveChart data={individualLactation} title="" />
            ) : (
              <WeightProgressionChart data={individualWeightProgression} title="" />
            )}
          </Card>

          {/* Daily Milk Logs Table */}
          {animal.sector === 'dairy' && (
            <Card title="Individual Milking Logs" subtitle="Recent morning and evening sessions">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Morning (L)</th>
                      <th className="py-2.5 px-3">Evening (L)</th>
                      <th className="py-2.5 px-3">Daily Total (L)</th>
                      <th className="py-2.5 px-3">Fat %</th>
                      <th className="py-2.5 px-3">Protein %</th>
                      <th className="py-2.5 px-3">Milker</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {animalMilk.length > 0 ? (
                      animalMilk.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-800">{formatDate(m.date)}</td>
                          <td className="py-2.5 px-3">{m.morningL} L</td>
                          <td className="py-2.5 px-3">{m.eveningL} L</td>
                          <td className="py-2.5 px-3 font-bold text-blue-700">{m.totalL} L</td>
                          <td className="py-2.5 px-3">{m.fatPct}%</td>
                          <td className="py-2.5 px-3">{m.proteinPct}%</td>
                          <td className="py-2.5 px-3 text-slate-500">{m.loggedBy}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-slate-500">
                          No milking logs recorded yet for this animal. Click 'Log Milk' above to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Lineage & Pedigree */}
      {activeTab === 'lineage' && (
        <Card title="Pedigree & Genetic Lineage" subtitle="Ancestry verification and registered bloodline traits">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {/* Visual Pedigree Tree */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Grandparents Column */}
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Grandparents (Gen 2)</span>
                
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Maternal Grandsire</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">LP-MG01 (Alpen Star)</div>
                  <div className="text-[10px] text-slate-500">Index: +1,240 TPI</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Maternal Granddam</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">LP-MD02 (Buttercup I)</div>
                  <div className="text-[10px] text-slate-500">Avg 34 L / day</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Paternal Grandsire</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">LP-PG01 (Nordic Pride)</div>
                  <div className="text-[10px] text-slate-500">Sire of Merit</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Paternal Granddam</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">LP-PD03 (Nordic Queen)</div>
                  <div className="text-[10px] text-slate-500">A2/A2 Certified</div>
                </div>
              </div>

              {/* Parents Column */}
              <div className="space-y-6 flex flex-col justify-around">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Parents (Gen 1)</span>
                  <div className="p-4 bg-white rounded-xl border-2 border-farm-200 shadow-sm">
                    <span className="text-[10px] text-farm-700 font-bold uppercase bg-farm-50 px-2 py-0.5 rounded">
                      Dam (Mother)
                    </span>
                    <div className="font-bold text-slate-900 text-sm mt-2">{animal.dam || 'LP-088 (Bella Senior)'}</div>
                    <div className="text-xs text-slate-500">Purebred {animal.breed}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">Lactation Avg: 31.8 L</div>
                  </div>
                </div>

                <div>
                  <div className="p-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
                    <span className="text-[10px] text-blue-700 font-bold uppercase bg-blue-50 px-2 py-0.5 rounded">
                      Sire (Father / AI)
                    </span>
                    <div className="font-bold text-slate-900 text-sm mt-2">{animal.sire || 'LP-S02 (Nordic Star)'}</div>
                    <div className="text-xs text-slate-500">Artificial Insemination Straw</div>
                    <div className="text-[11px] text-blue-600 font-semibold mt-1">Top 5% Genetic Merit</div>
                  </div>
                </div>
              </div>

              {/* Target Animal Column */}
              <div className="flex flex-col justify-center">
                <span className="text-[11px] font-bold text-farm-700 uppercase tracking-wider block mb-2">Subject Animal</span>
                <div className="p-5 bg-farm-50 rounded-2xl border-2 border-farm-500 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-farm-800">{animal.tagId}</span>
                    <Badge variant={animal.sector} size="sm">{animal.sector.toUpperCase()}</Badge>
                  </div>
                  <h4 className="text-base font-black text-slate-900">{animal.name || 'Unnamed'}</h4>
                  <p className="text-xs text-slate-600 mt-1">{animal.breed}</p>
                  
                  <div className="mt-4 pt-3 border-t border-farm-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Inbreeding Coeff:</span>
                      <strong className="text-slate-900">1.8% (Safe)</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>A2/A2 Tested:</span>
                      <strong className="text-emerald-700 font-bold">Positive</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Health & Vet Timeline */}
      {activeTab === 'health' && (
        <Card
          title="Health & Veterinary Log"
          subtitle="Medications, preventive vaccinations, hoof trimmings, and market clearance"
          action={
            <Button
              size="sm"
              variant="outline"
              icon={Stethoscope}
              onClick={() => setQuickLogModal({ isOpen: true, type: 'treatment' })}
            >
              Add Health Record
            </Button>
          }
        >
          <div className="space-y-4">
            {animalTreatments.length > 0 ? (
              animalTreatments.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{t.type}</span>
                      <Badge variant={t.withdrawalStatus === 'active' ? 'warning' : 'default'} size="sm">
                        {t.withdrawalStatus === 'active' ? 'WITHDRAWAL ACTIVE' : 'CLEARED'}
                      </Badge>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{formatDate(t.date)}</span>
                  </div>

                  <div className="mt-2 text-xs text-slate-700">
                    <div><strong>Diagnosis / Reason:</strong> {t.diagnosis}</div>
                    <div className="mt-1"><strong>Administered Drug & Dose:</strong> {t.drug} ({t.dosage})</div>
                    <div className="mt-1 text-slate-500"><strong>Attending Vet:</strong> {t.administeredBy}</div>
                  </div>

                  {t.notes && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      {t.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No veterinary treatments or health issues recorded for this animal. Herd health status is pristine.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab 4: Financial Ledger */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-emerald-600">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Revenue Produced</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-slate-500 mt-1">Milk bulk deliveries & offspring valuations</p>
            </Card>

            <Card className="border-l-4 border-l-red-600">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Costs Incurred</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalCost)}</div>
              <p className="text-xs text-slate-500 mt-1">Feed concentrate, vet fees, and barn overhead</p>
            </Card>

            <Card className={`border-l-4 ${netMargin >= 0 ? 'border-l-farm-600' : 'border-l-amber-600'}`}>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Lifetime ROI</span>
              <div className={`text-2xl font-black mt-1 ${netMargin >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {formatCurrency(netMargin)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Return on invested rearing capital</p>
            </Card>
          </div>

          <Card title="Individual Cost Allocation" subtitle="Itemized financial tracking">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">Initial Valuation / Intake</td>
                    <td className="py-2.5 px-3">Calf rearing or baseline acquisition</td>
                    <td className="py-2.5 px-3 text-red-600 font-bold">Expense</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(500)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">Feed & Rations (Lifetime)</td>
                    <td className="py-2.5 px-3">Concentrate, silage & hay consumption</td>
                    <td className="py-2.5 px-3 text-red-600 font-bold">Expense</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(totalCost - 545)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">Veterinary & Health</td>
                    <td className="py-2.5 px-3">Vaccines, treatments, and foot care</td>
                    <td className="py-2.5 px-3 text-red-600 font-bold">Expense</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(45)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-emerald-50/50">
                    <td className="py-2.5 px-3 font-bold text-emerald-800">Cumulative Milk / Beef Sales</td>
                    <td className="py-2.5 px-3 text-emerald-900">Commercial market sales credited to this tag</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">Revenue</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{formatCurrency(totalRevenue)}</td>
                  </tr>
                  {animal.status === 'sold' && (
                    <tr className="hover:bg-emerald-100/60 bg-emerald-100/40">
                      <td className="py-2.5 px-3 font-black text-emerald-900">Direct Livestock Sale (Transfer)</td>
                      <td className="py-2.5 px-3 text-emerald-950">Sold to {animal.soldBuyer || 'Buyer'} on {formatDate(animal.soldDate)}</td>
                      <td className="py-2.5 px-3 text-emerald-800 font-bold">Commercial Asset Sale</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-800">
                        {formatCurrency(animal.soldPrice || 0)} <span className="text-[10px] text-emerald-700 block">(+{formatCurrency(animal.soldProfit || 0)} profit)</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Action Modal */}
      <QuickLogModal
        isOpen={quickLogModal.isOpen}
        defaultType={quickLogModal.type}
        preselectedAnimal={animal}
        onClose={() => setQuickLogModal({ isOpen: false, type: 'milk' })}
      />

      {/* Commercial Sell Animal Modal */}
      <SellAnimalModal
        isOpen={sellModalOpen}
        selectedAnimalId={animal.id}
        onClose={() => setSellModalOpen(false)}
      />

      {/* Printable Animal Passport & Health PDF Dossier */}
      <AnimalPrintDossier
        animal={animal}
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
      />
    </div>
  );
};
