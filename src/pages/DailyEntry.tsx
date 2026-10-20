import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { ServiceCatalogItem, DailyDepartmentEntry, BranchId } from '../types/schema';
import { formatINR, formatNumber } from '../utils/formatters';
import { parseISO, getDay, format } from 'date-fns';
import {
  Calendar,
  Building,
  Save,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';

export const DailyEntry: React.FC = () => {
  const { branchId, setBranchId } = useAppStore();

  const activeBranchId: BranchId =
    branchId === 'ALL' ? 'br_dar_ul_shifa' : (branchId as BranchId);

  // Selected Date state
  const [selectedDate, setSelectedDate] = useState<string>('2026-04-15');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live queries
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const catalog = useLiveQuery(() => db.serviceCatalog.toArray(), []);
  const rateOverrides = useLiveQuery(
    () => db.rateOverrides.where('branchId').equals(activeBranchId).toArray(),
    [activeBranchId]
  );
  const existingEntries = useLiveQuery(
    () =>
      db.dailyEntries
        .where('[branchId+date]')
        .equals([activeBranchId, selectedDate])
        .toArray(),
    [activeBranchId, selectedDate]
  );

  const isSunday = useMemo(() => {
    return getDay(parseISO(selectedDate)) === 0;
  }, [selectedDate]);

  // Non-dialysis catalog items
  const nonDialysisServices = useMemo(() => {
    if (!catalog) return [];
    return catalog.filter((c) => c.department !== 'DIALYSIS' && c.isActive);
  }, [catalog]);

  // Working state for counts in the grid
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Sync counts from DB when date or branch changes
  React.useEffect(() => {
    if (existingEntries) {
      const initialCounts: Record<string, number> = {};
      existingEntries.forEach((entry) => {
        initialCounts[entry.serviceId] = entry.patientCount;
      });
      setCounts(initialCounts);
    }
  }, [existingEntries]);

  // Lookup rate and payout model for each service
  const getServiceInfo = (service: ServiceCatalogItem) => {
    const override = rateOverrides?.find((o) => o.serviceId === service.id);
    const rate = override?.overrideRate ?? service.defaultRate;
    const payoutModel = override?.overridePayoutModel ?? service.payoutModel;
    const revSharePct = override?.overrideRevSharePct ?? service.defaultRevSharePct;
    return { rate, payoutModel, revSharePct };
  };

  const handleCountChange = (serviceId: string, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setCounts((prev) => ({ ...prev, [serviceId]: num }));
  };

  // Compute daily totals
  const dailyTotals = useMemo(() => {
    let totalPatients = 0;
    let totalRevenue = 0;
    let totalDocPayout = 0;

    nonDialysisServices.forEach((srv) => {
      const count = counts[srv.id] || 0;
      const { rate, payoutModel, revSharePct } = getServiceInfo(srv);
      const rev = count * rate;
      let docPayout = 0;
      if (
        srv.department === 'CONSULTATION' &&
        (payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID')
      ) {
        docPayout = Math.round(rev * (revSharePct / 100));
      }

      totalPatients += count;
      totalRevenue += rev;
      totalDocPayout += docPayout;
    });

    return { totalPatients, totalRevenue, totalDocPayout };
  }, [nonDialysisServices, counts, rateOverrides]);

  // Save all row values to IndexedDB
  const handleSaveAll = async () => {
    const recordsToPut: DailyDepartmentEntry[] = [];

    nonDialysisServices.forEach((srv) => {
      const count = counts[srv.id] || 0;
      const { rate, payoutModel, revSharePct } = getServiceInfo(srv);
      const rev = count * rate;
      const docPayout =
        srv.department === 'CONSULTATION' &&
        (payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID')
          ? Math.round(rev * (revSharePct / 100))
          : 0;

      recordsToPut.push({
        id: `${activeBranchId}_${selectedDate}_${srv.id}`,
        branchId: activeBranchId,
        date: selectedDate,
        department: srv.department,
        serviceId: srv.id,
        patientCount: count,
        rate,
        revenue: rev,
        doctorVariablePayout: docPayout,
      });
    });

    await db.dailyEntries.bulkPut(recordsToPut);
    await db.meta.put({ key: 'isEdited', value: true });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Branch selector */}
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-600" />
            <select
              value={activeBranchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800"
            >
              <option value="br_dar_ul_shifa">🏥 Dar ul Shifa (DUS)</option>
              <option value="br_saifee_diag">🔬 Saifee Diagnostics Center (SDC)</option>
            </select>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Entry Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-pulse">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Saved to IndexedDB!
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Spreadsheet Entries</span>
          </button>
        </div>
      </div>

      {/* Sunday Warning Alert */}
      {isSunday && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3 text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Sunday Non-Working Day:</span> Sunday entries are not part of routine baseline schedules. Any entries logged here will reflect in the financial ledger, but dialysis capacity excludes Sundays.
          </div>
        </div>
      )}

      {/* Daily Totals Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Total Patients / Tests Logged
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatNumber(dailyTotals.totalPatients)}
          </p>
          <span className="text-xs text-slate-400">Excludes dialysis sessions</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Gross Department Revenue
          </span>
          <p className="text-2xl font-bold text-teal-700 mt-1">
            {formatINR(dailyTotals.totalRevenue)}
          </p>
          <span className="text-xs text-slate-400">Sum of patient counts × applied rates</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Doctor Share Variable Payout
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {formatINR(dailyTotals.totalDocPayout)}
          </p>
          <span className="text-xs text-slate-400">Auto-allocated to consulting specialists</span>
        </div>
      </div>

      {/* Inline Spreadsheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Diagnostic & Clinical Services Sheet ({format(parseISO(selectedDate), 'EEEE, dd MMMM yyyy')})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Edit patient counts inline — revenue updates dynamically
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Payout Model</th>
                <th className="px-4 py-3 text-right">Applied Rate</th>
                <th className="px-4 py-3 text-center w-36">Patient Count</th>
                <th className="px-4 py-3 text-right">Gross Revenue</th>
                <th className="px-4 py-3 text-right">Doctor Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nonDialysisServices.map((srv) => {
                const count = counts[srv.id] || 0;
                const { rate, payoutModel, revSharePct } = getServiceInfo(srv);
                const revenue = count * rate;
                const docPayout =
                  srv.department === 'CONSULTATION' &&
                  (payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID')
                    ? Math.round(revenue * (revSharePct / 100))
                    : 0;

                const deptColorMap: Record<string, string> = {
                  BLOOD_TEST: 'bg-rose-50 text-rose-700 border-rose-200',
                  XRAY: 'bg-blue-50 text-blue-700 border-blue-200',
                  USG: 'bg-purple-50 text-purple-700 border-purple-200',
                  PHYSIO: 'bg-amber-50 text-amber-700 border-amber-200',
                  CONSULTATION: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                };

                return (
                  <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          deptColorMap[srv.department] || 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        {srv.department.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      {srv.name}
                      {srv.subCategory && (
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          ({srv.subCategory})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {srv.department === 'CONSULTATION' ? (
                        <span className="text-[11px] font-medium text-slate-700">
                          {payoutModel} ({revSharePct}%)
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-800">
                      {formatINR(rate)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) => handleCountChange(srv.id, e.target.value)}
                        className="w-24 text-center py-1 px-2 border border-slate-300 rounded-md font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                      {formatINR(revenue)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-amber-600">
                      {docPayout > 0 ? formatINR(docPayout) : '—'}
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
