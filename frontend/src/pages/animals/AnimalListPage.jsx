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
  SlidersHorizontal
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { AddAnimalModal } from './AddAnimalModal';
import { QuickLogModal } from '../../components/common/QuickLogModal';
import { calculateAge, formatWeight, formatCurrency } from '../../utils/formatters';

export const AnimalListPage = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const { filteredAnimals, sectorFilter, setSectorFilter } = useFarm();

  const [searchQuery, setSearchQuery] = useState('');
  const [breedFilter, setBreedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all'); // 'calf' (<1y), 'young' (1-2y), 'adult' (>2y)
  
  const [addModalOpen, setAddModalOpen] = useState(false);
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
  }, [filteredAnimals, effectiveSearch, breedFilter, statusFilter, ageGroupFilter]);

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
              {row.withdrawalActive && (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold flex items-center gap-0.5 border border-amber-300 animate-pulse">
                  <ShieldAlert className="w-3 h-3 text-amber-700" />
                  HOLD ({row.withdrawalDaysLeft}d)
                </span>
              )}
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
      header: 'Current Performance',
      accessor: 'currentYield',
      render: (row) => {
        if (row.sector === 'dairy') {
          return (
            <div>
              <div className="flex items-center gap-1 font-bold text-blue-700 text-xs">
                <Milk className="w-3.5 h-3.5" />
                <span>{row.currentYield ? `${row.currentYield} L/day` : 'Dry'}</span>
              </div>
              <div className="text-[11px] text-slate-500">Lactation #{row.lactationNumber || 1}</div>
            </div>
          );
        }
        if (row.sector === 'beef') {
          return (
            <div>
              <div className="flex items-center gap-1 font-bold text-red-700 text-xs">
                <Scale className="w-3.5 h-3.5" />
                <span>+{row.adg || 1.65} kg/day ADG</span>
              </div>
              <div className="text-[11px] text-slate-500">Target: {row.targetSlaughterWeight || 610} kg</div>
            </div>
          );
        }
        return <span className="text-xs text-slate-500 font-medium">Breeding Herd</span>;
      }
    },
    {
      header: 'Location / Pen',
      accessor: 'penLocation',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
          {row.penLocation || 'General Pasture'}
        </span>
      )
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
      header: 'Quick Action',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.sector === 'dairy' && (
            <button
              onClick={() => setQuickLogModal({ isOpen: true, type: 'milk', animal: row })}
              className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              title="Quick Log Milk"
            >
              <Milk className="w-4 h-4" />
            </button>
          )}
          {row.sector === 'beef' && (
            <button
              onClick={() => setQuickLogModal({ isOpen: true, type: 'weight', animal: row })}
              className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
              title="Record Weight"
            >
              <Scale className="w-4 h-4" />
            </button>
          )}
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
      )
    }
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Livestock Registry & Lineage
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-0.5">
            Individual animal profiles, pedigree records, lactation logs, and life-cycle financial ledgers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setAddModalOpen(true)}
          >
            Register Livestock
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card padding={false} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <option value="all">All Statuses</option>
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

      <QuickLogModal
        isOpen={quickLogModal.isOpen}
        defaultType={quickLogModal.type}
        preselectedAnimal={quickLogModal.animal}
        onClose={() => setQuickLogModal({ isOpen: false, type: 'milk', animal: null })}
      />
    </div>
  );
};
