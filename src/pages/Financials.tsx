import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { MonthlyCostRecord, BranchId } from '../types/schema';
import { formatINR, formatPct } from '../utils/formatters';
import { parseISO, format, getDaysInMonth, getDay } from 'date-fns';
import {
  CircleDollarSign,
  Building,
  Save,
  CheckCircle,
  FileText,
  Calculator,
  Percent,
} from 'lucide-react';

export const Financials: React.FC = () => {
  const { branchId, setBranchId } = useAppStore();

  const activeBranchId: BranchId =
    branchId === 'ALL' ? 'br_dar_ul_shifa' : (branchId as BranchId);

  // Month selector state for OPEX editing
  const [selectedYm, setSelectedYm] = useState<string>('2026-04');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live queries
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const monthlyCosts = useLiveQuery(() => db.monthlyCosts.toArray(), []);
  const dailyEntries = useLiveQuery(() => db.dailyEntries.toArray(), []);
  const dialysisSlots = useLiveQuery(() => db.dialysisSlots.toArray(), []);
  const catalog = useLiveQuery(() => db.serviceCatalog.toArray(), []);
  const rateOverrides = useLiveQuery(() => db.rateOverrides.toArray(), []);

  // Current record being edited
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

  // Form state
  const [formState, setFormState] = useState({
    rent: currentCostRecord.rent,
    electricity: currentCostRecord.electricity,
    staffing: currentCostRecord.staffing,
    consumables: currentCostRecord.consumables,
    licensing: currentCostRecord.licensing,
    other: currentCostRecord.other,
  });

  React.useEffect(() => {
    setFormState({
      rent: currentCostRecord.rent,
      electricity: currentCostRecord.electricity,
      staffing: currentCostRecord.staffing,
      consumables: currentCostRecord.consumables,
      licensing: currentCostRecord.licensing,
      other: currentCostRecord.other,
    });
  }, [currentCostRecord]);

  const handleInputChange = (field: keyof typeof formState, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setFormState((prev) => ({ ...prev, [field]: num }));
  };

  const calculatedOpexTotal =
    formState.rent +
    formState.electricity +
    formState.staffing +
    formState.consumables +
    formState.licensing +
    formState.other;

  const handleSaveOpex = async () => {
    const updated: MonthlyCostRecord = {
      id: `${activeBranchId}_${selectedYm}`,
      branchId: activeBranchId,
      yearMonth: selectedYm,
      rent: formState.rent,
      electricity: formState.electricity,
      staffing: formState.staffing,
      consumables: formState.consumables,
      licensing: formState.licensing,
      other: formState.other,
      fixedOpeXTotal: calculatedOpexTotal,
    };

    await db.monthlyCosts.put(updated);
    await db.meta.put({ key: 'isEdited', value: true });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Comprehensive 6-month P&L table
  const pnlSummary = useMemo(() => {
    if (!branches || !monthlyCosts || !dailyEntries || !dialysisSlots || !catalog || !rateOverrides) {
      return [];
    }

    const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
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

        // Fixed doctor monthly fees
        let fixedDoc = 0;
        const consults = catalog.filter((c) => c.department === 'CONSULTATION');
        consults.forEach((srv) => {
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
  }, [branches, branchId, monthlyCosts, dailyEntries, dialysisSlots, catalog, rateOverrides]);

  return (
    <div className="space-y-6">
      {/* OPEX Editor Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-teal-600" />
              Monthly OPEX Budget & Allocation Form
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure the 6 standard monthly operating expense buckets for pro-rated calculations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Selector */}
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" />
              <select
                value={activeBranchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="br_dar_ul_shifa">🏥 Dar ul Shifa (DUS)</option>
                <option value="br_saifee_diag">🔬 Saifee Diagnostics Center (SDC)</option>
              </select>
            </div>

            {/* Month Selector */}
            <select
              value={selectedYm}
              onChange={(e) => setSelectedYm(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="2026-04">April 2026</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-09">September 2026</option>
            </select>

            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Saved!
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveOpex}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save OPEX Sheet</span>
            </button>
          </div>
        </div>

        {/* 6 Input Buckets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              1. Facility Rent (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.rent}
              onChange={(e) => handleInputChange('rent', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              2. Electricity & Power (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.electricity}
              onChange={(e) => handleInputChange('electricity', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              3. Nursing & Staffing (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.staffing}
              onChange={(e) => handleInputChange('staffing', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              4. Consumables (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.consumables}
              onChange={(e) => handleInputChange('consumables', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              5. Licensing & Compliance (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.licensing}
              onChange={(e) => handleInputChange('licensing', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              6. Other General OPEX (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.other}
              onChange={(e) => handleInputChange('other', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Total Banner */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Total Fixed Monthly OPEX (6 Buckets):
          </span>
          <span className="text-lg font-bold text-slate-900">
            {formatINR(calculatedOpexTotal)}
          </span>
        </div>
      </div>

      {/* 6-Month P&L Master Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Consolidated 6-Month P&L Ledger (April 2026 – September 2026)
            </h3>
            <p className="text-xs text-slate-500">
              Complete breakdown including Dialysis, Granular Diagnostics, Monthly OPEX, and Doctor Payouts
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3 text-right">Dialysis Rev</th>
                <th className="px-4 py-3 text-right">Dept Rev</th>
                <th className="px-4 py-3 text-right font-bold text-slate-900">Gross Rev</th>
                <th className="px-4 py-3 text-right">Fixed OPEX</th>
                <th className="px-4 py-3 text-right text-amber-600">Doctor Payouts</th>
                <th className="px-4 py-3 text-right font-bold text-rose-700">Total Cost</th>
                <th className="px-4 py-3 text-right font-bold">Net Profit</th>
                <th className="px-4 py-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pnlSummary.map((row, idx) => {
                const isProfitable = row.netProfit >= 0;
                return (
                  <tr key={`${row.yearMonth}_${row.branchCode}_${idx}`} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 font-bold text-slate-800">
                      {format(parseISO(`${row.yearMonth}-01`), 'MMM yyyy')}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-700">
                      {row.branchName} ({row.branchCode})
                    </td>
                    <td className="px-4 py-2.5 text-right text-teal-700">
                      {formatINR(row.dialysisRev)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700">
                      {formatINR(row.deptRev)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                      {formatINR(row.grossRev)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-600">
                      {formatINR(row.fixedOpex)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-amber-600">
                      {formatINR(row.doctorPayouts)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-rose-700">
                      {formatINR(row.totalCost)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-bold ${
                        isProfitable ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatINR(row.netProfit)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-semibold ${
                        isProfitable ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatPct(row.marginPct, false)}
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
