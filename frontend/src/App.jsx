import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import { FarmProvider } from './context/FarmContext';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AnimalListPage } from './pages/animals/AnimalListPage';
import { AnimalDetailPage } from './pages/animals/AnimalDetailPage';
import { ProductionOverviewPage } from './pages/production/ProductionOverviewPage';
import { HealthPage } from './pages/health/HealthPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { FinancePage } from './pages/finance/FinancePage';
import { SettingsPage } from './pages/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineSyncProvider>
        <AuthProvider>
          <FarmProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="animals" element={<AnimalListPage />} />
                  <Route path="animals/:id" element={<AnimalDetailPage />} />
                  <Route path="production" element={<ProductionOverviewPage />} />
                  <Route path="health" element={<HealthPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="finance" element={<FinancePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </FarmProvider>
        </AuthProvider>
      </OfflineSyncProvider>
    </QueryClientProvider>
  );
};

export default App;
