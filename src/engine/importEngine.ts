import * as XLSX from 'xlsx';
import { db } from '../db/database';
import {
  Branch,
  ServiceCatalogItem,
  BranchRateOverride,
  DailyDepartmentEntry,
  DepartmentCostRecord,
  MonthlyCostRecord,
  DialysisSlotRecord,
  DepartmentId,
  DialysisSlotType,
  DoctorPayoutModel,
} from '../types/schema';
import { triggerAutoSync } from '../db/cloudSync';
import { parseISO, format, getDay, isValid } from 'date-fns';

export interface ImportResultSummary {
  success: boolean;
  mode: 'MERGE' | 'OVERWRITE';
  importedAt: string;
  auditCounts: {
    branches: number;
    serviceCatalog: number;
    rateOverrides: number;
    departmentCosts: number;
    monthlyCosts: number;
    dailyEntries: number;
    dialysisSlots: number;
  };
  skippedSundaysCount: number;
  warnings: string[];
  errors: string[];
}

// Date normalization helper
function normalizeDateStr(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isValid(val) ? format(val, 'yyyy-MM-dd') : null;
  }
  if (typeof val === 'number') {
    // Excel numeric date (days since Dec 30, 1899)
    const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isValid(dateObj) ? format(dateObj, 'yyyy-MM-dd') : null;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Test direct ISO
    const parsed = parseISO(trimmed);
    if (isValid(parsed) && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
    // Test DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return null;
}

// Year-Month normalization helper
function normalizeYmStr(val: any): string | null {
  if (!val) return null;
  const dStr = normalizeDateStr(val);
  if (dStr) return dStr.slice(0, 7);

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;
  }
  return null;
}

