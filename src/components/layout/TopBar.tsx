import React from 'react';
import { useAppStore, NavTab } from '../../store/useAppStore';
import { BranchSelector } from '../ui/BranchSelector';
import { DepartmentSelector } from '../ui/DepartmentSelector';
import { DateRangePicker } from '../ui/DateRangePicker';
import { SampleDataBadge } from '../ui/SampleDataBadge';

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Executive Financial & Operational KPI Dashboard',
    subtitle: 'Consolidated multi-branch P&L, footfall, Sunday-safe occupancy & payouts',
  },
  dialysis: {
    title: 'Dialysis Shift Matrix & Occupancy Planner',
    subtitle: 'Interactive click-to-toggle booking grid with Sunday non-working lock',
  },
  daily_entry: {
    title: 'Daily Department Revenue & Footfall Entry',
    subtitle: 'Inline spreadsheet grid for real-time daily operational recording',
  },
  financials: {
    title: 'Monthly OPEX Cost Buckets & Doctor Payouts',
    subtitle: '6-bucket expense allocation with pro-rated daily calculations',
  },
  rate_card: {
    title: 'Service Catalog & Doctor Payout Configurator',
    subtitle: 'Master pricing, branch rate overrides & doctor revenue-share models',
  },
  capacity: {
    title: 'Dialysis Machine & Shift Capacity Logs',
    subtitle: 'Historical capacity timeline with strict retroactive calculation safeguards',
  },
  export: {
    title: 'Data Portability & Database State Operations',
    subtitle: 'Multi-tab Excel workbook, CSV export & complete JSON state migration',
  },
};

export const TopBar: React.FC = () => {
  const { activeTab } = useAppStore();
  const meta = TAB_TITLES[activeTab];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 shadow-xs">
      {/* Top row: Page title and Sample data badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
            {meta.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{meta.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <SampleDataBadge />
        </div>
      </div>

      {/* Bottom row: Global Controls (Branch Selector + Department Selector + Date Range Picker) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Branch:
            </span>
            <BranchSelector />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dept:
            </span>
            <DepartmentSelector />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Period:
          </span>
          <DateRangePicker />
        </div>
      </div>
    </header>
  );
};
