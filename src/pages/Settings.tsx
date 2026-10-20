import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { DialysisCapacityLog, BranchId } from '../types/schema';
import {
  Sliders,
  Plus,
  Trash2,
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
  History,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const Settings: React.FC = () => {
  const capacityLogs = useLiveQuery(() => db.capacityLogs.toArray(), []);
  const branches = useLiveQuery(() => db.branches.toArray(), []);

  // Form state
  const [branchId, setBranchId] = useState<BranchId>('br_dar_ul_shifa');
  const [effectiveFrom, setEffectiveFrom] = useState('2026-10-01');
  const [machineCount, setMachineCount] = useState<number>(6);
  const [slotsPerMachine, setSlotsPerMachine] = useState<number>(2);
  const [note, setNote] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const sortedLogs = React.useMemo(() => {
    if (!capacityLogs) return [];
    return [...capacityLogs].sort((a, b) => {
      if (a.branchId !== b.branchId) return a.branchId.localeCompare(b.branchId);
      return a.effectiveFrom.localeCompare(b.effectiveFrom);
    });
  }, [capacityLogs]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveFrom) {
      setStatusMsg({ type: 'error', text: 'Please choose an effective date.' });
      return;
    }

    const id = `${branchId}_${effectiveFrom}`;
    const logRecord: DialysisCapacityLog = {
      id,
      branchId,
      effectiveFrom,
      machineCount: Number(machineCount),
      slotsPerMachine: Number(slotsPerMachine),
      note: note.trim() || 'Capacity update',
    };

    try {
      await db.capacityLogs.put(logRecord);
      await db.meta.put({ key: 'isEdited', value: true });
      setStatusMsg({
        type: 'success',
        text: `Successfully logged new capacity (${machineCount} machines × ${slotsPerMachine} shifts) effective from ${effectiveFrom}!`,
      });
      setNote('');
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to save capacity record.' });
    }
  };

  const handleDeleteLog = async (id: string) => {
    await db.capacityLogs.delete(id);
    await db.meta.put({ key: 'isEdited', value: true });
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Dialysis Machine & Shift Capacity Versioning
            </h3>
            <p className="text-xs text-slate-500">
              Retroactive capacity preservation: Historical dates always calculate against the exact capacity record active at that time.
            </p>
          </div>
        </div>
      </div>

      {/* Add New Capacity Record Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-600" />
          Record New Capacity Expansion or Machine Fleet Change
        </h4>

        {statusMsg && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleAddLog} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value as BranchId)}
              className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
            >
              <option value="br_dar_ul_shifa">🏥 Dar ul Shifa (DUS)</option>
              <option value="br_saifee_diag">🔬 Saifee Diagnostics Center (SDC)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Effective From Date</label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Active Machines Count
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={machineCount}
              onChange={(e) => setMachineCount(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Slots / Shifts Per Machine
            </label>
            <input
              type="number"
              min="1"
              max="4"
              value={slotsPerMachine}
              onChange={(e) => setSlotsPerMachine(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-5 flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reason / Clinical Audit Note
              </label>
              <input
                type="text"
                placeholder="e.g. Procured 2 additional Fresenius 4008S machines for morning shift"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors shrink-0"
            >
              Commit Capacity Record
            </button>
          </div>
        </form>
      </div>

      {/* Historical Capacity Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Chronological Capacity Audit Trail
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Sorted by branch & effective date
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Effective Date</th>
                <th className="px-4 py-3 text-center">Machines</th>
                <th className="px-4 py-3 text-center">Shifts/Machine</th>
                <th className="px-4 py-3 text-center font-bold text-teal-700">Daily Slots</th>
                <th className="px-4 py-3">Audit Note</th>
                <th className="px-4 py-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedLogs.map((log) => {
                const brName = branches?.find((b) => b.id === log.branchId)?.name || log.branchId;
                const isBaseline = log.effectiveFrom === '2026-04-01';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">{brName}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {format(parseISO(log.effectiveFrom), 'dd MMMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                      {log.machineCount}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                      {log.slotsPerMachine}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-teal-700">
                      {log.machineCount * log.slotsPerMachine} slots/day
                    </td>
                    <td className="px-4 py-3 text-slate-600">{log.note}</td>
                    <td className="px-4 py-3 text-center">
                      {!isBaseline ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete capacity entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Baseline
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