export async function importExcelWorkbook(
  file: File,
  mode: 'MERGE' | 'OVERWRITE' = 'MERGE'
): Promise<ImportResultSummary> {
  const warnings: string[] = [];
  const errors: string[] = [];
  let skippedSundaysCount = 0;

  const arrayBuffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(arrayBuffer, { cellDates: true, cellNF: false, cellText: false });
  } catch (err: any) {
    return {
      success: false,
      mode,
      importedAt: new Date().toISOString(),
      auditCounts: {
        branches: 0,
        serviceCatalog: 0,
        rateOverrides: 0,
        departmentCosts: 0,
        monthlyCosts: 0,
        dailyEntries: 0,
        dialysisSlots: 0,
      },
      skippedSundaysCount: 0,
      warnings: [],
      errors: [`Failed to parse Excel file: ${err.message || 'Corrupted or unsupported format'}`],
    };
  }

  // Load existing baseline data for reconciliation
  const existingBranches = await db.branches.toArray();
  const existingCatalog = await db.serviceCatalog.toArray();
  const existingOverrides = await db.rateOverrides.toArray();

  // Create fast lookup maps
  const branchMap = new Map<string, Branch>(); // by code or id (lowercased)
  existingBranches.forEach((b) => {
    branchMap.set(b.id.toLowerCase(), b);
    branchMap.set(b.code.toLowerCase(), b);
    branchMap.set(b.name.toLowerCase(), b);
  });

  const catalogMap = new Map<string, ServiceCatalogItem>(); // by name or id (lowercased)
  existingCatalog.forEach((c) => {
    catalogMap.set(c.id.toLowerCase(), c);
    catalogMap.set(c.name.toLowerCase(), c);
  });

  // Prepared data arrays
  const newBranches: Branch[] = [];
  const newCatalog: ServiceCatalogItem[] = [];
  const newOverrides: BranchRateOverride[] = [];
  const newDeptCosts: DepartmentCostRecord[] = [];
  const newDailyEntries: DailyDepartmentEntry[] = [];
  const newDialysisSlots: DialysisSlotRecord[] = [];

  // Helper to resolve branch
  const resolveBranch = (rawCode: any): Branch => {
    if (!rawCode) {
      return existingBranches[0] || {
        id: 'br_dar_ul_shifa',
        code: 'DUS',
        name: 'Dar ul Shifa',
        location: 'Mumbai',
        isActive: true,
        sundayOpen: false,
      };
    }
    const str = String(rawCode).trim().toLowerCase();
    const found = branchMap.get(str);
    if (found) return found;

    // Auto-create branch if unknown code encountered in Excel
    const cleanCode = String(rawCode).trim().toUpperCase();
    const newBr: Branch = {
      id: `br_${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      code: cleanCode,
      name: `Branch ${cleanCode}`,
      location: 'Imported Clinic Location',
      isActive: true,
      sundayOpen: false,
    };
    newBranches.push(newBr);
    branchMap.set(newBr.id.toLowerCase(), newBr);
    branchMap.set(newBr.code.toLowerCase(), newBr);
    branchMap.set(newBr.name.toLowerCase(), newBr);
    warnings.push(`Auto-registered branch code "${cleanCode}" encountered in spreadsheet.`);
    return newBr;
  };

  // Helper to resolve service
  const resolveService = (rawName: any, dept: DepartmentId): ServiceCatalogItem => {
    const str = String(rawName || '').trim().toLowerCase();
    const found = catalogMap.get(str);
    if (found) return found;

    // Auto-create service item if unknown in catalog
    const cleanName = String(rawName || 'General Service').trim();
    const newSrv: ServiceCatalogItem = {
      id: `srv_imp_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24)}`,
      name: cleanName,
      department: dept,
      defaultRate: 500,
      payoutModel: 'NONE',
      defaultRevSharePct: 0,
      defaultFixedMonthlyFee: 0,
      isActive: true,
    };
    newCatalog.push(newSrv);
    catalogMap.set(newSrv.id.toLowerCase(), newSrv);
    catalogMap.set(newSrv.name.toLowerCase(), newSrv);
    warnings.push(`Added new catalog item "${cleanName}" under ${dept}.`);
    return newSrv;
  };

  // ----------------------------------------------------
  // 1. PARSE RateCard_Master (if present)
  // ----------------------------------------------------
  const sheetMaster = workbook.Sheets['RateCard_Master'];
  if (sheetMaster) {
    const rows: any[] = XLSX.utils.sheet_to_json(sheetMaster);
    rows.forEach((r) => {
      const name = String(r.Service_Name || r.name || '').trim();
      if (!name) return;
      const dept: DepartmentId = (r.Department || r.department || 'BLOOD_TEST').toUpperCase();
      const existing = catalogMap.get(name.toLowerCase());
      const srvRecord: ServiceCatalogItem = {
        id: existing?.id || `srv_imp_${name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24)}`,
        name,
        department: dept,
        subCategory: r.Sub_Category || r.subCategory || existing?.subCategory,
        defaultRate: Number(r.Default_Rate ?? r.defaultRate ?? 500),
        payoutModel: (r.Payout_Model || r.payoutModel || 'NONE').toUpperCase() as DoctorPayoutModel,
        defaultRevSharePct: Number(r.Rev_Share_Pct ?? r.defaultRevSharePct ?? 0),
        defaultFixedMonthlyFee: Number(r.Fixed_Monthly_Fee ?? r.defaultFixedMonthlyFee ?? 0),
        isActive: true,
      };
      newCatalog.push(srvRecord);
      catalogMap.set(srvRecord.id.toLowerCase(), srvRecord);
      catalogMap.set(srvRecord.name.toLowerCase(), srvRecord);
    });
  }

  // ----------------------------------------------------
  // 2. PARSE Branch_Overrides (if present)
  // ----------------------------------------------------
  const sheetOverrides = workbook.Sheets['Branch_Overrides'];
  if (sheetOverrides) {
    const rows: any[] = XLSX.utils.sheet_to_json(sheetOverrides);
    rows.forEach((r) => {
      const br = resolveBranch(r.Branch_Code || r.branchId);
      const srvName = String(r.Service_Name || r.serviceId || '').trim();
      const srv = catalogMap.get(srvName.toLowerCase());
      if (!srv) return;

      newOverrides.push({
        id: `${br.id}_${srv.id}`,
        branchId: br.id,
        serviceId: srv.id,
        overrideRate: r.Override_Rate !== undefined ? Number(r.Override_Rate) : undefined,
        overridePayoutModel: r.Override_Payout_Model ? (String(r.Override_Payout_Model).toUpperCase() as DoctorPayoutModel) : undefined,
        overrideRevSharePct: r.Override_Rev_Share_Pct !== undefined ? Number(r.Override_Rev_Share_Pct) : undefined,
        overrideFixedMonthlyFee: r.Override_Fixed_Monthly_Fee !== undefined ? Number(r.Override_Fixed_Monthly_Fee) : undefined,
      });
    });
  }

  // ----------------------------------------------------
  // 3. PARSE Department_Costs
  // ----------------------------------------------------
  const sheetDeptCosts =
    workbook.Sheets['Department_Costs'] ||
    workbook.Sheets['DepartmentCosts'] ||
    workbook.Sheets['Dept_Costs'];
  if (sheetDeptCosts) {
    const rows: any[] = XLSX.utils.sheet_to_json(sheetDeptCosts);
    rows.forEach((r, idx) => {
      const ym = normalizeYmStr(r.Year_Month || r.yearMonth || r.Month);
      if (!ym) {
        warnings.push(`Department_Costs row #${idx + 2} has invalid or missing Year_Month format.`);
        return;
      }
      const br = resolveBranch(r.Branch_Code || r.branchId);
      const dept: DepartmentId = String(r.Department || r.department || 'DIALYSIS').toUpperCase() as DepartmentId;

      const rent = Number(r.Rent ?? r.rent ?? 0);
      const electricity = Number(r.Electricity ?? r.electricity ?? 0);
      const staffing = Number(r.Staffing ?? r.staffing ?? 0);
      const consumables = Number(r.Consumables ?? r.consumables ?? 0);
      const licensing = Number(r.Licensing ?? r.licensing ?? 0);
      const other = Number(r.Other ?? r.other ?? 0);
      const fixedOpeXTotal = rent + electricity + staffing + consumables + licensing + other;

      newDeptCosts.push({
        id: `${br.id}_${ym}_${dept}`,
        branchId: br.id,
        yearMonth: ym,
        department: dept,
        rent,
        electricity,
        staffing,
        consumables,
        licensing,
        other,
        fixedOpeXTotal,
      });
    });
  }

  // Auto-aggregate Department_Costs into Monthly_Costs
  const monthlyCostsMap = new Map<string, MonthlyCostRecord>();
  newDeptCosts.forEach((dc) => {
    const key = `${dc.branchId}_${dc.yearMonth}`;
    const existing = monthlyCostsMap.get(key) || {
      id: key,
      branchId: dc.branchId,
      yearMonth: dc.yearMonth,
      rent: 0,
      electricity: 0,
      staffing: 0,
      consumables: 0,
      licensing: 0,
      other: 0,
      fixedOpeXTotal: 0,
    };

    existing.rent += dc.rent;
    existing.electricity += dc.electricity;
    existing.staffing += dc.staffing;
    existing.consumables += dc.consumables;
    existing.licensing += dc.licensing;
    existing.other += dc.other;
    existing.fixedOpeXTotal += dc.fixedOpeXTotal;

    monthlyCostsMap.set(key, existing);
  });
  const newMonthlyCosts = Array.from(monthlyCostsMap.values());

  // ----------------------------------------------------
  // 4. PARSE Daily_Dept_Revenue / Daily_Entries
  // ----------------------------------------------------
  const sheetDaily =
    workbook.Sheets['Daily_Dept_Revenue'] ||
    workbook.Sheets['Daily_Entries'] ||
    workbook.Sheets['DailyRevenue'];
  if (sheetDaily) {
    const rows: any[] = XLSX.utils.sheet_to_json(sheetDaily);
    rows.forEach((r, idx) => {
      const dateStr = normalizeDateStr(r.Date || r.date);
      if (!dateStr) {
        warnings.push(`Daily_Dept_Revenue row #${idx + 2} has invalid or missing Date.`);
        return;
      }

      const br = resolveBranch(r.Branch_Code || r.branchId);
      const dept: DepartmentId = String(r.Department || r.department || 'BLOOD_TEST').toUpperCase() as DepartmentId;
      if (dept === 'DIALYSIS') return; // Dialysis is handled via slot matrix

      const srvName = String(r.Service_Name || r.serviceId || 'General Modality').trim();
      const srv = resolveService(srvName, dept);

      const patientCount = Math.max(0, parseInt(r.Patient_Count ?? r.patientCount ?? 1, 10));

      // Resolve applied rate
      let rate = Number(r.Applied_Rate ?? r.rate ?? 0);
      if (rate <= 0) {
        const ov = newOverrides.find((o) => o.branchId === br.id && o.serviceId === srv.id) ||
                   existingOverrides.find((o) => o.branchId === br.id && o.serviceId === srv.id);
        rate = ov?.overrideRate ?? srv.defaultRate;
      }

      const revenue = Number(r.Calculated_Revenue ?? r.revenue ?? (patientCount * rate));

      // Resolve doctor remuneration
      let doctorVariablePayout = Number(r.Doctor_Payout ?? r.doctorVariablePayout ?? 0);
      if (doctorVariablePayout === 0) {
        const ov = newOverrides.find((o) => o.branchId === br.id && o.serviceId === srv.id) ||
                   existingOverrides.find((o) => o.branchId === br.id && o.serviceId === srv.id);
        const model = ov?.overridePayoutModel ?? srv.payoutModel;
        const revSharePct = ov?.overrideRevSharePct ?? srv.defaultRevSharePct;
        if (model === 'REVENUE_SHARE' || model === 'HYBRID') {
          doctorVariablePayout = Math.round(revenue * (revSharePct / 100));
        }
      }

      newDailyEntries.push({
        id: `${br.id}_${dateStr}_${srv.id}`,
        branchId: br.id,
        date: dateStr,
        department: dept,
        serviceId: srv.id,
        patientCount,
        rate,
        revenue,
        doctorVariablePayout,
      });
    });
  }

  // ----------------------------------------------------
  // 5. PARSE Occupied_Dialysis_Slots
  // ----------------------------------------------------
  const sheetDialysis =
    workbook.Sheets['Occupied_Dialysis_Slots'] ||
    workbook.Sheets['Dialysis_Slots'] ||
    workbook.Sheets['DialysisSlots'];
  if (sheetDialysis) {
    const rows: any[] = XLSX.utils.sheet_to_json(sheetDialysis);
    rows.forEach((r, idx) => {
      const dateStr = normalizeDateStr(r.Date || r.date);
      if (!dateStr) {
        warnings.push(`Occupied_Dialysis_Slots row #${idx + 2} has invalid or missing Date.`);
        return;
      }

      // STRICT SUNDAY LOCK: Never import Sunday dialysis sessions
      if (getDay(parseISO(dateStr)) === 0) {
        skippedSundaysCount += 1;
        return;
      }

      const br = resolveBranch(r.Branch_Code || r.branchId);
      const machineIndex = Math.max(1, parseInt(r.Machine_Index ?? r.machineIndex ?? 1, 10));
      const slotIndex = Math.max(1, parseInt(r.Shift_Index ?? r.slotIndex ?? 1, 10));
      const slotType: DialysisSlotType = String(r.Slot_Type ?? r.slotType ?? 'STANDARD').toUpperCase() as DialysisSlotType;
      const appliedRate = Number(r.Applied_Rate ?? r.appliedRate ?? 1800);

      newDialysisSlots.push({
        id: `${br.id}_${dateStr}_M${machineIndex}_S${slotIndex}`,
        branchId: br.id,
        date: dateStr,
        machineIndex,
        slotIndex,
        isOccupied: true,
        slotType,
        appliedRate,
      });
    });
  }

  // ----------------------------------------------------
  // 6. ATOMIC DEXIE TRANSACTION EXECUTION
  // ----------------------------------------------------
  try {
    await db.transaction(
      'rw',
      [
        db.branches,
        db.serviceCatalog,
        db.rateOverrides,
        db.departmentCosts,
        db.monthlyCosts,
        db.dailyEntries,
        db.dialysisSlots,
        db.meta,
      ],
      async () => {
        if (mode === 'OVERWRITE') {
          if (newDailyEntries.length > 0) await db.dailyEntries.clear();
          if (newDialysisSlots.length > 0) await db.dialysisSlots.clear();
          if (newDeptCosts.length > 0) {
            await db.departmentCosts.clear();
            await db.monthlyCosts.clear();
          }
          if (newCatalog.length > 0) await db.serviceCatalog.clear();
          if (newOverrides.length > 0) await db.rateOverrides.clear();
        }

        if (newBranches.length > 0) await db.branches.bulkPut(newBranches);
        if (newCatalog.length > 0) await db.serviceCatalog.bulkPut(newCatalog);
        if (newOverrides.length > 0) await db.rateOverrides.bulkPut(newOverrides);
        if (newDeptCosts.length > 0) await db.departmentCosts.bulkPut(newDeptCosts);
        if (newMonthlyCosts.length > 0) await db.monthlyCosts.bulkPut(newMonthlyCosts);
        if (newDailyEntries.length > 0) await db.dailyEntries.bulkPut(newDailyEntries);
        if (newDialysisSlots.length > 0) await db.dialysisSlots.bulkPut(newDialysisSlots);

        await db.meta.put({ key: 'isEdited', value: true });
      }
    );

    triggerAutoSync();

    return {
      success: true,
      mode,
      importedAt: new Date().toISOString(),
      auditCounts: {
        branches: newBranches.length,
        serviceCatalog: newCatalog.length,
        rateOverrides: newOverrides.length,
        departmentCosts: newDeptCosts.length,
        monthlyCosts: newMonthlyCosts.length,
        dailyEntries: newDailyEntries.length,
        dialysisSlots: newDialysisSlots.length,
      },
      skippedSundaysCount,
      warnings,
      errors: [],
    };
  } catch (err: any) {
    errors.push(`Database transaction failed: ${err.message || 'Unknown database error'}`);
    return {
      success: false,
      mode,
      importedAt: new Date().toISOString(),
      auditCounts: {
        branches: 0,
        serviceCatalog: 0,
        rateOverrides: 0,
        departmentCosts: 0,
        monthlyCosts: 0,
        dailyEntries: 0,
        dialysisSlots: 0,
      },
      skippedSundaysCount,
      warnings,
      errors,
    };
  }
}
