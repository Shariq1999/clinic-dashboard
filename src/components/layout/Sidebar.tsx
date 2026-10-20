import React from 'react';
import { useAppStore, NavTab } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Activity,
  FileSpreadsheet,
  CircleDollarSign,
  Tag,
  Sliders,
  Download,
  Stethoscope,
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  sublabel?: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Executive Overview',
    sublabel: 'Consolidated KPIs & P&L',
    icon: LayoutDashboard,
  },
  {
    id: 'dialysis',
    label: 'Dialysis Slot Grid',
    sublabel: 'Shift booking & occupancy',
    icon: Activity,
  },
  {
    id: 'daily_entry',
    label: 'Daily Revenue Grid',
    sublabel: 'Multi-service spreadsheet',
    icon: FileSpreadsheet,
  },
  {
    id: 'financials',
    label: 'Financials & OPEX',
    sublabel: 'Cost buckets & payouts',
    icon: CircleDollarSign,
  },
  {
    id: 'rate_card',
    label: 'Rate Card & Payouts',
    sublabel: 'Catalog & branch overrides',
    icon: Tag,
  },
  {
    id: 'capacity',
    label: 'Capacity Log',
    sublabel: 'Machine & shift audit',
    icon: Sliders,
  },
  {
    id: 'export',
    label: 'Data Portability',
    sublabel: 'Excel, CSV, JSON state',
    icon: Download,
  },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/40">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-tight leading-tight">
            ClinicChain
          </h1>
          <p className="text-[11px] text-teal-400 font-medium">Diagnostics & Dialysis</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Management Console
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs leading-none">{item.label}</div>
                {item.sublabel && (
                  <div
                    className={`text-[10px] truncate mt-1 ${
                      isActive ? 'text-teal-100' : 'text-slate-500'
                    }`}
                  >
                    {item.sublabel}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 bg-slate-950/20">
        <div className="flex items-center justify-between mb-1">
          <span>Target FY:</span>
          <span className="text-slate-300 font-mono font-medium">2026–2027</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Engine Mode:</span>
          <span className="text-teal-400 font-medium">IndexedDB Local</span>
        </div>
      </div>
    </aside>
  );
};
