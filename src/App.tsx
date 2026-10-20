import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Dialysis } from './pages/Dialysis';
import { DailyEntry } from './pages/DailyEntry';
import { Financials } from './pages/Financials';
import { RateCard } from './pages/RateCard';
import { Settings } from './pages/Settings';
import { DataExport } from './pages/DataExport';
import { db } from './db/database';

export const App: React.FC = () => {
  const { activeTab, setMetaStatus } = useAppStore();

  // On mount, sync meta status
  useEffect(() => {
    async function checkMeta() {
      const isLoaded = await db.meta.get('isSampleDataLoaded');
      const isEdited = await db.meta.get('isEdited');
      setMetaStatus(Boolean(isLoaded?.value ?? true), Boolean(isEdited?.value ?? false));
    }
    checkMeta();
  }, [setMetaStatus]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'dialysis':
        return <Dialysis />;
      case 'daily_entry':
        return <DailyEntry />;
      case 'financials':
        return <Financials />;
      case 'rate_card':
        return <RateCard />;
      case 'capacity':
        return <Settings />;
      case 'export':
        return <DataExport />;
      default:
        return <Dashboard />;
    }
  };

  return <AppShell>{renderActiveTab()}</AppShell>;
};

export default App;
