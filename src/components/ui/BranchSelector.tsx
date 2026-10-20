import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Building2 } from 'lucide-react';

export const BranchSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { branchId, setBranchId } = useAppStore();

  return (
    <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
      <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
      <select
        value={branchId}
        onChange={(e) => setBranchId(e.target.value)}
        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 shadow-xs hover:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer"
      >
        <option value="ALL">🏢 All Branches (Consolidated)</option>
        <option value="br_dar_ul_shifa">🏥 Dar ul Shifa (DUS)</option>
        <option value="br_saifee_diag">🔬 Saifee Diagnostics Center (SDC)</option>
      </select>
    </div>
  );
};
