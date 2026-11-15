import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Users,
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

export const SettingsPage = () => {
  const { user, farms, currentFarm, setCurrentFarm } = useAuth();
  const { resetAllData, animals, milkRecords } = useFarm();
  const { isOnline, pendingCount, lastSyncTime, triggerSync } = useOfflineSync();

  const [farmName, setFarmName] = useState(currentFarm.name);
  const [farmLocation, setFarmLocation] = useState(currentFarm.location);
  const [currency, setCurrency] = useState('USD ($)');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveFarm = (e) => {
    e.preventDefault();
    setCurrentFarm({
      ...currentFarm,
      name: farmName,
      location: farmLocation
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const exportBackup = () => {
    const backupData = {
      farm: currentFarm,
      animals,
      milkRecords,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LivestockPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Farm Configuration & System Settings
        </h2>
        <p className="text-xs md:text-sm text-slate-600 mt-0.5">
          Enterprise setup, user role permissions, local database backup, and offline cache management.
        </p>
      </div>

      {/* Farm Profile Configuration */}
      <Card title="Farm & Ranch Profile" subtitle="General operation credentials" icon={Building2}>
        <form onSubmit={handleSaveFarm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Farm / Ranch Name"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              required
            />
            <Input
              label="Geographical Location / Pasture Region"
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Standard Valuation Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)', 'AUD ($)', 'KES (KSh)']}
            />
            <Select
              label="Unit Measurement System"
              value="Metric (kg / Liters)"
              options={['Metric (kg / Liters)', 'Imperial (lbs / Gallons)']}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedNotice ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Configuration Updated Successfully
              </span>
            ) : <span />}
            <Button type="submit" variant="primary">
              Save Farm Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Team & User Role Permissions */}
      <Card title="User Roles & Team Access" subtitle="Field worker permissions" icon={Users}>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-farm-600"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">{user.name} (You)</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
              OWNER / MANAGER
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                DE
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Dr. Evans</div>
                <div className="text-xs text-slate-500">evans@vetcare-agri.com</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">
              LICENSED VET (Rx SIGN-OFF)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                JM
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">John & Sarah</div>
                <div className="text-xs text-slate-500">milking-crew@livestockpro.farm</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-700">
              BARN MILKER & FEEDER
            </span>
          </div>
        </div>
      </Card>

      {/* Offline Diagnostics & Backup Settings */}
      <Card title="Offline Sync & Local Database Storage" subtitle="Emergency field caching resilience" icon={HardDrive}>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Network Sync Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                <span className="font-black text-slate-900 text-sm">
                  {isOnline ? 'Connected to Central Barn Relay' : 'Offline Cached Mode'}
                </span>
                <span className="text-xs text-slate-500">({pendingCount} pending updates queued)</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={triggerSync}
              disabled={!isOnline || pendingCount === 0}
            >
              Manual Cloud Sync
            </Button>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                icon={Download}
                onClick={exportBackup}
              >
                Export JSON Backup
              </Button>
            </div>

            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm('Reset all demo data to initial factory state?')) {
                  resetAllData();
                }
              }}
            >
              Reset Demo Records
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
