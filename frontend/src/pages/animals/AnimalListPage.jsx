import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Plus,
  Filter,
  Search,
  Milk,
  Scale,
  Stethoscope,
  ShieldAlert,
  ChevronRight,
  Download,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { AddAnimalModal } from './AddAnimalModal';
import { QuickLogModal } from '../../components/common/QuickLogModal';
import { SellAnimalModal } from './SellAnimalModal';
import { AnimalPrintDossier } from '../../components/common/AnimalPrintDossier';
import { calculateAge, formatWeight, formatCurrency } from '../../utils/formatters';

export const AnimalListPage = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const { filteredAnimals, sectorFilter, setSectorFilter, toggleAnimalSaleAvailability, stats } = useFarm();

  const [searchQuery, setSearchQuery] = useState('');
  const [breedFilter, setBreedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [saleAvailabilityFilter, setSaleAvailabilityFilter] = useState('all'); // 'all', 'available', 'not_listed', 'sold'
  const [ageGroupFilter, setAgeGroupFilter] = useState('all'); // 'calf' (<1y), 'young' (1-2y), 'adult' (>2y)
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedPrintAnimal, setSelectedPrintAnimal] = useState(null);
  const [selectedSellAnimalId, setSelectedSellAnimalId] = useState(null);
  const [quickLogModal, setQuickLogModal] = useState({ isOpen: false, type: 'milk', animal: null });

  // Effective search combines local search input and universal header search
  const effectiveSearch = (searchQuery || outletContext?.searchTerm || '').toLowerCase();

  // Breeds list
  const availableBreeds = useMemo(() => {
    const breeds = new Set(filteredAnimals.map(a => a.breed).filter(Boolean));
    return Array.from(breeds);
  }, [filteredAnimals]);

  // Filtered dataset
  const displayAnimals = useMemo(() => {
    return filteredAnimals.filter((animal) => {
      // Search
      const matchesSearch =
        !effectiveSearch ||
        animal.tagId?.toLowerCase().includes(effectiveSearch) ||
        animal.name?.toLowerCase().includes(effectiveSearch) ||
        animal.rfid?.toLowerCase().includes(effectiveSearch) ||
        animal.breed?.toLowerCase().includes(effectiveSearch) ||
        animal.penLocation?.toLowerCase().includes(effectiveSearch);

      if (!matchesSearch) return false;

      // Breed filter
      if (breedFilter !== 'all' && animal.breed !== breedFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && animal.status !== statusFilter) return false;

      // Sale availability filter
      if (saleAvailabilityFilter === 'available' && (!animal.isAvailableForSale || animal.status !== 'active')) return false;
      if (saleAvailabilityFilter === 'not_listed' && (animal.isAvailableForSale || animal.status !== 'active')) return false;
      if (saleAvailabilityFilter === 'sold' && animal.status !== 'sold') return false;

      // Age group
      if (ageGroupFilter !== 'all' && animal.birthDate) {
        const birth = new Date(animal.birthDate);
        const now = new Date();
        const ageYears = (now - birth) / (1000 * 60 * 60 * 24 * 365.25);
        if (ageGroupFilter === 'calf' && ageYears >= 1) return false;
        if (ageGroupFilter === 'young' && (ageYears < 1 || ageYears >= 2)) return false;
        if (ageGroupFilter === 'adult' && ageYears < 2) return false;
      }

      return true;
    });
  }, [filteredAnimals, effectiveSearch, breedFilter, statusFilter, saleAvailabilityFilter, ageGroupFilter]);

  const handleOpenSell = (animal) => {
    setSelectedSellAnimalId(animal.id);
    setSellModalOpen(true);
  };

  const columns = [
    {
      header: 'Livestock ID & Name',
      accessor: 'tagId',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-800 text-xs border border-slate-200 shrink-0">
            {row.tagId.replace('LP-', '')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{row.tagId}</span>
              {row.withdrawalActive ? (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold flex items-center gap-0.5 border border-amber-300 animate-pulse">
                  <ShieldAlert className="w-3 h-3 text-amber-700" />
                  HOLD ({row.withdrawalDaysLeft}d)
                </span>
              ) : row.healthStatus !== 'healthy' ? (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                  SICK
                </span>
              ) : row.isAvailableForSale && row.status === 'active' ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-extrabold border border-emerald-300">
                  FOR SALE
                </span>
              ) : null}
            </div>
            <div className="text-xs text-slate-500 font-medium">{row.name || 'Unnamed'} • {row.rfid || 'No RFID'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Sector & Breed',
      accessor: 'sector',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Badge variant={row.sector} size="sm">
              {row.sector.toUpperCase()}
            </Badge>
            <span className="text-xs text-slate-700 font-medium">{row.gender === 'female' ? 'Cow' : 'Bull'}</span>
          </div>
          <div className="text-xs text-slate-600 font-semibold">{row.breed}</div>
        </div>
      )
    },
    {
      header: 'Age & Weight',
      accessor: 'weight',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{formatWeight(row.weight)}</div>
          <div className="text-xs text-slate-500">{calculateAge(row.birthDate)} old</div>
        </div>
      )
    },
    {
      header: 'Costs & Valuation',
      accessor: 'costsIncurred',
      render: (row) => {
        const cost = row.costsIncurred || 0;
        const asking = row.askingPrice || Math.round(cost * 1.35);
        const estProfit = Math.max(0, asking - cost);

        return (
          <div>
            <div className="text-xs font-bold text-slate-900">
              Cost: <span className="text-slate-600">{formatCurrency(cost)}</span>
            </div>
            {row.status === 'sold' ? (
              <div className="text-[11px] font-extrabold text-emerald-700">
                Sold: {formatCurrency(row.soldPrice || 0)} (+{formatCurrency(row.soldProfit || 0)} profit)
              </div>
            ) : row.isAvailableForSale ? (
              <div className="text-[11px] font-bold text-emerald-700">
                Asking: {formatCurrency(asking)} (+{formatCurrency(estProfit)} est. profit)
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 font-medium">Est. Value: {formatCurrency(asking)}</div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Health / Safety Gate',
      accessor: 'healthStatus',
      render: (row) => {
        const isUnfit = row.healthStatus !== 'healthy' || row.withdrawalActive;
        if (isUnfit) {
          return (
            <span className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Unfit for Sale</span>
            </span>
          );
        }
        return (
          <span className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Health Cleared</span>
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status} size="sm">
          {row.status.toUpperCase()}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => {
        const isUnfit = row.healthStatus !== 'healthy' || row.withdrawalActive;

        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Direct Commercial Sell Button */}
            {row.status === 'active' && (
              <button
                onClick={() => handleOpenSell(row)}
                className={`p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                  isUnfit
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
                title={isUnfit ? 'Cannot sell: Animal has health restrictions or active drug withdrawal' : 'Sell Livestock (Negotiated Amount)'}
                disabled={isUnfit}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Sell</span>
              </button>
            )}

            {row.sector === 'dairy' && row.status === 'active' && (
              <button
                onClick={() => setQuickLogModal({ isOpen: true, type: 'milk', animal: row })}
                className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                title="Quick Log Milk"
              >
                <Milk className="w-4 h-4" />
              </button>
            )}
            {row.sector === 'beef' && row.status === 'active' && (
              <button
                onClick={() => setQuickLogModal({ isOpen: true, type: 'weight', animal: row })}
                className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                title="Record Weight"
              >
                <Scale className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setSelectedPrintAnimal(row);
                setPrintModalOpen(true);
              }}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Print Animal Dossier & Health Passport (PDF)"
            >
              <Printer className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => setQuickLogModal({ isOpen: true, type: 'treatment', animal: row })}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Add Health Event"
            >
              <Stethoscope className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/animals/${row.id}`)}
              className="p-2 rounded-lg hover:bg-farm-50 text-slate-400 hover:text-farm-700 transition-colors"
              title="View Full Profile"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Livestock Registry & Animal Sales
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-0.5">
            Manage individual cattle, commercial livestock sales, acquisition costs, and food-safety clearance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="dairy"
            icon={ShoppingBag}
            onClick={() => {
              setSelectedSellAnimalId(null);
              setSellModalOpen(true);
            }}
          >
            Sell Livestock
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setAddModalOpen(true)}
          >
            Register Intake
          </Button>
        </div>
      </div>

      {/* Livestock Sales Metrics Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Animals Available For Sale</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{stats.availableForSaleCount || 4} Head</span>
            <span className="text-xs text-emerald-600 font-semibold">Listed & Health Cleared</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Accumulated Livestock Sales Profit</span>
            <span className="text-2xl font-black text-emerald-700 mt-0.5 block">
              {formatCurrency(stats.totalLivestockSalesProfit || 2100)}
            </span>
            <span className="text-xs text-slate-500 font-medium">Net gain over acquisition costs</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Food Safety Clearance Holds</span>
            <span className={`text-2xl font-black mt-0.5 block ${stats.withdrawalCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {stats.withdrawalCount} Quarantine Hold{stats.withdrawalCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-slate-500 font-medium">Sale prohibited until clear</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card padding={false} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Text Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tag, RFID, Name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-farm-600 focus:bg-white"
            />
          </div>

          {/* Sale Availability Filter */}
          <select
            value={saleAvailabilityFilter}
            onChange={(e) => setSaleAvailabilityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-farm-600"
          >
            <option value="all">All Market Statuses</option>
            <option value="available">Available For Sale ({stats.availableForSaleCount || 4})</option>
            <option value="not_listed">Retained Herd (Not for Sale)</option>
            <option value="sold">Sold Livestock Archive</option>
          </select>

          {/* Breed Filter */}
          <select
            value={breedFilter}
            onChange={(e) => setBreedFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-farm-600"
          >
            <option value="all">All Breeds ({availableBreeds.length})</option>
            {availableBreeds.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-farm-600"
          >
            <option value="all">All Lifecycle Statuses</option>
            <option value="active">Active in Herd</option>
            <option value="sold">Sold</option>
            <option value="culled">Culled</option>
          </select>

          {/* Age Group Filter */}
          <select
            value={ageGroupFilter}
            onChange={(e) => setAgeGroupFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-farm-600"
          >
            <option value="all">All Age Groups</option>
            <option value="calf">Calves (&lt; 1 Year)</option>
            <option value="young">Youngstock (1 - 2 Years)</option>
            <option value="adult">Mature Cattle (&gt; 2 Years)</option>
          </select>
        </div>
      </Card>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={displayAnimals}
        keyExtractor={(item) => item.id}
        emptyMessage="No livestock found matching the selected filters."
        onRowClick={(row) => navigate(`/animals/${row.id}`)}
      />

      {/* Modals */}
      <AddAnimalModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <SellAnimalModal
        isOpen={sellModalOpen}
        selectedAnimalId={selectedSellAnimalId}
        onClose={() => {
          setSellModalOpen(false);
          setSelectedSellAnimalId(null);
        }}
      />

      <QuickLogModal
        isOpen={quickLogModal.isOpen}
        defaultType={quickLogModal.type}
        preselectedAnimal={quickLogModal.animal}
        onClose={() => setQuickLogModal({ isOpen: false, type: 'milk', animal: null })}
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
