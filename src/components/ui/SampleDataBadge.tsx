import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { seedDatabase } from '../../db/seed';
import { RotateCcw, Database, AlertCircle, CheckCircle } from 'lucide-react';

export const SampleDataBadge: React.FC = () => {
  const { isSampleDataLoaded, isEdited, setMetaStatus } = useAppStore();
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await seedDatabase(true);
      setMetaStatus(true, false);
      setShowConfirm(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset sample data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Database className="w-3.5 h-3.5 text-amber-600" />
        <span>SAMPLE DATA MODE</span>
        {isEdited && (
          <span className="text-[10px] text-amber-600 font-normal border-l border-amber-300 pl-1.5">
            (Modified)
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isResetting}
        className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-md transition-colors"
        title="Reset all tables to standard 6-month deterministic seed data"
      >
        <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
        <span>Reset to Sample Data</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-semibold text-slate-900">Reset to Sample Data?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              This will overwrite any custom data, overrides, and daily logs with the default 6-month deterministic seed dataset (Apr 2026 – Sep 2026).
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-3.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isResetting}
                className="px-3.5 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
