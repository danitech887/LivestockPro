import React, { createContext, useContext, useState, useEffect } from 'react';

const OfflineSyncContext = createContext(null);

export const OfflineSyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingQueue, setPendingQueue] = useState(() => {
    try {
      const q = localStorage.getItem('livestockpro_offline_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });
  const [lastSyncTime, setLastSyncTime] = useState(() => new Date());

  // Listen to actual browser network events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save pendingQueue changes
  useEffect(() => {
    try {
      localStorage.setItem('livestockpro_offline_queue', JSON.stringify(pendingQueue));
    } catch (e) {
      console.error(e);
    }
  }, [pendingQueue]);

  const effectiveOnline = isOnline && !simulatedOffline;

  const triggerSync = async () => {
    if (!effectiveOnline || isSyncing) return;
    setIsSyncing(true);

    // Simulate batch sync over network
    setTimeout(() => {
      setPendingQueue([]);
      setIsSyncing(false);
      setLastSyncTime(new Date());
    }, 1200);
  };

  const queueAction = (action) => {
    const item = {
      id: `queue_${Date.now()}`,
      action,
      timestamp: new Date().toISOString()
    };
    setPendingQueue(prev => [item, ...prev]);

    if (effectiveOnline) {
      triggerSync();
    }
  };

  const toggleSimulatedOffline = () => {
    setSimulatedOffline(prev => {
      const next = !prev;
      if (!next && isOnline) {
        setTimeout(triggerSync, 300);
      }
      return next;
    });
  };

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline: effectiveOnline,
        realOnline: isOnline,
        simulatedOffline,
        toggleSimulatedOffline,
        isSyncing,
        pendingCount: pendingQueue.length,
        pendingQueue,
        lastSyncTime,
        triggerSync,
        queueAction
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);
  if (!context) throw new Error('useOfflineSync must be used within OfflineSyncProvider');
  return context;
};
