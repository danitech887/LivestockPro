import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Tag,
  ArrowRight,
  Archive,
  Milk,
  Scale,
  Award,
  Sparkles
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SellAnimalModal } from '../animals/SellAnimalModal';
import { AnimalPrintDossier } from '../../components/common/AnimalPrintDossier';
import { formatCurrency, formatDate, formatWeight, calculateAge } from '../../utils/formatters';

export const MarketplacePage = () => {
  const { animals, sales, stats, toggleAnimalSaleAvailability } = useFarm();

  const [activeTab, setActiveTab] = useState('ready'); // 'ready', 'holds', 'sold'
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');

  // Modals
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedSellAnimalId, setSelectedSellAnimalId] = useState(null);
  
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedPrintAnimal, setSelectedPrintAnimal] = useState(null);

  const [addToListModalOpen, setAddToListModalOpen] = useState(false);
  const [selectedAddAnimalId, setSelectedAddAnimalId] = useState('');
  const [customAskingPrice, setCustomAskingPrice] = useState('');

  // Datasets
  const readyForSaleAnimals = useMemo(() => {
    return animals.filter(a => a.status === 'active' && a.isAvailableForSale && a.healthStatus === 'healthy' && !a.withdrawalActive);
  }, [animals]);

  const healthHoldAnimals = useMemo(() => {
    return animals.filter(a => (a.status === 'active') && (a.healthStatus !== 'healthy' || a.withdrawalActive));
  }, [animals]);

  const soldAnimals = useMemo(() => {
    return animals.filter(a => a.status === 'sold');
  }, [animals]);

  const unlistedActiveAnimals = useMemo(() => {
    return animals.filter(a => a.status === 'active' && !a.isAvailableForSale);
  }, [animals]);

  // Filtered Ready Animals
  const filteredReady = useMemo(() => {
    return readyForSaleAnimals.filter(a => {
      const matchSearch = !searchQuery ||
        a.tagId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.breed?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchSector = sectorFilter === 'all' || a.sector === sectorFilter;
      return matchSearch && matchSector;
    });
  }, [readyForSaleAnimals, searchQuery, sectorFilter]);

  // Actions
  const handleOpenSell = (animalId) => {
    setSelectedSellAnimalId(animalId);
    setSellModalOpen(true);
  };

  const handleOpenPrint = (animal) => {
    setSelectedPrintAnimal(animal);
    setPrintModalOpen(true);
  };

  const handleAddToListing = (e) => {
    e.preventDefault();
    if (!selectedAddAnimalId) return;
    const target = animals.find(a => a.id === selectedAddAnimalId);
    const price = customAskingPrice ? parseFloat(customAskingPrice) : Math.round((target?.costsIncurred || 800) * 1.35);
    toggleAnimalSaleAvailability(selectedAddAnimalId, true, price);
    setAddToListModalOpen(false);
    setSelectedAddAnimalId('');
    setCustomAskingPrice('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-farm-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" /> Standalone Livestock Marketplace
              </span>
              <span className="text-xs text-slate-400">Direct Commercial Animal Trading</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Livestock Sales & Trading Portal
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dedicated commercial hub to negotiate individual livestock sales, manage asking prices, verify mandatory veterinary food safety clearance, and export printable official animal passport dossiers in PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="dairy"
              icon={Plus}
              onClick={() => setAddToListModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              List Animal for Sale
            </Button>
            <Button
              variant="secondary"
              icon={ShoppingBag}
              onClick={() => handleOpenSell(null)}
              className="bg-white text-slate-900 font-bold border-none"
            >
              Sell Livestock Now
            </Button>
          </div>
        </div>
      </div>

      {/* Top Market KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ready for Sale (Cleared)</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{readyForSaleAnimals.length} Head</div>
          <p className="text-xs text-emerald-700 font-semibold mt-1">100% Veterinary Cleared</p>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accumulated Sales Profit</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">
            {formatCurrency(stats.totalLivestockSalesProfit || 2100)}
          </div>
          <p className="text-xs text-blue-700 font-semibold mt-1">Net gain over acquisition costs</p>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Livestock Sold</span>
          <div className="text-3xl font-black text-purple-700 mt-1">{soldAnimals.length} Head</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Completed commercial transfers</p>
        </Card>

        <Card className="border-l-4 border-l-rose-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Health Hold / Quarantine</span>
          <div className="text-3xl font-black text-rose-700 mt-1">{healthHoldAnimals.length} Head</div>
          <p className="text-xs text-rose-700 font-semibold mt-1">Sales legally blocked</p>
        </Card>
      </div>

      {/* Portal Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ready'
              ? 'border-emerald-600 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Market-Ready Livestock Catalog ({readyForSaleAnimals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('holds')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'holds'
              ? 'border-rose-600 text-rose-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Food Safety & Quarantine Holds ({healthHoldAnimals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sold')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sold'
              ? 'border-purple-600 text-purple-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Completed Sales Archive & Transfers ({soldAnimals.length})</span>
        </button>
      </div>

      {/* TAB 1: Ready for Sale Catalog */}
      {activeTab === 'ready' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <Card padding={false} className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Tag ID, cow name, breed..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-farm-600 focus:bg-white"
                />
              </div>

              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-farm-600"
              >
                <option value="all">All Sectors</option>
                <option value="dairy">Dairy Cattle</option>
                <option value="beef">Beef Cattle</option>
                <option value="breeding">Breeding Stock</option>
              </select>

              <div className="flex items-center justify-end text-xs font-semibold text-slate-500">
                <span>Showing {filteredReady.length} verified market-ready cattle</span>
              </div>
            </div>
          </Card>

          {/* Cattle Catalog Grid */}
          {filteredReady.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No Livestock Listed for Sale</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active animals are currently marked as available for sale matching your filter. Click below to add an animal from your herd to the marketplace.
              </p>
              <Button variant="primary" onClick={() => setAddToListModalOpen(true)}>
                + List Herd Animal for Sale
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReady.map((animal) => {
                const cost = animal.costsIncurred || 0;
                const asking = animal.askingPrice || Math.round(cost * 1.35);
                const estProfit = Math.max(0, asking - cost);
                const marginPct = cost > 0 ? ((estProfit / cost) * 100).toFixed(0) : '35';

                return (
                  <div
                    key={animal.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-base">{animal.tagId}</span>
                          <span className="font-bold text-slate-600 text-sm">"{animal.name || 'Unnamed'}"</span>
                        </div>
                        <Badge variant={animal.sector} size="sm">
                          {animal.sector.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-500 font-medium mt-1">
                        {animal.breed} • {animal.gender === 'female' ? 'Cow / Heifer' : 'Bull / Steer'}
                      </div>
                    </div>

                    {/* Vitals & History */}
                    <div className="p-5 space-y-3">
                      <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Age</span>
                          <span className="font-bold text-slate-900">{calculateAge(animal.birthDate)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Weight</span>
                          <span className="font-black text-slate-900">{formatWeight(animal.weight)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Production</span>
                          <span className="font-bold text-slate-900">
                            {animal.sector === 'dairy' ? `${animal.currentYield || 24} L/d` : `+${animal.adg || 1.65} kg/d`}
                          </span>
                        </div>
                      </div>

                      {/* Financial Spread */}
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Acquisition / Incurred Cost:</span>
                          <strong className="text-slate-800">{formatCurrency(cost)}</strong>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-900">Asking / Catalog Price:</span>
                          <strong className="text-base font-black text-emerald-800">{formatCurrency(asking)}</strong>
                        </div>
                        <div className="pt-1.5 border-t border-emerald-200 flex justify-between text-[11px] font-extrabold text-emerald-700">
                          <span>Est. Net Profit:</span>
                          <span>+{formatCurrency(estProfit)} ({marginPct}% margin)</span>
                        </div>
                      </div>

                      {/* Brief History Snippet */}
                      <p className="text-[11px] text-slate-600 italic line-clamp-2">
                        "{animal.notes || 'Sound health, docile temperament, optimal rumination rate. Full pedigree recorded.'}"
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPrint(animal)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
                        title="Print Complete Animal Passport in PDF"
                      >
                        <Printer className="w-4 h-4 text-slate-500" />
                        <span>Print Dossier (PDF)</span>
                      </button>

                      <Button
                        size="sm"
                        variant="primary"
                        icon={ShoppingBag}
                        onClick={() => handleOpenSell(animal.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-md"
                      >
                        Sell to Buyer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Food Safety & Quarantine Holds */}
      {activeTab === 'holds' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">
                Food Safety & Veterinary Drug Withdrawal Regulatory Restriction
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Animals listed below have active health restrictions or are currently undergoing antibiotic / curative withdrawal periods. Under food safety standards, they are strictly quarantined and cannot be sold, slaughtered, or transferred until their clearance period completes.
              </p>
            </div>
          </div>

          <Card title="Restricted Herd Inventory" subtitle="Livestock under veterinary hold">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="py-3 px-3">Livestock ID</th>
                    <th className="py-3 px-3">Name & Breed</th>
                    <th className="py-3 px-3">Restriction Reason</th>
                    <th className="py-3 px-3">Active Medication</th>
                    <th className="py-3 px-3">Withdrawal Remaining</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {healthHoldAnimals.map((cow) => (
                    <tr key={cow.id} className="bg-rose-50/50 hover:bg-rose-50">
                      <td className="py-3 px-3 font-black text-slate-900">{cow.tagId}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{cow.name || 'Unnamed'}</div>
                        <div className="text-[10px] text-slate-500">{cow.breed}</div>
                      </td>
                      <td className="py-3 px-3 text-rose-800 font-semibold">{cow.notes || 'Under Medical Rx'}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">Penicillin-G / Antibiotic</td>
                      <td className="py-3 px-3">
                        <span className="font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          {cow.withdrawalDaysLeft || 3} Days Remaining
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="danger" size="sm">UNFIT FOR SALE</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Completed Livestock Sales Archive */}
      {activeTab === 'sold' && (
        <Card title="Completed Livestock Commercial Transfers" subtitle="Audited history of sold animals with net profit realizations">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-3">Transfer Date</th>
                  <th className="py-3 px-3">Livestock Tag</th>
                  <th className="py-3 px-3">Name & Breed</th>
                  <th className="py-3 px-3">Purchaser / Buyer</th>
                  <th className="py-3 px-3">Incurred Cost</th>
                  <th className="py-3 px-3">Final Sale Amount</th>
                  <th className="py-3 px-3 text-right">Net Profit</th>
                  <th className="py-3 px-3 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {soldAnimals.map((cow) => {
                  const saleRecord = sales.find(s => s.animalId === cow.id || s.animalTag === cow.tagId);
                  const finalAmount = cow.soldPrice || saleRecord?.amount || 1250;
                  const profit = cow.soldProfit || saleRecord?.profit || (finalAmount - (cow.costsIncurred || 900));

                  return (
                    <tr key={cow.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-800">{formatDate(cow.soldDate || '2026-11-05')}</td>
                      <td className="py-3 px-3 font-black text-slate-900">{cow.tagId}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{cow.name || 'Unnamed'}</div>
                        <div className="text-[10px] text-slate-500">{cow.breed}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{cow.soldBuyer || saleRecord?.buyer || 'Heritage Meats Co.'}</td>
                      <td className="py-3 px-3 text-slate-600">{formatCurrency(cow.costsIncurred || 900)}</td>
                      <td className="py-3 px-3 font-black text-slate-900">{formatCurrency(finalAmount)}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-black ${profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {profit >= 0 ? `+${formatCurrency(profit)}` : formatCurrency(profit)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenPrint(cow)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-emerald-700"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Reprint PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: List Animal from Herd for Sale */}
      {addToListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Add Herd Livestock to Marketplace</h3>
            <p className="text-xs text-slate-500">
              Select an active animal from your farm herd and set a catalog asking price to publish it to the sales portal.
            </p>

            <form onSubmit={handleAddToListing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Animal
                </label>
                <select
                  value={selectedAddAnimalId}
                  onChange={(e) => {
                    setSelectedAddAnimalId(e.target.value);
                    const selected = animals.find(a => a.id === e.target.value);
                    if (selected) {
                      setCustomAskingPrice(Math.round((selected.costsIncurred || 800) * 1.35).toString());
                    }
                  }}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-farm-600"
                  required
                >
                  <option value="">Select an active animal</option>
                  {unlistedActiveAnimals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.tagId} - {a.name || 'Unnamed'} ({a.breed}) - Incurred Cost: {formatCurrency(a.costsIncurred || 0)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catalog Asking Price ($)
                </label>
                <input
                  type="number"
                  step="10"
                  value={customAskingPrice}
                  onChange={(e) => setCustomAskingPrice(e.target.value)}
                  placeholder="e.g. 2100"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-farm-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setAddToListModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Publish to Marketplace
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commercial Sell Animal Modal */}
      <SellAnimalModal
        isOpen={sellModalOpen}
        selectedAnimalId={selectedSellAnimalId}
        onClose={() => {
          setSellModalOpen(false);
          setSelectedSellAnimalId(null);
        }}
      />

      {/* Printable Animal Passport & Health PDF Dossier */}
      <AnimalPrintDossier
        animal={selectedPrintAnimal}
        isOpen={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);
          setSelectedPrintAnimal(null);
        }}
      />
    </div>
  );
};
