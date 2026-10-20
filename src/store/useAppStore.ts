import { create } from 'zustand';
import { DepartmentId } from '../types/schema';

export type NavTab =
  | 'dashboard'
  | 'dialysis'
  | 'daily_entry'
  | 'financials'
  | 'rate_card'
  | 'export'
  | 'capacity';

interface AppState {
  branchId: 'ALL' | string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  department: 'ALL' | DepartmentId;
  activeTab: NavTab;
  isSampleDataLoaded: boolean;
  isEdited: boolean;

  setBranchId: (branchId: 'ALL' | string) => void;
  setDateRange: (start: string, end: string) => void;
  setDepartment: (dept: 'ALL' | DepartmentId) => void;
  setActiveTab: (tab: NavTab) => void;
  setMetaStatus: (loaded: boolean, edited: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  branchId: 'ALL',
  // Default covers the 6-month seed period (Apr 2026 to Sep 2026)
  startDate: '2026-04-01',
  endDate: '2026-09-30',
  department: 'ALL',
  activeTab: 'dashboard',
  isSampleDataLoaded: false,
  isEdited: false,

  setBranchId: (branchId) => set({ branchId }),
  setDateRange: (startDate, endDate) => set({ startDate, endDate }),
  setDepartment: (department) => set({ department }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setMetaStatus: (isSampleDataLoaded, isEdited) => set({ isSampleDataLoaded, isEdited }),
}));
