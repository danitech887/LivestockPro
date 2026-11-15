import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload } from 'lucide-react';
import { useOfflineSync } from '../../context/OfflineSyncContext';

export const OfflineBanner = () => {
  const { isOnline, isSyncing, pendingCount, triggerSync, simulatedOffline, toggleSimulatedOffline } = useOfflineSync();

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      className={`w-full px-4 py-2.5 transition-all text-xs font-bold flex flex-wrap items-center justify-between gap-3 shadow-inner ${
        !isOnline
          ? 'bg-amber-500 text-slate-950 border-b border-amber-600'
          : isSyncing
          ? 'bg-sky-500 text-white'
          : 'bg-emerald-600 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
            <span>
              <strong>Field Offline Mode:</strong> Operating on local cached database. {pendingCount} change{pendingCount !== 1 ? 's' : ''} queued for sync.
            </span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
            <span>Syncing {pendingCount} queued records with cloud barn server...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Connected & Synced</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSimulatedOffline}
          className="px-2.5 py-1 rounded bg-black/20 hover:bg-black/30 transition-colors text-[11px] font-medium"
        >
          {simulatedOffline ? 'Disable Barn Offline Simulation' : 'Simulate Offline Barn'}
        </button>

        {isOnline && pendingCount > 0 && (
          <button
            type="button"
            onClick={triggerSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-slate-900 font-bold hover:bg-slate-100 shadow-sm transition-colors text-xs"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>
    </div>
  );
};
