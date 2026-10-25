import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import {
  MonthlyCostRecord,
  DepartmentCostRecord,
  DepartmentId,
  BranchId,
  DEPARTMENT_NAMES,
} from '../types/schema';
import { splitMonthlyCostToDepartments, DEPARTMENT_COST_WEIGHTS } from '../db/seed';
import { triggerAutoSync } from '../db/cloudSync';
import { computeDepartmentProfitability } from '../engine/financialEngine';
import { downloadExcelImportTemplate } from '../engine/exportEngine';
import { importExcelWorkbook } from '../engine/importEngine';
import { formatINR, formatPct } from '../utils/formatters';
import { parseISO, format, getDay } from 'date-fns';
import {
  CircleDollarSign,
  Building,
  Save,
  CheckCircle,
  FileText,
  Percent,
  Sparkles,
  SlidersHorizontal,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronRight,
  Info,
  Download,
  Upload,
} from 'lucide-react';

const DEPT_LIST: DepartmentId[] = [
  'DIALYSIS',
  'BLOOD_TEST',
  'USG',
  'XRAY',
  'PHYSIO',
  'CONSULTATION',
];

export const Financials: React.FC = () => {
  const { branchId, setBranchId, startDate, endDate, department, setMetaStatus } = useAppStore();
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // Live queries
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const activeBranchId: BranchId =
    branchId === 'ALL'
      ? (branches && branches.length > 0 ? branches[0].id : 'br_dar_ul_shifa')
      : (branchId as BranchId);

  // Month selector state for OPEX editing
  const [selectedYm, setSelectedYm] = useState<string>('2026-04');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [costMode, setCostMode] = useState<'CONSOLIDATED' | 'DEPARTMENT_BREAKDOWN'>('CONSOLIDATED');
  const [activeDeptTab, setActiveDeptTab] = useState<DepartmentId>('DIALYSIS');

  const monthlyCosts = useLiveQuery(() => db.monthlyCosts.toArray(), []);
  const departmentCosts = useLiveQuery(() => db.departmentCosts.toArray(), []);
  const dailyEntries = useLiveQuery(() => db.dailyEntries.toArray(), []);
  const dialysisSlots = useLiveQuery(() => db.dialysisSlots.toArray(), []);
  const capacityLogs = useLiveQuery(() => db.capacityLogs.toArray(), []);
  const catalog = useLiveQuery(() => db.serviceCatalog.toArray(), []);
  const rateOverrides = useLiveQuery(() => db.rateOverrides.toArray(), []);

  // Distinct months derived dynamically from costs or data
  const availableMonths = useMemo(() => {
    if (!monthlyCosts || monthlyCosts.length === 0) {
      return ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
    }
    const set = new Set(monthlyCosts.map((c) => c.yearMonth));
    return Array.from(set).sort();
  }, [monthlyCosts]);

  // Current consolidated record being edited
  const currentCostRecord = useMemo(() => {
    return (
      monthlyCosts?.find(
        (c) => c.branchId === activeBranchId && c.yearMonth === selectedYm
      ) ?? {
        id: `${activeBranchId}_${selectedYm}`,
        branchId: activeBranchId,
        yearMonth: selectedYm,
        rent: 140000,
        electricity: 40000,
        staffing: 200000,
        consumables: 100000,
        licensing: 15000,
        other: 15000,
        fixedOpeXTotal: 510000,
      }
    );
  }, [monthlyCosts, activeBranchId, selectedYm]);

  // Consolidated form state
  const [consolidatedForm, setConsolidatedForm] = useState({
    rent: currentCostRecord.rent,
    electricity: currentCostRecord.electricity,
    staffing: currentCostRecord.staffing,
    consumables: currentCostRecord.consumables,
    licensing: currentCostRecord.licensing,
    other: currentCostRecord.other,
  });

  // Department-wise records map state: key = department
  const [deptFormMap, setDeptFormMap] = useState<Record<DepartmentId, Omit<DepartmentCostRecord, 'id' | 'branchId' | 'yearMonth' | 'department'>>>({
    DIALYSIS: { rent: 0, electricity: 0, staffing: 0, consumables: 0, licensing: 0, other: 0, fixedOpeXTotal: 0 },
    BLOOD_TEST: { rent: 0, electricity: 0, staffing: 0, consumables: 0, licensing: 0, other: 0, fixedOpeXTotal: 0 },
    USG: { rent: 0, electricity: 0, staffing: 0, consumables: 0, licensing: 0, other: 0, fixedOpeXTotal: 0 },
    XRAY: { rent: 0, electricity: 0, staffing: 0, consumables: 0, licensing: 0, other: 0, fixedOpeXTotal: 0 },
    PHYSIO: { rent: 0, electricity: 0, staffing: 0, consumables: 0, licensing: 0, other: 0, fixedOpeXTotal: 0 },
    CONSULTATION: { rent: 0, electricity: 0, staffing: 0, consumables: 0, licensing: 0, other: 0, fixedOpeXTotal: 0 },
  });

  // Sync state whenever record or active branch/month changes
  useEffect(() => {
    setConsolidatedForm({
      rent: currentCostRecord.rent,
      electricity: currentCostRecord.electricity,
      staffing: currentCostRecord.staffing,
      consumables: currentCostRecord.consumables,
      licensing: currentCostRecord.licensing,
      other: currentCostRecord.other,
    });

    // Check if department records exist in DB for this branch and month
    const existingDeptRecs = departmentCosts?.filter(
      (dc) => dc.branchId === activeBranchId && dc.yearMonth === selectedYm
    );

    if (existingDeptRecs && existingDeptRecs.length === 6) {
      const map: any = {};
      existingDeptRecs.forEach((dc) => {
        map[dc.department] = {
          rent: dc.rent,
          electricity: dc.electricity,
          staffing: dc.staffing,
          consumables: dc.consumables,
          licensing: dc.licensing,
          other: dc.other,
          fixedOpeXTotal: dc.fixedOpeXTotal,
        };
      });
      setDeptFormMap(map);
    } else {
      // Split using default clinical weights
      const splits = splitMonthlyCostToDepartments(currentCostRecord);
      const map: any = {};
      splits.forEach((s) => {
        map[s.department] = {
          rent: s.rent,
          electricity: s.electricity,
          staffing: s.staffing,
          consumables: s.consumables,
          licensing: s.licensing,
          other: s.other,
          fixedOpeXTotal: s.fixedOpeXTotal,
        };
      });
      setDeptFormMap(map);
    }
  }, [currentCostRecord, departmentCosts, activeBranchId, selectedYm]);

  // Handlers for consolidated inputs
  const handleConsolidatedInputChange = (field: keyof typeof consolidatedForm, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setConsolidatedForm((prev) => ({ ...prev, [field]: num }));
  };

  const calculatedConsolidatedTotal =
    consolidatedForm.rent +
    consolidatedForm.electricity +
    consolidatedForm.staffing +
    consolidatedForm.consumables +
    consolidatedForm.licensing +
    consolidatedForm.other;

  // Handler for departmental inputs
  const handleDeptInputChange = (
    dept: DepartmentId,
    field: 'rent' | 'electricity' | 'staffing' | 'consumables' | 'licensing' | 'other',
    val: string
  ) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setDeptFormMap((prev) => {
      const currentDept = prev[dept];
      const updatedDept = { ...currentDept, [field]: num };
      const fixedOpeXTotal =
        updatedDept.rent +
        updatedDept.electricity +
        updatedDept.staffing +
        updatedDept.consumables +
        updatedDept.licensing +
        updatedDept.other;
      return {
        ...prev,
        [dept]: { ...updatedDept, fixedOpeXTotal },
      };
    });
  };

  // Quick Allocate helper: re-distribute consolidated total across the 6 departments by weights
  const handleQuickAllocate = () => {
    const virtualCost: MonthlyCostRecord = {
      id: `${activeBranchId}_${selectedYm}`,
      branchId: activeBranchId,
      yearMonth: selectedYm,
      rent: consolidatedForm.rent,
      electricity: consolidatedForm.electricity,
      staffing: consolidatedForm.staffing,
      consumables: consolidatedForm.consumables,
      licensing: consolidatedForm.licensing,
      other: consolidatedForm.other,
      fixedOpeXTotal: calculatedConsolidatedTotal,
    };

    const splits = splitMonthlyCostToDepartments(virtualCost);
    const map: any = {};
    splits.forEach((s) => {
      map[s.department] = {
        rent: s.rent,
        electricity: s.electricity,
        staffing: s.staffing,
        consumables: s.consumables,
        licensing: s.licensing,
        other: s.other,
        fixedOpeXTotal: s.fixedOpeXTotal,
      };
    });
    setDeptFormMap(map);
  };

  // Reconcile department sum vs consolidated total
  const deptSumTotal = DEPT_LIST.reduce(
    (acc, d) => acc + (deptFormMap[d]?.fixedOpeXTotal || 0),
    0
  );

  // Commit save to IndexedDB
  const handleSaveOpex = async () => {
    let finalMonthlyCost: MonthlyCostRecord;
    let finalDeptRecords: DepartmentCostRecord[] = [];

    if (costMode === 'CONSOLIDATED') {
      finalMonthlyCost = {
        id: `${activeBranchId}_${selectedYm}`,
        branchId: activeBranchId,
        yearMonth: selectedYm,
        rent: consolidatedForm.rent,
        electricity: consolidatedForm.electricity,
        staffing: consolidatedForm.staffing,
        consumables: consolidatedForm.consumables,
        licensing: consolidatedForm.licensing,
        other: consolidatedForm.other,
        fixedOpeXTotal: calculatedConsolidatedTotal,
      };
      finalDeptRecords = splitMonthlyCostToDepartments(finalMonthlyCost);
    } else {
      // Build from individual department totals
      let sumRent = 0;
      let sumElec = 0;
      let sumStaff = 0;
      let sumCons = 0;
      let sumLic = 0;
      let sumOth = 0;

      DEPT_LIST.forEach((dept) => {
        const d = deptFormMap[dept];
        sumRent += d.rent;
        sumElec += d.electricity;
        sumStaff += d.staffing;
        sumCons += d.consumables;
        sumLic += d.licensing;
        sumOth += d.other;

        finalDeptRecords.push({
          id: `${activeBranchId}_${selectedYm}_${dept}`,
          branchId: activeBranchId,
          yearMonth: selectedYm,
          department: dept,
          rent: d.rent,
          electricity: d.electricity,
          staffing: d.staffing,
          consumables: d.consumables,
          licensing: d.licensing,
          other: d.other,
          fixedOpeXTotal: d.fixedOpeXTotal,
        });
      });

      finalMonthlyCost = {
        id: `${activeBranchId}_${selectedYm}`,
        branchId: activeBranchId,
        yearMonth: selectedYm,
        rent: sumRent,
        electricity: sumElec,
        staffing: sumStaff,
        consumables: sumCons,
        licensing: sumLic,
        other: sumOth,
        fixedOpeXTotal: deptSumTotal,
      };
    }

    await db.transaction('rw', [db.monthlyCosts, db.departmentCosts, db.meta], async () => {
      await db.monthlyCosts.put(finalMonthlyCost);
      await db.departmentCosts.bulkPut(finalDeptRecords);
      await db.meta.put({ key: 'isEdited', value: true });
    });

    triggerAutoSync();

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // ----------------------------------------------------
  // Department-Wise Profitability Engine Metrics
  // ----------------------------------------------------
  const deptProfitability = useMemo(() => {
    if (
      !branches ||
      !capacityLogs ||
      !dialysisSlots ||
      !dailyEntries ||
      !monthlyCosts ||
      !catalog ||
      !rateOverrides
    ) {
      return [];
    }

    return computeDepartmentProfitability(
      { branchId, startDate, endDate, department },
      branches,
      capacityLogs,
      dialysisSlots,
      dailyEntries,
      departmentCosts || [],
      monthlyCosts,
      catalog,
      rateOverrides
    );
  }, [
    branchId,
    startDate,
    endDate,
    department,
    branches,
    capacityLogs,
    dialysisSlots,
    dailyEntries,
    departmentCosts,
    monthlyCosts,
    catalog,
    rateOverrides,
  ]);

  // Profitability Totals
  const profitTotals = useMemo(() => {
    const totalFootfall = deptProfitability.reduce((s, m) => s + m.footfall, 0);
    const totalRevenue = deptProfitability.reduce((s, m) => s + m.revenue, 0);
    const totalOpex = deptProfitability.reduce((s, m) => s + m.proRatedOpex.total, 0);
    const totalDocPayout = deptProfitability.reduce((s, m) => s + m.doctorPayouts.total, 0);
    const totalCost = deptProfitability.reduce((s, m) => s + m.totalCost, 0);
    const totalNetProfit = deptProfitability.reduce((s, m) => s + m.netProfit, 0);
    const avgMarginPct = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;
    return {
      totalFootfall,
      totalRevenue,
      totalOpex,
      totalDocPayout,
      totalCost,
      totalNetProfit,
      avgMarginPct,
    };
  }, [deptProfitability]);

  // Multi-month P&L table
  const pnlSummary = useMemo(() => {
    if (!branches || !monthlyCosts || !dailyEntries || !dialysisSlots || !catalog || !rateOverrides) {
      return [];
    }

    const months = availableMonths;
    const activeBranchList =
      branchId === 'ALL' ? branches : branches.filter((b) => b.id === branchId);

    const rows: {
      yearMonth: string;
      branchName: string;
      branchCode: string;
      dialysisRev: number;
      deptRev: number;
      grossRev: number;
      fixedOpex: number;
      doctorPayouts: number;
      totalCost: number;
      netProfit: number;
      marginPct: number;
    }[] = [];

    months.forEach((ym) => {
      activeBranchList.forEach((br) => {
        // Dialysis revenue (excluding Sundays)
        const dialRev = dialysisSlots
          .filter(
            (s) =>
              s.branchId === br.id &&
              s.date.startsWith(ym) &&
              s.isOccupied &&
              getDay(parseISO(s.date)) !== 0
          )
          .reduce((sum, s) => sum + s.appliedRate, 0);

        // Non-dialysis revenue and variable doctor payouts
        const dEntries = dailyEntries.filter(
          (e) => e.branchId === br.id && e.date.startsWith(ym)
        );
        const deptRev = dEntries.reduce((sum, e) => sum + e.revenue, 0);
        const variableDoc = dEntries.reduce(
          (sum, e) => sum + (e.doctorVariablePayout || 0),
          0
        );

        // Fixed doctor monthly fees across all catalog services
        let fixedDoc = 0;
        catalog.forEach((srv) => {
          const ov = rateOverrides.find(
            (o) => o.branchId === br.id && o.serviceId === srv.id
          );
          const model = ov?.overridePayoutModel ?? srv.payoutModel;
          const fee = ov?.overrideFixedMonthlyFee ?? srv.defaultFixedMonthlyFee;
          if (model === 'FIXED_MONTHLY' || model === 'HYBRID') {
            fixedDoc += fee;
          }
        });

        // Fixed OPEX
        const costRec = monthlyCosts.find(
          (c) => c.branchId === br.id && c.yearMonth === ym
        );
        const fixedOpex = costRec?.fixedOpeXTotal ?? 0;

        const grossRev = dialRev + deptRev;
        const totalDoc = variableDoc + fixedDoc;
        const totalCost = fixedOpex + totalDoc;
        const netProfit = grossRev - totalCost;
        const marginPct = grossRev > 0 ? (netProfit / grossRev) * 100 : 0;

        rows.push({
          yearMonth: ym,
          branchName: br.name,
          branchCode: br.code,
          dialysisRev: dialRev,
          deptRev,
          grossRev,
          fixedOpex,
          doctorPayouts: totalDoc,
          totalCost,
          netProfit,
          marginPct,
        });
      });
    });

    return rows;
  }, [branches, branchId, monthlyCosts, dailyEntries, dialysisSlots, catalog, rateOverrides, availableMonths]);

  return (
    <div className="space-y-8">
      {/* ==================================================== */}
      {/* 1. OPEX COST MATRIX & ALLOCATION FORM                */}
      {/* ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-teal-600" />
              Monthly OPEX Budget & Department Cost Allocation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter 6-bucket operational overhead per branch or allocate granular department-level operating costs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Selector */}
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" />
              <select
                value={activeBranchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer"
              >
                {branches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <select
              value={selectedYm}
              onChange={(e) => setSelectedYm(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              {availableMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {format(parseISO(`${ym}-01`), 'MMMM yyyy')}
                </option>
              ))}
            </select>

            {/* Cost Entry Mode Switcher */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCostMode('CONSOLIDATED')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  costMode === 'CONSOLIDATED'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Consolidated Branch OPEX
              </button>
              <button
                type="button"
                onClick={() => setCostMode('DEPARTMENT_BREAKDOWN')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  costMode === 'DEPARTMENT_BREAKDOWN'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Department Sub-Allocation
              </button>
            </div>

            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Saved!
              </span>
            )}

            <button
              type="button"
              onClick={downloadExcelImportTemplate}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Download 5-tab Excel template"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Template</span>
            </button>

            <input
              type="file"
              accept=".xlsx,.xls"
              ref={excelFileInputRef}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImporting(true);
                try {
                  const res = await importExcelWorkbook(file, 'MERGE');
                  if (res.success) {
                    setMetaStatus(true, true);
                    alert(`Imported ${res.auditCounts.departmentCosts} department cost records successfully!`);
                  } else {
                    alert(`Import error: ${res.errors[0] || 'Invalid file format'}`);
                  }
                } catch (err: any) {
                  alert(`Import failed: ${err.message}`);
                } finally {
                  setImporting(false);
                  if (excelFileInputRef.current) excelFileInputRef.current.value = '';
                }
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => excelFileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              title="Import Excel spreadsheet into database"
            >
              <Upload className={`w-3.5 h-3.5 text-emerald-600 ${importing ? 'animate-spin' : ''}`} />
              <span>{importing ? 'Importing...' : 'Import Excel'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveOpex}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save OPEX Allocations</span>
            </button>
          </div>
        </div>

        {/* MODE A: CONSOLIDATED BRANCH OVERHEAD */}
        {costMode === 'CONSOLIDATED' && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  1. Facility Rent (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={consolidatedForm.rent}
                  onChange={(e) => handleConsolidatedInputChange('rent', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  2. Electricity & Power (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={consolidatedForm.electricity}
                  onChange={(e) => handleConsolidatedInputChange('electricity', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  3. Fixed Staff Salaries (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={consolidatedForm.staffing}
                  onChange={(e) => handleConsolidatedInputChange('staffing', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  4. Consumables & Lab (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={consolidatedForm.consumables}
                  onChange={(e) => handleConsolidatedInputChange('consumables', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  5. Licensing & Biohazard (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={consolidatedForm.licensing}
                  onChange={(e) => handleConsolidatedInputChange('licensing', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  6. Admin & Other Overheads (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={consolidatedForm.other}
                  onChange={(e) => handleConsolidatedInputChange('other', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-600">Total Monthly Branch OPEX:</span>
                <span className="text-base font-bold text-teal-700">
                  {formatINR(calculatedConsolidatedTotal)}
                </span>
                <span className="text-slate-400">
                  (Auto-split to departments via clinical weights upon save)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleQuickAllocate();
                  setCostMode('DEPARTMENT_BREAKDOWN');
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Quick Allocate & Switch to Department Matrix</span>
              </button>
            </div>
          </div>
        )}

        {/* MODE B: DEPARTMENT SUB-ALLOCATION MATRIX */}
        {costMode === 'DEPARTMENT_BREAKDOWN' && (
          <div className="mt-5 space-y-4">
            {/* Sub-header with department tabs & Quick Allocate helper */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-1">
                {DEPT_LIST.map((dept) => {
                  const weightPct = Math.round((DEPARTMENT_COST_WEIGHTS[dept] || 0) * 100);
                  const isActive = activeDeptTab === dept;
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setActiveDeptTab(dept)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{DEPARTMENT_NAMES[dept]}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-teal-700 text-teal-100' : 'bg-slate-200 text-slate-600'}`}>
                        {weightPct}%
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleQuickAllocate}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Re-apply Standard Weights</span>
                </button>
                <div className="text-xs">
                  <span className="text-slate-500">Dept Sum: </span>
                  <span className="font-bold text-slate-900">{formatINR(deptSumTotal)}</span>
                </div>
              </div>
            </div>

            {/* Department-specific inputs */}
            {DEPT_LIST.map((dept) => {
              if (activeDeptTab !== dept) return null;
              const values = deptFormMap[dept] || {
                rent: 0,
                electricity: 0,
                staffing: 0,
                consumables: 0,
                licensing: 0,
                other: 0,
                fixedOpeXTotal: 0,
              };

              return (
                <div key={dept} className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Facility Rent (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={values.rent}
                        onChange={(e) => handleDeptInputChange(dept, 'rent', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Electricity & Power (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={values.electricity}
                        onChange={(e) => handleDeptInputChange(dept, 'electricity', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Staffing & Tech Salaries (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={values.staffing}
                        onChange={(e) => handleDeptInputChange(dept, 'staffing', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Medical Consumables (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={values.consumables}
                        onChange={(e) => handleDeptInputChange(dept, 'consumables', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Licensing & AMC (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={values.licensing}
                        onChange={(e) => handleDeptInputChange(dept, 'licensing', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Other Overhead (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={values.other}
                        onChange={(e) => handleDeptInputChange(dept, 'other', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-teal-800">
                      Total Allocated Cost for {DEPARTMENT_NAMES[dept]}:
                    </span>
                    <span className="text-sm font-bold text-teal-900">
                      {formatINR(values.fixedOpeXTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 2. DEPARTMENT PROFITABILITY & PERFORMANCE ENGINE     */}
      {/* ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Department-Wise Costing & Profitability Engine
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  Granular P&L
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pro-rated operational overhead, universal doctor remuneration, and net clinical margins calculated for the active period.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Revenue</span>
              <span className="font-bold text-slate-900">{formatINR(profitTotals.totalRevenue)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Cost</span>
              <span className="font-bold text-rose-700">{formatINR(profitTotals.totalCost)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Net Profit</span>
              <span className={`font-bold ${profitTotals.totalNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatINR(profitTotals.totalNetProfit)}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 font-semibold text-slate-700">
                <th className="px-5 py-3">Department</th>
                <th className="px-4 py-3 text-right">Footfall</th>
                <th className="px-4 py-3 text-right">Gross Revenue (₹)</th>
                <th className="px-4 py-3 text-right">Rev Share %</th>
                <th className="px-4 py-3 text-right">Pro-Rated OPEX (₹)</th>
                <th className="px-4 py-3 text-right">Doctor Payouts (₹)</th>
                <th className="px-4 py-3 text-right">Total Cost (₹)</th>
                <th className="px-4 py-3 text-right">Net Profit (₹)</th>
                <th className="px-4 py-3 text-center">Net Margin %</th>
                <th className="px-4 py-3 text-right">Profit Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptProfitability.map((m) => {
                const isPositive = m.netProfit >= 0;
                return (
                  <tr key={m.department} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                      <span>{m.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {m.footfall.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatINR(m.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 font-medium">
                      {formatPct(m.revContributionPct)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700" title={`Rent: ${formatINR(m.proRatedOpex.rent)} | Staff: ${formatINR(m.proRatedOpex.staffing)} | Consumables: ${formatINR(m.proRatedOpex.consumables)}`}>
                      {formatINR(m.proRatedOpex.total)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-indigo-700" title={`Variable: ${formatINR(m.doctorPayouts.variable)} | Fixed: ${formatINR(m.doctorPayouts.fixed)}`}>
                      {formatINR(m.doctorPayouts.total)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {formatINR(m.totalCost)}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatINR(m.netProfit)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          m.marginPct >= 30
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : m.marginPct >= 10
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : m.marginPct >= 0
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {formatPct(m.marginPct)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 font-medium">
                      {m.profitContributionPct > 0 ? formatPct(m.profitContributionPct) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="px-5 py-3">Total Consolidated</td>
                <td className="px-4 py-3 text-right">{profitTotals.totalFootfall.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-teal-800">{formatINR(profitTotals.totalRevenue)}</td>
                <td className="px-4 py-3 text-right">100%</td>
                <td className="px-4 py-3 text-right">{formatINR(profitTotals.totalOpex)}</td>
                <td className="px-4 py-3 text-right text-indigo-800">{formatINR(profitTotals.totalDocPayout)}</td>
                <td className="px-4 py-3 text-right">{formatINR(profitTotals.totalCost)}</td>
                <td className={`px-4 py-3 text-right ${profitTotals.totalNetProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {formatINR(profitTotals.totalNetProfit)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-300 font-bold">
                    {formatPct(profitTotals.avgMarginPct)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. MULTI-MONTH BRANCH P&L SUMMARY MATRIX             */}
      {/* ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Comprehensive Multi-Month Branch Financial Ledger
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Dynamic monthly aggregation from live entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 font-semibold text-slate-700">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3 text-right">Dialysis Rev</th>
                <th className="px-4 py-3 text-right">Dept Rev</th>
                <th className="px-4 py-3 text-right font-bold text-teal-700">Gross Rev</th>
                <th className="px-4 py-3 text-right">Fixed OPEX</th>
                <th className="px-4 py-3 text-right">Doctor Payouts</th>
                <th className="px-4 py-3 text-right font-bold text-rose-700">Total Cost</th>
                <th className="px-4 py-3 text-right font-bold">Net Profit</th>
                <th className="px-4 py-3 text-center">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pnlSummary.map((r, i) => {
                const isProfitable = r.netProfit >= 0;
                return (
                  <tr key={`${r.yearMonth}_${r.branchCode}_${i}`} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-bold text-slate-800">
                      {format(parseISO(`${r.yearMonth}-01`), 'MMMM yyyy')}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700">
                      {r.branchName} ({r.branchCode})
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-600">
                      {formatINR(r.dialysisRev)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-600">
                      {formatINR(r.deptRev)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-teal-800">
                      {formatINR(r.grossRev)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-600">
                      {formatINR(r.fixedOpex)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-600">
                      {formatINR(r.doctorPayouts)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-rose-800">
                      {formatINR(r.totalCost)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-bold ${
                        isProfitable ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatINR(r.netProfit)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          r.marginPct >= 20
                            ? 'bg-emerald-50 text-emerald-800'
                            : r.marginPct >= 0
                            ? 'bg-teal-50 text-teal-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {formatPct(r.marginPct)}
                      </span>
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
