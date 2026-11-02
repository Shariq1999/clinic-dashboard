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
  PatientInvoiceRecord,
  OpdRoomSlotBooking,
  OpdRoomId,
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
    patientInvoices: number;
    opdRoomSlots: number;
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
  const newPatientInvoices: PatientInvoiceRecord[] = [];
  const newOpdRoomSlots: OpdRoomSlotBooking[] = [];

  const resolveBranch = (rawCode: any, defaultId: 'br_dar_ul_shifa' | 'br_saifee_diag' = 'br_dar_ul_shifa'): Branch => {
    if (!rawCode) {
      const foundDefault = existingBranches.find((b) => b.id === defaultId) || existingBranches[0];
      return foundDefault || {
        id: defaultId,
        code: defaultId === 'br_dar_ul_shifa' ? 'DUS' : 'SDC',
        name: defaultId === 'br_dar_ul_shifa' ? 'Dar ul Shifa' : 'Saifee Diagnostics Center',
        location: 'Mumbai',
        isActive: true,
        sundayOpen: false,
      };
    }
    const str = String(rawCode).trim().toLowerCase();
    const found = branchMap.get(str);
    if (found) return found;

    if (str.includes('dar') || str.includes('shifa') || str === 'dus') {
      const b = existingBranches.find((x) => x.code === 'DUS') || existingBranches[0];
      if (b) return b;
    }
    if (str.includes('saifee') || str === 'sdc') {
      const b = existingBranches.find((x) => x.code === 'SDC') || existingBranches[1];
      if (b) return b;
    }

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
    warnings.push(`Auto-registered branch "${cleanCode}".`);
    return newBr;
  };

  // --------------------------------------------------------------------
  // 1. PARSE Tab 1: Dar Al Shifa (Patient Invoices)
  // --------------------------------------------------------------------
  const dusInvoiceRows =
    sheetsData['Dar Al Shifa'] ||
    sheetsData['Dar_Al_Shifa'] ||
    sheetsData['DarAlShifa'] ||
    sheetsData['DUS_Invoices'] ||
    [];

  dusInvoiceRows.forEach((r, idx) => {
    const invNum = String(
      r['Invoice number'] || r['Invoice Number'] || r.invoiceNumber || r.InvoiceNumber || `INV-DUS-${idx + 1}`
    ).trim();
    const netAmt = Number(r['Net Amt'] ?? r['Net Amt(₹)'] ?? r.netAmt ?? r.NetAmt ?? 0);
    const umr = String(r['UMR'] || r['UMR#'] || r.umr || r.Umr || `UMR-DUS-${idx + 1}`).trim();
    const patientName = String(r['Patient Name'] || r.patientName || r.PatientName || 'Anonymous Patient').trim();
    const ageGender = String(r['Age/Gender'] || r['Age / Gender'] || r.ageGender || r.AgeGender || '').trim();
    const personalContact = String(
      r['Personal contact'] || r['Mobile#'] || r['Doctor Name'] || r.personalContact || r.PersonalContact || ''
    ).trim();
    const timeOfBill = String(
      r['time of Bill'] || r['Invoice Date & Time'] || r.timeOfBill || r.TimeOfBill || format(new Date(), 'yyyy-MM-dd HH:mm')
    ).trim();

    newPatientInvoices.push({
      id: `br_dar_ul_shifa_${invNum}`,
      branchId: 'br_dar_ul_shifa',
      srNo: Number(r['Sr. no.'] ?? r['Sr. No'] ?? r.srNo ?? idx + 1),
      invoiceNumber: invNum,
      timeOfBill,
      netAmt,
      umr,
      patientName,
      ageGender,
      personalContact,
    });
  });

  // --------------------------------------------------------------------
  // 2. PARSE Tab 2: Saifee Diagnostic Centre (Patient Invoices)
  // --------------------------------------------------------------------
  const sdcInvoiceRows =
    sheetsData['Saifee Diagnostic Centre'] ||
    sheetsData['Saifee_Diagnostic_Centre'] ||
    sheetsData['Saifee Diagnostic'] ||
    sheetsData['SaifeeDiagnosticCentre'] ||
    sheetsData['SDC_Invoices'] ||
    [];

  sdcInvoiceRows.forEach((r, idx) => {
    const invNum = String(
      r['Invoice number'] || r['Invoice Number'] || r.invoiceNumber || r.InvoiceNumber || `INV-SDC-${idx + 1}`
    ).trim();
    const netAmt = Number(r['Net Amt'] ?? r['Net Amt(₹)'] ?? r.netAmt ?? r.NetAmt ?? 0);
    const umr = String(r['UMR'] || r['UMR#'] || r.umr || r.Umr || `UMR-SDC-${idx + 1}`).trim();
    const patientName = String(r['Patient Name'] || r.patientName || r.PatientName || 'Anonymous Patient').trim();
    const ageGender = String(r['Age/Gender'] || r['Age / Gender'] || r.ageGender || r.AgeGender || '').trim();
    const personalContact = String(
      r['Personal contact'] || r['Mobile#'] || r.personalContact || r.PersonalContact || ''
    ).trim();
    const timeOfBill = String(
      r['time of Bill'] || r['Invoice Date & Time'] || r.timeOfBill || r.TimeOfBill || format(new Date(), 'yyyy-MM-dd HH:mm')
    ).trim();

    newPatientInvoices.push({
      id: `br_saifee_diag_${invNum}`,
      branchId: 'br_saifee_diag',
      srNo: Number(r['Sr. no.'] ?? r['Sr. No'] ?? r.srNo ?? idx + 1),
      invoiceNumber: invNum,
      timeOfBill,
      netAmt,
      umr,
      patientName,
      ageGender,
      personalContact,
    });
  });

  // --------------------------------------------------------------------
  // 3. PARSE Tab 3: OPD_Rooms (Saifee OPD 1, Dar Al Shifa OPD 1 & OPD 2)
  // 6 slots from 8am to 8pm, 7 days/week, 2500/2 hrs, weekly tables
  // --------------------------------------------------------------------
  const opdRows =
    sheetsData['OPD_Rooms'] ||
    sheetsData['OPD Rooms'] ||
    sheetsData['OPD_Booking_Slots'] ||
    sheetsData['OPD'] ||
    [];

  const timeSlotsHeader = [
    { key: '08:00 - 10:00', label: '08:00 AM - 10:00 AM', slotIdx: 1 },
    { key: '10:00 - 12:00', label: '10:00 AM - 12:00 PM', slotIdx: 2 },
    { key: '12:00 - 14:00', label: '12:00 PM - 02:00 PM', slotIdx: 3 },
    { key: '14:00 - 16:00', label: '02:00 PM - 04:00 PM', slotIdx: 4 },
    { key: '16:00 - 18:00', label: '04:00 PM - 06:00 PM', slotIdx: 5 },
    { key: '18:00 - 20:00', label: '06:00 PM - 08:00 PM', slotIdx: 6 },
  ];

  opdRows.forEach((r) => {
    const rawRoom = String(r.OPD_Room || r.Room || r.roomName || 'Saifee Diagnostic Centre - OPD 1').trim();
    const day = String(r.Day_of_Week || r.Day || r.dayOfWeek || 'Monday').trim();
    const rate = Number(r.Rate_Per_2Hrs ?? r.Rate ?? r.rate ?? 2500);
    const weekLabel = String(r.Week || r.weekLabel || r.Week_Label || 'Week 1').trim();
    const weekNumMatch = weekLabel.match(/\d+/);
    const weekNumber = weekNumMatch ? parseInt(weekNumMatch[0], 10) : 1;

    let roomId: OpdRoomId = 'SDC_OPD1';
    let branchId = 'br_saifee_diag';

    if (rawRoom.includes('Saifee') || rawRoom.includes('SDC')) {
      roomId = 'SDC_OPD1';
      branchId = 'br_saifee_diag';
    } else if (rawRoom.includes('OPD 2') || rawRoom.includes('OPD2')) {
      roomId = 'DUS_OPD2';
      branchId = 'br_dar_ul_shifa';
    } else {
      roomId = 'DUS_OPD1';
      branchId = 'br_dar_ul_shifa';
    }

    timeSlotsHeader.forEach(({ key, label, slotIdx }) => {
      const val = String(r[key] || r[label] || '').trim();
      const isBooked = Boolean(val && val.toLowerCase() !== 'available');
      let doctorName: string | undefined = undefined;
      let specialty: string | undefined = undefined;

      if (isBooked) {
        doctorName = val;
        const match = val.match(/(.*?)\s*\((.*?)\)/);
        if (match) {
          doctorName = match[1].trim();
          specialty = match[2].trim();
        }
      }

      newOpdRoomSlots.push({
        id: `${branchId}_${roomId}_W${weekNumber}_${day}_S${slotIdx}`,
        branchId,
        roomId,
        roomName: rawRoom,
        weekLabel,
        weekNumber,
        dayOfWeek: day,
        slotIndex: slotIdx,
        timeSlot: label,
        rate,
        doctorName,
        specialty,
        isBooked,
      });
    });
  });

  // --------------------------------------------------------------------
  // 4. PARSE Tab 4: Dialysis_slots (Date-wise tables per center)
  // --------------------------------------------------------------------
  const dialysisRows =
    sheetsData['Dialysis_slots'] ||
    sheetsData['Dialysis slots'] ||
    sheetsData['Dialysis_Slots'] ||
    sheetsData['Occupied_Dialysis_Slots'] ||
    sheetsData['DialysisSlots'] ||
    [];

  dialysisRows.forEach((r, idx) => {
    const dateStr = normalizeDateStr(r.Date || r.date);
    if (!dateStr) {
      warnings.push(`Dialysis_slots row #${idx + 2} has invalid or missing Date.`);
      return;
    }

    // STRICT SUNDAY LOCK: Safety rule strictly excludes Sunday dialysis
    if (getDay(parseISO(dateStr)) === 0) {
      skippedSundaysCount += 1;
      return;
    }

    const br = resolveBranch(r.Center || r.Branch_Code || r.branchId);

    // Parse machine index
    let machineIndex = 1;
    if (r.Machine) {
      const match = String(r.Machine).match(/\d+/);
      if (match) machineIndex = parseInt(match[0], 10);
    } else {
      machineIndex = Math.max(1, parseInt(r.Machine_Index ?? r.machineIndex ?? 1, 10));
    }

    // Parse shift index
    let slotIndex = 1;
    if (r.Shift) {
      const match = String(r.Shift).match(/\d+/);
      if (match) slotIndex = parseInt(match[0], 10);
    } else {
      slotIndex = Math.max(1, parseInt(r.Shift_Index ?? r.slotIndex ?? 1, 10));
    }

    const slotType: DialysisSlotType = String(
      r.Slot_Type ?? r.slotType ?? 'STANDARD'
    ).toUpperCase() as DialysisSlotType;
    const appliedRate = Number(r.Applied_Rate ?? r.appliedRate ?? (slotType === 'SINGLE_USE' ? 2200 : 1800));

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

  // --------------------------------------------------------------------
  // 5. PARSE Tab 5: Costs_per_lab (Categorized monthly OPEX from July 2026)
  // Rows: Consumables, Manpower, Rent, Electricity, Misc, Total
  // Columns: Dialysis, Blood_Tests, USG, X_Ray, Physiotherapy, Consultation, Branch_Total
  // --------------------------------------------------------------------
  const costRows =
    sheetsData['Costs_per_lab'] ||
    sheetsData['Costs per lab'] ||
    sheetsData['Costs_Per_Lab'] ||
    sheetsData['Department_Costs'] ||
    sheetsData['Dept_Costs'] ||
    sheetsData['Lab_Costs'] ||
    [];

  // Two structures supported:
  // Format A: Categorized matrix (Month, Branch, Expense_Category, Dialysis, Blood_Tests, USG, X_Ray, Physio, Consultation)
  // Format B: Flat records (Year_Month, Branch_Code, Lab_Department, Rent, Electricity, Staffing, Consumables, Licensing, Other)

  const isCategorizedMatrix = costRows.some((r) => r.Expense_Category !== undefined);

  if (isCategorizedMatrix) {
    // Map categorized matrix rows into DepartmentCostRecord
    const aggregatedDepts = new Map<string, DepartmentCostRecord>();
    const deptKeys: Array<{ col: string; id: DepartmentId }> = [
      { col: 'Dialysis', id: 'DIALYSIS' },
      { col: 'Blood_Tests', id: 'BLOOD_TEST' },
      { col: 'Blood Tests', id: 'BLOOD_TEST' },
      { col: 'USG', id: 'USG' },
      { col: 'X_Ray', id: 'XRAY' },
      { col: 'X-Ray', id: 'XRAY' },
      { col: 'Physiotherapy', id: 'PHYSIO' },
      { col: 'Consultation', id: 'CONSULTATION' },
    ];

    costRows.forEach((r) => {
      const ym = normalizeYmStr(r.Month || r.Year_Month || r.yearMonth);
      if (!ym) return;

      const br = resolveBranch(r.Branch || r.Branch_Code || r.branchId);
      const cat = String(r.Expense_Category || '').trim().toLowerCase();
      if (cat === 'total') return; // Skip total row, will compute sum

      deptKeys.forEach(({ col, id }) => {
        const val = Number(r[col] ?? 0);
        if (val === 0 && r[col] === undefined) return;

        const recordId = `${br.id}_${ym}_${id}`;
        const existing = aggregatedDepts.get(recordId) || {
          id: recordId,
          branchId: br.id,
          yearMonth: ym,
          department: id,
          rent: 0,
          electricity: 0,
          staffing: 0,
          consumables: 0,
          licensing: 0,
          other: 0,
          fixedOpeXTotal: 0,
        };

        if (cat.includes('consumable')) existing.consumables = val;
        else if (cat.includes('manpower') || cat.includes('staff')) existing.staffing = val;
        else if (cat.includes('rent')) existing.rent = val;
        else if (cat.includes('electr')) existing.electricity = val;
        else if (cat.includes('misc') || cat.includes('other') || cat.includes('licens')) {
          existing.other = Math.round(val * 0.5);
          existing.licensing = Math.round(val * 0.5);
        }

        existing.fixedOpeXTotal =
          existing.rent + existing.electricity + existing.staffing +
          existing.consumables + existing.licensing + existing.other;

        aggregatedDepts.set(recordId, existing);
      });
    });

    aggregatedDepts.forEach((rec) => newDeptCosts.push(rec));
  } else {
    // Format B: Flat records
    costRows.forEach((r, idx) => {
      const ym = normalizeYmStr(r.Year_Month || r.yearMonth || r.Month);
      if (!ym) {
        warnings.push(`Costs_per_lab row #${idx + 2} has invalid or missing Month.`);
        return;
      }
      const br = resolveBranch(r.Branch_Code || r.branchId);
      const dept: DepartmentId = String(
        r.Lab_Department || r.department || r.Department || 'BLOOD_TEST'
      ).toUpperCase() as DepartmentId;

      const rent = Number(r.Rent ?? r.rent ?? 0);
      const electricity = Number(r.Electricity ?? r.electricity ?? 0);
      const staffing = Number(r.Staffing ?? r.staffing ?? r.Manpower ?? 0);
      const consumables = Number(r.Consumables ?? r.consumables ?? 0);
      const licensing = Number(r.Licensing ?? r.licensing ?? 0);
      const other = Number(r.Other ?? r.other ?? r.Misc ?? 0);
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

  // --------------------------------------------------------------------
  // 6. ATOMIC DEXIE TRANSACTION
  // --------------------------------------------------------------------
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
        db.patientInvoices,
        db.opdRoomSlots,
        db.meta,
      ],
      async () => {
        if (mode === 'OVERWRITE') {
          if (newPatientInvoices.length > 0) await db.patientInvoices.clear();
          if (newOpdRoomSlots.length > 0) await db.opdRoomSlots.clear();
          if (newDialysisSlots.length > 0) await db.dialysisSlots.clear();
          if (newDeptCosts.length > 0) {
            await db.departmentCosts.clear();
            await db.monthlyCosts.clear();
          }
          if (newDailyEntries.length > 0) await db.dailyEntries.clear();
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
        if (newPatientInvoices.length > 0) await db.patientInvoices.bulkPut(newPatientInvoices);
        if (newOpdRoomSlots.length > 0) await db.opdRoomSlots.bulkPut(newOpdRoomSlots);

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
        patientInvoices: newPatientInvoices.length,
        opdRoomSlots: newOpdRoomSlots.length,
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
        patientInvoices: 0,
        opdRoomSlots: 0,
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
        patientInvoices: 0,
        opdRoomSlots: 0,
      },
      skippedSundaysCount: 0,
      warnings: [],
      errors: [
        'JSON files are not accepted. Only .xlsx (Excel) or .csv (Comma-Separated Values) file formats are accepted for import.',
      ],
    };
  }

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
        patientInvoices: 0,
        opdRoomSlots: 0,
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
        patientInvoices: 0,
        opdRoomSlots: 0,
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
          patientInvoices: 0,
          opdRoomSlots: 0,
        },
        skippedSundaysCount: 0,
        warnings: [],
        errors: ['The uploaded CSV file is empty.'],
      };
    }

    const firstRowKeys = Object.keys(rows[0]).map((k) => k.toLowerCase());

    if (firstRowKeys.some((k) => k.includes('invoice') || k.includes('umr') || k.includes('bill'))) {
      if (fileName.includes('saifee') || fileName.includes('sdc')) {
        sheetsData['Saifee Diagnostic Centre'] = rows;
      } else {
        sheetsData['Dar Al Shifa'] = rows;
      }
    } else if (firstRowKeys.some((k) => k.includes('opd') || k.includes('08:00') || k.includes('rate_per'))) {
      sheetsData['OPD_Rooms'] = rows;
    } else if (firstRowKeys.some((k) => k.includes('machine') || k.includes('shift') || k.includes('dialysis') || k.includes('slot'))) {
      sheetsData['Dialysis_slots'] = rows;
    } else if (firstRowKeys.some((k) => k.includes('expense_category') || k.includes('consumables') || k.includes('manpower') || k.includes('rent'))) {
      sheetsData['Costs_per_lab'] = rows;
    } else {
      sheetsData['Dialysis_slots'] = rows;
    }
  } else {
    // Multi-Sheet XLSX
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      sheetsData[sheetName] = XLSX.utils.sheet_to_json(sheet);
    });
  }

  return importParsedSpreadsheetData(sheetsData, mode);
}

// Backward-compatible alias
export const importExcelWorkbook = importSpreadsheetFile;
