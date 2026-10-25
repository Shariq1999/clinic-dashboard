import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useAppStore } from '../../store/useAppStore';
import { Building2 } from 'lucide-react';

export const BranchSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { branchId, setBranchId } = useAppStore();
  const branches = useLiveQuery(() => db.branches.toArray(), []);

  return (
    <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
      <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
      <select
        value={branchId}
        onChange={(e) => setBranchId(e.target.value)}
        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 shadow-xs hover:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer"
      >
        <option value="ALL">🏢 All Branches (Consolidated)</option>
        {branches?.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} ({b.code})
          </option>
        ))}
      </select>
    </div>
  );
};
