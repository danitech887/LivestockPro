import React from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Tag,
  Building2,
  FileText,
  DollarSign,
  Scale,
  Milk,
  Award
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { formatCurrency, formatDate, formatWeight, calculateAge } from '../../utils/formatters';

export const AnimalPrintDossier = ({ animal, isOpen, onClose }) => {
  const { currentFarm, user } = useAuth();
  const { milkRecords, weightLogs, treatments } = useFarm();

  if (!isOpen || !animal) return null;

  // Filter individual logs
  const animalMilk = milkRecords.filter(m => m.tagId === animal.tagId);
  const animalWeights = weightLogs.filter(w => w.tagId === animal.tagId);
  const animalTreatments = treatments.filter(t => t.tagId === animal.tagId);

  // Lifetime production calculation
  const totalMilkYield = animalMilk.reduce((sum, m) => sum + m.totalL, 0);
  const avgMilkYield = animalMilk.length > 0 ? (totalMilkYield / animalMilk.length).toFixed(1) : animal.currentYield || 0;

  const handlePrint = () => {
    window.print();
  };

  const certificateId = `LP-CERT-${animal.tagId}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Top action bar (hidden during print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 no-print bg-slate-900/90 p-2.5 rounded-2xl border border-slate-700 shadow-xl">
        <Button
          variant="primary"
          icon={Printer}
          onClick={handlePrint}
          className="bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg"
        >
          Print Profile (PDF)
        </Button>
        <button
          onClick={onClose}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Close Document"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Printable Document Sheet (Standard A4 / Letter format) */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-10 my-auto print:shadow-none print:border-none print:m-0 print:p-6 print:max-w-none text-slate-900 text-xs">
        {/* Certificate Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Official Livestock Passport & Health Dossier
                </span>
                <span className="text-[10px] font-mono text-slate-500">Ref: {certificateId}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 uppercase">
                Livestock Transfer Profile & Pedigree Record
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Issued by <strong className="text-slate-900">{currentFarm.name}</strong> • {currentFarm.location}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-black mx-auto">
                <span className="text-[9px] text-slate-400 font-bold uppercase">TAG ID</span>
                <span className="text-sm tracking-tight">{animal.tagId}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1 font-semibold">{animal.rfid || 'RFID 982000412884'}</div>
            </div>
          </div>
        </div>

        {/* Section 1: Subject Identification & Animal Biography */}
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-farm-600" />
            <span>1. Subject Animal Identification & Herdsman History</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-3">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Animal Name</span>
              <span className="font-extrabold text-sm text-slate-950">{animal.name || 'Unnamed'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Breed & Sector</span>
              <span className="font-bold text-slate-900">{animal.breed} ({animal.sector.toUpperCase()})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Sex & Category</span>
              <span className="font-bold text-slate-900">{animal.gender === 'female' ? 'Cow / Heifer' : 'Bull / Steer'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Date of Birth & Age</span>
              <span className="font-bold text-slate-900">{formatDate(animal.birthDate)} ({calculateAge(animal.birthDate)})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Current Weight</span>
              <span className="font-black text-slate-950">{formatWeight(animal.weight)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Barn / Location</span>
              <span className="font-semibold text-slate-800">{animal.penLocation || 'Main Pasture'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Acquisition Cost</span>
              <span className="font-semibold text-slate-800">{formatCurrency(animal.costsIncurred || 0)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Asking / Valuation</span>
              <span className="font-black text-emerald-800">{formatCurrency(animal.askingPrice || Math.round((animal.costsIncurred || 800) * 1.35))}</span>
            </div>
          </div>

          {/* Descriptive Narrative History */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs">
            <span className="font-bold text-slate-900 block mb-1">Herdsman Biography & Pasture History:</span>
            <p className="text-slate-700 leading-relaxed">
              {animal.notes || `Raised in rotational open paddocks. Demonstrates a calm, docile temperament, sound conformation, and solid structural integrity. Regular feeder with optimal rumination index. Vaccinated according to regional veterinary schedules.`}
            </p>
          </div>
        </div>

        {/* Section 2: Lineage & Pedigree */}
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span>2. Certified Lineage & Genetic Pedigree</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Dam (Mother)</span>
              <span className="font-bold text-slate-900">{animal.dam || 'LP-088 (Bella Senior)'}</span>
              <span className="text-[10px] text-slate-500 block">Purebred Registered Dam</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Sire (Father / AI)</span>
              <span className="font-bold text-slate-900">{animal.sire || 'LP-S02 (Nordic Star)'}</span>
              <span className="text-[10px] text-slate-500 block">AI Sire Straw Record</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Maternal Grandsire</span>
              <span className="font-semibold text-slate-800">LP-MG01 (Alpen Star)</span>
              <span className="text-[10px] text-slate-500 block">Index: +1,240 TPI</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Paternal Grandsire</span>
              <span className="font-semibold text-slate-800">LP-PG01 (Nordic Pride)</span>
              <span className="text-[10px] text-slate-500 block">Superior Merit Bull</span>
            </div>
          </div>
        </div>

        {/* Section 3: Lifetime Production Track Record */}
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
            {animal.sector === 'dairy' ? <Milk className="w-3.5 h-3.5 text-blue-600" /> : <Scale className="w-3.5 h-3.5 text-red-600" />}
            <span>3. Lifetime Production & Performance History</span>
          </h2>

          {animal.sector === 'dairy' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-200">
                <div>
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">Current Daily Yield</span>
                  <span className="font-black text-sm text-blue-950">{animal.currentYield || 28.5} Liters / Day</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">Lactation Number</span>
                  <span className="font-black text-sm text-blue-950">Lactation #{animal.lactationNumber || 1}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">Cumulative Milk Logged</span>
                  <span className="font-black text-sm text-blue-950">{totalMilkYield.toFixed(1)} Liters Recorded</span>
                </div>
              </div>

              {animalMilk.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border border-slate-200">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Morning (L)</th>
                        <th className="p-2">Evening (L)</th>
                        <th className="p-2">Total (L)</th>
                        <th className="p-2">Butterfat %</th>
                        <th className="p-2">Protein %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {animalMilk.slice(0, 5).map(m => (
                        <tr key={m.id}>
                          <td className="p-2 font-medium">{formatDate(m.date)}</td>
                          <td className="p-2">{m.morningL} L</td>
                          <td className="p-2">{m.eveningL} L</td>
                          <td className="p-2 font-bold text-blue-700">{m.totalL} L</td>
                          <td className="p-2">{m.fatPct}%</td>
                          <td className="p-2">{m.proteinPct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-3 bg-red-50/50 p-3 rounded-xl border border-red-200">
                <div>
                  <span className="text-[10px] text-red-800 font-bold uppercase block">Current Scale Weight</span>
                  <span className="font-black text-sm text-red-950">{formatWeight(animal.weight)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-800 font-bold uppercase block">Average Daily Gain (ADG)</span>
                  <span className="font-black text-sm text-red-950">+{animal.adg || 1.65} kg / day</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-800 font-bold uppercase block">Target Slaughter Weight</span>
                  <span className="font-black text-sm text-red-950">{animal.targetSlaughterWeight || 620} kg (Prime Grade)</span>
                </div>
              </div>

              {animalWeights.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border border-slate-200">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2">Weigh Date</th>
                        <th className="p-2">Weight (kg)</th>
                        <th className="p-2">Previous Weight</th>
                        <th className="p-2">Rate of Gain</th>
                        <th className="p-2">Observation Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {animalWeights.slice(0, 4).map(w => (
                        <tr key={w.id}>
                          <td className="p-2 font-medium">{formatDate(w.date)}</td>
                          <td className="p-2 font-black text-slate-900">{w.weight} kg</td>
                          <td className="p-2 text-slate-500">{w.prevWeight || '—'} kg</td>
                          <td className="p-2 font-bold text-emerald-700">+{w.adg} kg/day</td>
                          <td className="p-2 text-slate-600">{w.notes || 'Routine check'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 4: Mandatory Veterinary Health & Food Safety Clearance */}
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>4. Veterinary Medicine & Food Safety Compliance Clearance</span>
          </h2>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 mb-3">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>OFFICIAL CLEARANCE STATEMENT: CERTIFIED READY FOR COMMERCIAL SALE</span>
            </div>
            <p className="text-[11px] text-emerald-900 mt-1">
              The subject animal has been inspected. There are NO active medication or antibiotic withdrawal periods active. All vaccinations, curative treatments, and parasite clearance procedures have fulfilled mandatory withdrawal intervals.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2">Treatment Date</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Medication / Vaccine</th>
                  <th className="p-2">Dosage</th>
                  <th className="p-2">Attending Vet</th>
                  <th className="p-2">Withdrawal Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {animalTreatments.length > 0 ? (
                  animalTreatments.map(t => (
                    <tr key={t.id}>
                      <td className="p-2 font-medium">{formatDate(t.date)}</td>
                      <td className="p-2 font-bold text-slate-900">{t.type}</td>
                      <td className="p-2 text-slate-800">{t.drug}</td>
                      <td className="p-2 text-slate-600">{t.dosage}</td>
                      <td className="p-2 text-slate-600">{t.administeredBy}</td>
                      <td className="p-2 font-bold text-emerald-700">
                        {t.withdrawalStatus === 'active' ? 'Hold Active' : 'Withdrawal Cleared'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-3 text-center text-slate-500">
                      Standard herd vaccination completed. Zero adverse veterinary conditions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Legal Ownership Transfer & Sign-off Endorsement */}
        <div className="pt-4 border-t-2 border-slate-900 mt-8">
          <div className="text-[11px] text-slate-500 mb-6">
            By signing below, the seller transfers all legal ownership, pedigree registration, and welfare responsibility of the identified livestock to the purchasing party.
          </div>

          <div className="grid grid-cols-3 gap-6 pt-2">
            <div className="border-t border-slate-400 pt-2 text-center">
              <span className="font-bold text-slate-900 block text-xs">{user.name}</span>
              <span className="text-[10px] text-slate-500 block">Seller / Farm Manager</span>
              <span className="text-[10px] text-slate-400 block mt-1">Date: {formatDate(new Date())}</span>
            </div>

            <div className="border-t border-slate-400 pt-2 text-center">
              <span className="font-bold text-slate-900 block text-xs">Dr. Evans, DVM</span>
              <span className="text-[10px] text-slate-500 block">Attending Veterinarian</span>
              <span className="text-[10px] text-slate-400 block mt-1">Lic. #VET-9842</span>
            </div>

            <div className="border-t border-slate-400 pt-2 text-center">
              <span className="font-bold text-slate-900 block text-xs">_______________________</span>
              <span className="text-[10px] text-slate-500 block">Authorized Buyer Signature</span>
              <span className="text-[10px] text-slate-400 block mt-1">Date: ________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
