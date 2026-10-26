import React, { useState, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import {
  ServiceCatalogItem,
  DailyDepartmentEntry,
  BranchId,
  DepartmentId,
  DEPARTMENT_NAMES,
} from '../types/schema';
import { triggerAutoSync } from '../db/cloudSync';
import { downloadExcelImportTemplate } from '../engine/exportEngine';
import { importExcelWorkbook } from '../engine/importEngine';
import { formatINR, formatNumber } from '../utils/formatters';
import { parseISO, getDay, format } from 'date-fns';
import {
  Calendar,
  Building,
  Save,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Upload,
  Activity,
  Filter,
  ArrowRight,
} from 'lucide-react';

const DEPARTMENT_SORT_ORDER: Record<string, number> = {
  BLOOD_TEST: 1,
  USG: 2,
  XRAY: 3,
  PHYSIO: 4,
  CONSULTATION: 5,
  DIALYSIS: 6,
};

const DEPT_PILLS: Array<{ id: 'ALL' | DepartmentId; label: string; icon: string }> = [
  { id: 'ALL', label: 'All Services', icon: '🩺' },
  { id: 'BLOOD_TEST', label: 'Blood Tests', icon: '🔬' },
  { id: 'USG', label: 'USG / Ultrasound', icon: '📡' },
  { id: 'XRAY', label: 'X-Ray', icon: '🩻' },
  { id: 'PHYSIO', label: 'Physiotherapy', icon: '🏃' },
  { id: 'CONSULTATION', label: 'Consultations', icon: '👨‍⚕️' },
  { id: 'DIALYSIS', label: 'Dialysis Center', icon: '🩸' },
];

export const DailyEntry: React.FC = () => {
  const { branchId, setBranchId, department, setDepartment, setActiveTab, setMetaStatus } =
    useAppStore();
  const excelFileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // Live queries
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const activeBranchId: BranchId =
    branchId === 'ALL'
      ? (branches && branches.length > 0 ? branches[0].id : 'br_dar_ul_shifa')
      : (branchId as BranchId);

  // Selected Date state
  const [selectedDate, setSelectedDate] = useState<string>('2026-04-15');
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  // Filtered & sorted services based on active department
  const displayedServices = useMemo(() => {
    if (!catalog) return [];

    // Active non-dialysis catalog items
    let items = catalog.filter((c) => c.department !== 'DIALYSIS' && c.isActive);

    if (department !== 'ALL' && department !== 'DIALYSIS') {
      items = items.filter((c) => c.department === department);
    }

    // Hierarchically sort by department order, then alphabetically by name
    return [...items].sort((a, b) => {
      const orderA = DEPARTMENT_SORT_ORDER[a.department] ?? 99;
      const orderB = DEPARTMENT_SORT_ORDER[b.department] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }, [catalog, department]);

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

  // Compute daily totals scoped to displayedServices
  const dailyTotals = useMemo(() => {
    let totalPatients = 0;
    let totalRevenue = 0;
    let totalDocPayout = 0;

    displayedServices.forEach((srv) => {
      const count = counts[srv.id] || 0;
      const { rate, payoutModel, revSharePct } = getServiceInfo(srv);
      const rev = count * rate;
      let docPayout = 0;
      if (payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID') {
        docPayout = Math.round(rev * (revSharePct / 100));
      }

      totalPatients += count;
      totalRevenue += rev;
      totalDocPayout += docPayout;
    });

    return { totalPatients, totalRevenue, totalDocPayout };
  }, [displayedServices, counts, rateOverrides]);

  // Save displayed row values to IndexedDB
  const handleSaveAll = async () => {
    const servicesToSave =
      department === 'ALL'
        ? catalog?.filter((c) => c.department !== 'DIALYSIS' && c.isActive) || []
        : displayedServices;

    const recordsToPut: DailyDepartmentEntry[] = [];

    servicesToSave.forEach((srv) => {
      const count = counts[srv.id] || 0;
      const { rate, payoutModel, revSharePct } = getServiceInfo(srv);
      const rev = count * rate;
      const docPayout =
        payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID'
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

    if (recordsToPut.length > 0) {
      await db.dailyEntries.bulkPut(recordsToPut);
      await db.meta.put({ key: 'isEdited', value: true });
      triggerAutoSync();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const activeDeptLabel =
    department === 'ALL'
      ? 'All Outpatient'
      : DEPARTMENT_NAMES[department as DepartmentId] || department;

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
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 cursor-pointer"
            >
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-pulse">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Saved!
            </span>
          )}

          <button
            type="button"
            onClick={downloadExcelImportTemplate}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer"
            title="Download blank or pre-filled Excel template"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Template</span>
          </button>

          <input
            type="file"
            accept=".xlsx,.xls"
            ref={excelFileRef}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImporting(true);
              try {
                const res = await importExcelWorkbook(file, 'MERGE');
                if (res.success) {
                  setMetaStatus(true, true);
                  alert(`Imported ${res.auditCounts.dailyEntries} daily entries successfully!`);
                } else {
                  alert(`Import error: ${res.errors[0] || 'Invalid file format'}`);
                }
              } catch (err: any) {
                alert(`Import failed: ${err.message}`);
              } finally {
                setImporting(false);
                if (excelFileRef.current) excelFileRef.current.value = '';
              }
            }}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => excelFileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs px-3 py-2 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            title="Import Excel spreadsheet into database"
          >
            <Upload className={`w-3.5 h-3.5 text-emerald-600 ${importing ? 'animate-spin' : ''}`} />
            <span>{importing ? 'Importing...' : 'Import Excel'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
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

      {/* Department Filter Pills Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            Filter by Department:
          </span>
          {department !== 'ALL' && (
            <button
              type="button"
              onClick={() => setDepartment('ALL')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer underline"
            >
              Reset to All Services
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {DEPT_PILLS.map((pill) => {
            const isActive = department === pill.id;
            const count =
              pill.id === 'ALL'
                ? catalog?.filter((c) => c.department !== 'DIALYSIS' && c.isActive).length || 0
                : pill.id === 'DIALYSIS'
                ? null
                : catalog?.filter((c) => c.department === pill.id && c.isActive).length || 0;

            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setDepartment(pill.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
                {count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dialysis Guidance Banner when DIALYSIS is selected */}
      {department === 'DIALYSIS' ? (
        <div className="bg-white rounded-xl border border-teal-200 p-8 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
            <Activity className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              Dialysis is Managed via Machine & Shift Scheduling
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Dialysis operational footfall and revenue are tracked per machine, per shift slot (Morning, Afternoon, Evening) with Sunday non-working lock in the dedicated Dialysis Grid.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('dialysis')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Open Dialysis Slot Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDepartment('ALL')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Show All Outpatient Services
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Daily Totals Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                {activeDeptLabel} Procedures Logged
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatNumber(dailyTotals.totalPatients)}
              </p>
              <span className="text-xs text-slate-400">
                {department === 'ALL'
                  ? 'Across all 5 outpatient departments'
                  : `Filtered exclusively to ${activeDeptLabel}`}
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                {activeDeptLabel} Daily Revenue
              </span>
              <p className="text-2xl font-bold text-teal-700 mt-1">
                {formatINR(dailyTotals.totalRevenue)}
              </p>
              <span className="text-xs text-slate-400">Sum of patient counts × applied rates</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                {activeDeptLabel} Doctor Share Payout
              </span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {formatINR(dailyTotals.totalDocPayout)}
              </p>
              <span className="text-xs text-slate-400">Auto-allocated to consulting specialists</span>
            </div>
          </div>

          {/* Inline Spreadsheet Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  {activeDeptLabel} Services Sheet ({format(parseISO(selectedDate), 'EEEE, dd MMMM yyyy')})
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {displayedServices.length} procedures
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Edit patient counts inline — revenue and doctor payouts update dynamically
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
                  {displayedServices.map((srv, index) => {
                    const count = counts[srv.id] || 0;
                    const { rate, payoutModel, revSharePct } = getServiceInfo(srv);
                    const revenue = count * rate;
                    const docPayout =
                      payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID'
                        ? Math.round(revenue * (revSharePct / 100))
                        : 0;

                    const prevDept = index > 0 ? displayedServices[index - 1].department : null;
                    const isNewDeptGroup = department === 'ALL' && srv.department !== prevDept;

                    const deptColorMap: Record<string, string> = {
                      BLOOD_TEST: 'bg-rose-50 text-rose-700 border-rose-200',
                      XRAY: 'bg-blue-50 text-blue-700 border-blue-200',
                      USG: 'bg-purple-50 text-purple-700 border-purple-200',
                      PHYSIO: 'bg-amber-50 text-amber-700 border-amber-200',
                      CONSULTATION: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    };

                    return (
                      <React.Fragment key={srv.id}>
                        {isNewDeptGroup && (
                          <tr className="bg-slate-100/90 border-y border-slate-200">
                            <td
                              colSpan={7}
                              className="px-4 py-2 font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2"
                            >
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  deptColorMap[srv.department] || 'bg-slate-50 text-slate-700'
                                }`}
                              >
                                {srv.department.replace('_', ' ')}
                              </span>
                              <span>{DEPARTMENT_NAMES[srv.department] || srv.department}</span>
                            </td>
                          </tr>
                        )}
                        <tr className="hover:bg-slate-50/80 transition-colors">
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
                            {payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID' ? (
                              <span className="text-[11px] font-medium text-slate-700">
                                {payoutModel} ({revSharePct}%)
                              </span>
                            ) : payoutModel === 'FIXED_MONTHLY' ? (
                              <span className="text-[11px] font-medium text-slate-700">FIXED</span>
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
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
