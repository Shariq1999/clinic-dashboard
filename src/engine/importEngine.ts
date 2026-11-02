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
export function normalizeDateStr(val: any): string | null {
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
    const parsed = parseISO(trimmed);
    if (isValid(parsed) && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
    const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return null;
}

// Year-Month normalization helper
export function normalizeYmStr(val: any): string | null {
  if (!val) return null;
  const dStr = normalizeDateStr(val);
  if (dStr) return dStr.slice(0, 7);

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;
  }
  return null;
}

// Core processor for parsed sheet tables (Used by both XLSX/CSV file upload and Google Sheets sync)
export async function importParsedSpreadsheetData(
  sheetsData: Record<string, any[]>,
  mode: 'MERGE' | 'OVERWRITE' = 'MERGE'
): Promise<ImportResultSummary> {
  const warnings: string[] = [];
  const errors: string[] = [];
  let skippedSundaysCount = 0;

  // Load existing baseline data for reconciliation
  const existingBranches = await db.branches.toArray();
  const existingCatalog = await db.serviceCatalog.toArray();
  const existingOverrides = await db.rateOverrides.toArray();

  // Create fast lookup maps
  const branchMap = new Map<string, Branch>();
  existingBranches.forEach((b) => {
    branchMap.set(b.id.toLowerCase(), b);
    branchMap.set(b.code.toLowerCase(), b);
    branchMap.set(b.name.toLowerCase(), b);
  });

  const catalogMap = new Map<string, ServiceCatalogItem>();
  existingCatalog.forEach((c) => {
    catalogMap.set(c.id.toLowerCase(), c);
    catalogMap.set(c.name.toLowerCase(), c);
  });

  const newBranches: Branch[] = [];
  const newCatalog: ServiceCatalogItem[] = [];
  const newOverrides: BranchRateOverride[] = [];
  const newDeptCosts: DepartmentCostRecord[] = [];
  const newDailyEntries: DailyDepartmentEntry[] = [];
  const newDialysisSlots: DialysisSlotRecord[] = [];

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
    warnings.push(`Auto-registered branch code "${cleanCode}" encountered.`);
    return newBr;
  };

  const resolveService = (rawName: any, dept: DepartmentId): ServiceCatalogItem => {
    const str = String(rawName || '').trim().toLowerCase();
    const found = catalogMap.get(str);
    if (found) return found;

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
  // 1. PARSE RateCard_Consultation (Rate Card, Consultation Revenue & Doctor Payouts)
  // ----------------------------------------------------
  const rateCardRows =
    sheetsData['RateCard_Consultation'] ||
    sheetsData['RateCard_Master'] ||
    sheetsData['Rate Card & Consultation'] ||
    sheetsData['Rate Card'] ||
    sheetsData['Consultations'] ||
    [];

  rateCardRows.forEach((r) => {
    const name = String(r.Service_Name || r.serviceName || r.name || '').trim();
    if (!name) return;
    const dept: DepartmentId = String(r.Department || r.department || 'BLOOD_TEST').toUpperCase() as DepartmentId;
    const existing = catalogMap.get(name.toLowerCase());

    const defaultRate = Number(
      r.Default_Rate ?? r.defaultRate ?? r.Consultation_Fee ?? r.rate ?? 500
    );
    const payoutModel = (
      r.Payout_Model ||
      r.payoutModel ||
      (dept === 'CONSULTATION' ? 'REVENUE_SHARE' : 'NONE')
    ).toUpperCase() as DoctorPayoutModel;

    const srvRecord: ServiceCatalogItem = {
      id: existing?.id || `srv_imp_${name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24)}`,
      name,
      department: dept,
      subCategory: r.Sub_Category || r.subCategory || existing?.subCategory,
      defaultRate,
      payoutModel,
      defaultRevSharePct: Number(r.Doctor_Rev_Share_Pct ?? r.Rev_Share_Pct ?? r.defaultRevSharePct ?? 0),
      defaultFixedMonthlyFee: Number(r.Doctor_Fixed_Monthly_Fee ?? r.Fixed_Monthly_Fee ?? r.defaultFixedMonthlyFee ?? 0),
      isActive: true,
    };
    newCatalog.push(srvRecord);
    catalogMap.set(srvRecord.id.toLowerCase(), srvRecord);
    catalogMap.set(srvRecord.name.toLowerCase(), srvRecord);

    // If row includes branch override details
    if (r.Branch_Code || r.branchId) {
      const br = resolveBranch(r.Branch_Code || r.branchId);
      const overrideRate = r.Branch_Override_Rate ?? r.overrideRate;
      if (overrideRate !== undefined && overrideRate !== '') {
        newOverrides.push({
          id: `${br.id}_${srvRecord.id}`,
          branchId: br.id,
          serviceId: srvRecord.id,
          overrideRate: Number(overrideRate),
          overridePayoutModel: payoutModel,
          overrideRevSharePct: srvRecord.defaultRevSharePct,
          overrideFixedMonthlyFee: srvRecord.defaultFixedMonthlyFee,
        });
      }
    }
  });

  // ----------------------------------------------------
  // 2. PARSE Costs_Per_Lab (Department and Lab Costs)
  // ----------------------------------------------------
  const costRows =
    sheetsData['Costs_Per_Lab'] ||
    sheetsData['Costs per Lab'] ||
    sheetsData['Department_Costs'] ||
    sheetsData['Dept_Costs'] ||
    sheetsData['Lab_Costs'] ||
    [];

  costRows.forEach((r, idx) => {
    const ym = normalizeYmStr(r.Year_Month || r.yearMonth || r.Month);
    if (!ym) {
      warnings.push(`Costs_Per_Lab row #${idx + 2} has invalid or missing Year_Month.`);
      return;
    }
    const br = resolveBranch(r.Branch_Code || r.branchId);
    const dept: DepartmentId = String(
      r.Lab_Department || r.department || r.Department || 'BLOOD_TEST'
    ).toUpperCase() as DepartmentId;

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

  // Auto-aggregate Department Costs into Monthly Costs
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
  // 3. PARSE Dialysis_Slots (Dialysis Slots Occupancy)
  // ----------------------------------------------------
  const dialysisRows =
    sheetsData['Dialysis_Slots'] ||
    sheetsData['Dialysis Slots'] ||
    sheetsData['Occupied_Dialysis_Slots'] ||
    sheetsData['DialysisSlots'] ||
    [];

  dialysisRows.forEach((r, idx) => {
    const dateStr = normalizeDateStr(r.Date || r.date);
    if (!dateStr) {
      warnings.push(`Dialysis_Slots row #${idx + 2} has invalid or missing Date.`);
      return;
    }

    // STRICT SUNDAY LOCK: Clinical safety policy strictly excludes Sunday dialysis
    if (getDay(parseISO(dateStr)) === 0) {
      skippedSundaysCount += 1;
      return;
    }

    const br = resolveBranch(r.Branch_Code || r.branchId);
    const machineIndex = Math.max(1, parseInt(r.Machine_Index ?? r.machineIndex ?? 1, 10));
    const slotIndex = Math.max(1, parseInt(r.Shift_Index ?? r.slotIndex ?? 1, 10));
    const slotType: DialysisSlotType = String(
      r.Slot_Type ?? r.slotType ?? 'STANDARD'
    ).toUpperCase() as DialysisSlotType;
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

  // ----------------------------------------------------
  // 4. PARSE Daily_Dept_Revenue (if present)
  // ----------------------------------------------------
  const dailyRows =
    sheetsData['Daily_Dept_Revenue'] ||
    sheetsData['Daily_Entries'] ||
    sheetsData['DailyRevenue'] ||
    [];

  dailyRows.forEach((r, idx) => {
    const dateStr = normalizeDateStr(r.Date || r.date);
    if (!dateStr) {
      warnings.push(`Daily_Dept_Revenue row #${idx + 2} has invalid or missing Date.`);
      return;
    }

    const br = resolveBranch(r.Branch_Code || r.branchId);
    const dept: DepartmentId = String(r.Department || r.department || 'BLOOD_TEST').toUpperCase() as DepartmentId;
    if (dept === 'DIALYSIS') return; // Dialysis managed via slot matrix

    const srvName = String(r.Service_Name || r.serviceId || 'General Modality').trim();
    const srv = resolveService(srvName, dept);
    const patientCount = Math.max(0, parseInt(r.Patient_Count ?? r.patientCount ?? 1, 10));

    let rate = Number(r.Applied_Rate ?? r.rate ?? 0);
    if (rate <= 0) {
      const ov =
        newOverrides.find((o) => o.branchId === br.id && o.serviceId === srv.id) ||
        existingOverrides.find((o) => o.branchId === br.id && o.serviceId === srv.id);
      rate = ov?.overrideRate ?? srv.defaultRate;
    }

    const revenue = Number(r.Calculated_Revenue ?? r.revenue ?? patientCount * rate);

    let doctorVariablePayout = Number(r.Doctor_Payout ?? r.doctorVariablePayout ?? 0);
    if (doctorVariablePayout === 0) {
      const ov =
        newOverrides.find((o) => o.branchId === br.id && o.serviceId === srv.id) ||
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

  // ----------------------------------------------------
  // 5. ATOMIC DEXIE TRANSACTION
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

// ----------------------------------------------------------------------
// IMPORT SPREADSHEET FILE (.XLSX OR .CSV ONLY - STRICTLY NO JSON)
// ----------------------------------------------------------------------
export async function importSpreadsheetFile(
  file: File,
  mode: 'MERGE' | 'OVERWRITE' = 'MERGE'
): Promise<ImportResultSummary> {
  const fileName = (file.name || '').toLowerCase();
  const fileType = (file.type || '').toLowerCase();

  // EXPLICIT JSON REJECTION: JSON files are strictly forbidden
  if (
    fileName.endsWith('.json') ||
    fileType === 'application/json' ||
    fileType.includes('json')
  ) {
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
      errors: [
        'JSON files are not accepted. Only .xlsx (Excel) or .csv (Comma-Separated Values) file formats are accepted for import.',
      ],
    };
  }

  // Validate supported extensions
  const isXlsx = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileType.includes('spreadsheetml');
  const isCsv = fileName.endsWith('.csv') || fileType.includes('csv') || fileType === 'text/plain';

  if (!isXlsx && !isCsv) {
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
      errors: [
        `Unsupported file type (${file.name}). Please upload a valid .xlsx or .csv file.`,
      ],
    };
  }

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
      errors: [`Failed to parse spreadsheet file: ${err.message || 'Corrupted or unsupported format'}`],
    };
  }

  const sheetsData: Record<string, any[]> = {};

  if (isCsv) {
    // Single sheet in CSV: Auto-detect dataset by inspecting header column keys
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
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
        errors: ['The uploaded CSV file is empty.'],
      };
    }

    const firstRowKeys = Object.keys(rows[0]).map((k) => k.toLowerCase());

    if (firstRowKeys.some((k) => k.includes('machine') || k.includes('shift') || k.includes('slot'))) {
      sheetsData['Dialysis_Slots'] = rows;
    } else if (firstRowKeys.some((k) => k.includes('payout') || k.includes('share') || k.includes('consultation') || (k.includes('rate') && k.includes('service')))) {
      sheetsData['RateCard_Consultation'] = rows;
    } else if (firstRowKeys.some((k) => k.includes('lab') || k.includes('rent') || k.includes('staffing') || k.includes('electricity') || k.includes('consumables'))) {
      sheetsData['Costs_Per_Lab'] = rows;
    } else if (firstRowKeys.some((k) => k.includes('patient') || k.includes('revenue') || k.includes('encounter'))) {
      sheetsData['Daily_Dept_Revenue'] = rows;
    } else {
      // Fallback: check filename hints
      if (fileName.includes('dialysis') || fileName.includes('slot')) {
        sheetsData['Dialysis_Slots'] = rows;
      } else if (fileName.includes('rate') || fileName.includes('consult')) {
        sheetsData['RateCard_Consultation'] = rows;
      } else if (fileName.includes('cost') || fileName.includes('lab') || fileName.includes('opex')) {
        sheetsData['Costs_Per_Lab'] = rows;
      } else {
        sheetsData['Daily_Dept_Revenue'] = rows;
      }
    }
  } else {
    // Standard Multi-Sheet XLSX
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      sheetsData[sheetName] = XLSX.utils.sheet_to_json(sheet);
    });
  }

  return importParsedSpreadsheetData(sheetsData, mode);
}

// Backward-compatible alias for existing imports
export const importExcelWorkbook = importSpreadsheetFile;
