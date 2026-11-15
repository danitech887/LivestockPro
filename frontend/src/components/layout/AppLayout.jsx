import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { OfflineBanner } from '../common/OfflineBanner';
import { QuickLogModal } from '../common/QuickLogModal';

export const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Collapsible Sidebar (Desktop) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenQuickLog={() => setQuickLogOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Navigation */}
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Offline & Sync Status Banner */}
        <OfflineBanner />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 pb-24 md:pb-6">
          <Outlet context={{ searchTerm }} />
        </main>

        {/* Mobile Navigation Bar */}
        <MobileNav onOpenQuickLog={() => setQuickLogOpen(true)} />
      </div>

      {/* Quick Entry Modal */}
      <QuickLogModal
        isOpen={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
      />
    </div>
  );
};
