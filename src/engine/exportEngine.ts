import * as XLSX from 'xlsx';
import { db } from '../db/database';
import { computeDepartmentProfitability } from './financialEngine';
import { OpdRoomId, PatientInvoiceRecord } from '../types/schema';

// Helper to set standard auto-fit column widths
function setColWidths(ws: XLSX.WorkSheet, data: any[]) {
  if (!data || data.length === 0) return;
  const colWidths = Object.keys(data[0]).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => (row[key] !== undefined && row[key] !== null ? String(row[key]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 3, 11), 45) };
  });
  ws['!cols'] = colWidths;
}

// Helper to trigger browser download of CSV string
function downloadCsvBlob(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// Default sample patient invoices if database table is not yet seeded
function getSampleInvoices(branchCode: 'DUS' | 'SDC') {
  const names = [
    { name: 'Fatima Khan', gender: '48 / F', contact: '+91 98201 12345' },
    { name: 'Mohammed Siddiqui', gender: '54 / M', contact: '+91 98202 23456' },
    { name: 'Ayesha Shaikh', gender: '36 / F', contact: '+91 98203 34567' },
    { name: 'Zoya Sayed', gender: '29 / F', contact: '+91 98204 45678' },
    { name: 'Imran Merchant', gender: '62 / M', contact: '+91 98205 56789' },
    { name: 'Yusuf Patel', gender: '45 / M', contact: '+91 98206 67890' },
    { name: 'Zainab Memon', gender: '51 / F', contact: '+91 98207 78901' },
    { name: 'Bilal Qureshi', gender: '39 / M', contact: '+91 98208 89012' },
  ];
  const times = ['08:45 AM', '09:15 AM', '10:30 AM', '11:15 AM', '02:30 PM', '04:15 PM', '05:30 PM', '06:45 PM'];
  const amts = [300, 500, 600, 900, 1200, 1800, 2200, 2500];

  return names.map((p, idx) => ({
    'Sr. no.': idx + 1,
    'Invoice number': `INV-${branchCode}-2026-${String(1001 + idx).padStart(5, '0')}`,
    'time of Bill': `2026-07-${String(idx + 1).padStart(2, '0')} ${times[idx % times.length]}`,
    'Net Amt': amts[idx % amts.length],
    'UMR': `UMR-${branchCode}-${String(5001 + idx).padStart(5, '0')}`,
    'Patient Name': p.name,
    'Age/Gender': p.gender,
    'Personal contact': p.contact,
  }));
}

// ----------------------------------------------------------------------
// 1. DOWNLOAD OFFICIAL 5-TAB CLINIC IMPORT TEMPLATE (.XLSX)
// Tab 1: Dar Al Shifa
// Tab 2: Saifee Diagnostic Centre
// Tab 3: OPD_Rooms (2500/2 hrs, 6 slots from 8am to 8pm, 7 days/week)
// Tab 4: Dialysis_slots (table for each date for each center)
// Tab 5: Costs_per_lab (Categorized monthly OPEX tables from July 2026)
// ----------------------------------------------------------------------
export async function downloadExcelImportTemplate(): Promise<void> {
  const wb = XLSX.utils.book_new();

  // --------------------------------------------------------------------
  // Tab 1: Dar Al Shifa (Patient Invoices / Billing)
  // --------------------------------------------------------------------
  const dusInvoices = getSampleInvoices('DUS');
  const wsDus = XLSX.utils.json_to_sheet(dusInvoices);
  setColWidths(wsDus, dusInvoices);
  XLSX.utils.book_append_sheet(wb, wsDus, 'Dar Al Shifa');

  // --------------------------------------------------------------------
  // Tab 2: Saifee Diagnostic Centre (Patient Invoices / Billing)
  // --------------------------------------------------------------------
  const sdcInvoices = getSampleInvoices('SDC');
  const wsSdc = XLSX.utils.json_to_sheet(sdcInvoices);
  setColWidths(wsSdc, sdcInvoices);
  XLSX.utils.book_append_sheet(wb, wsSdc, 'Saifee Diagnostic Centre');

  // --------------------------------------------------------------------
  // Tab 3: OPD_Rooms (Tables for SDC OPD 1, DUS OPD 1, DUS OPD 2)
  // Rate: 2500/2 hrs, 6 slots (8am-8pm), 7 days/week
  // --------------------------------------------------------------------
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const opdRoomsList: Array<{ id: OpdRoomId; name: string }> = [
    { id: 'SDC_OPD1', name: 'Saifee Diagnostic Centre - OPD 1' },
    { id: 'DUS_OPD1', name: 'Dar Al Shifa - OPD 1' },
    { id: 'DUS_OPD2', name: 'Dar Al Shifa - OPD 2' },
  ];

  const doctorsSample = [
    'Dr. Z. Qureshi (Nephrology)',
    'Dr. M. Ansari (Cardiology)',
    'Dr. S. Merchant (Gen. Medicine)',
    'Dr. A. Mehta (Endocrinology)',
    'Dr. F. Pathan (Orthopedics)',
    'Dr. R. Kazi (Urology)',
  ];

  const opdScheduleData: any[] = [];
  opdRoomsList.forEach((room) => {
    daysOfWeek.forEach((day, dIdx) => {
      opdScheduleData.push({
        OPD_Room: room.name,
        Day_of_Week: day,
        '08:00 - 10:00': doctorsSample[(dIdx + 0) % doctorsSample.length],
        '10:00 - 12:00': doctorsSample[(dIdx + 1) % doctorsSample.length],
        '12:00 - 14:00': 'Available',
        '14:00 - 16:00': doctorsSample[(dIdx + 3) % doctorsSample.length],
        '16:00 - 18:00': 'Available',
        '18:00 - 20:00': doctorsSample[(dIdx + 5) % doctorsSample.length],
        Rate_Per_2Hrs: 2500,
      });
    });
  });

  const wsOpd = XLSX.utils.json_to_sheet(opdScheduleData);
  setColWidths(wsOpd, opdScheduleData);
  XLSX.utils.book_append_sheet(wb, wsOpd, 'OPD_Rooms');

  // --------------------------------------------------------------------
  // Tab 4: Dialysis_slots (Table for each date for each center)
  // --------------------------------------------------------------------
  const dialysisDates = ['2026-07-01', '2026-07-02', '2026-07-03'];
  const centers = [
    { code: 'DUS', name: 'Dar Al Shifa' },
    { code: 'SDC', name: 'Saifee Diagnostic Centre' },
  ];

  const dialysisSlotsData: any[] = [];
  dialysisDates.forEach((dateStr) => {
    centers.forEach((center) => {
      for (let m = 1; m <= 4; m++) {
        dialysisSlotsData.push({
          Date: dateStr,
          Center: center.name,
          Machine: `Machine ${m}`,
          Shift: 'Shift 1 (08:00 - 12:00)',
          Slot_Type: m === 2 ? 'SINGLE_USE' : 'STANDARD',
          Applied_Rate: m === 2 ? 2200 : 1800,
          Patient_Name: `Patient M${m}-S1`,
          Booking_Status: 'Occupied',
        });
        dialysisSlotsData.push({
          Date: dateStr,
          Center: center.name,
          Machine: `Machine ${m}`,
          Shift: 'Shift 2 (12:30 - 16:30)',
          Slot_Type: 'STANDARD',
          Applied_Rate: 1800,
          Patient_Name: `Patient M${m}-S2`,
          Booking_Status: 'Occupied',
        });
      }
    });
  });

  const wsDialysis = XLSX.utils.json_to_sheet(dialysisSlotsData);
  setColWidths(wsDialysis, dialysisSlotsData);
  XLSX.utils.book_append_sheet(wb, wsDialysis, 'Dialysis_slots');

  // --------------------------------------------------------------------
  // Tab 5: Costs_per_lab (Categorized monthly OPEX tables from July 2026)
  // Rows: Consumables, Manpower, rent, Electricity, Misc, Total
  // Columns: Departments + Total
  // --------------------------------------------------------------------
  const months = ['2026-07', '2026-08', '2026-09'];
  const costsPerLabData: any[] = [];

  months.forEach((ym) => {
    centers.forEach((center) => {
      // Consumables row
      costsPerLabData.push({
        Month: ym,
        Branch: center.name,
        Expense_Category: 'Consumables',
        Dialysis: center.code === 'DUS' ? 32000 : 28000,
        Blood_Tests: center.code === 'DUS' ? 20000 : 18000,
        USG: center.code === 'DUS' ? 14000 : 12500,
        X_Ray: center.code === 'DUS' ? 12000 : 10500,
        Physiotherapy: center.code === 'DUS' ? 10000 : 9000,
        Consultation: center.code === 'DUS' ? 12000 : 10500,
        Branch_Total: center.code === 'DUS' ? 100000 : 88500,
      });

      // Manpower row
      costsPerLabData.push({
        Month: ym,
        Branch: center.name,
        Expense_Category: 'Manpower',
        Dialysis: center.code === 'DUS' ? 64000 : 56000,
        Blood_Tests: center.code === 'DUS' ? 40000 : 35000,
        USG: center.code === 'DUS' ? 28000 : 25000,
        X_Ray: center.code === 'DUS' ? 24000 : 21000,
        Physiotherapy: center.code === 'DUS' ? 20000 : 18000,
        Consultation: center.code === 'DUS' ? 24000 : 21000,
        Branch_Total: center.code === 'DUS' ? 200000 : 176000,
      });

      // Rent row
      costsPerLabData.push({
        Month: ym,
        Branch: center.name,
        Expense_Category: 'Rent',
        Dialysis: center.code === 'DUS' ? 44800 : 40000,
        Blood_Tests: center.code === 'DUS' ? 28000 : 25000,
        USG: center.code === 'DUS' ? 19600 : 17500,
        X_Ray: center.code === 'DUS' ? 16800 : 15000,
        Physiotherapy: center.code === 'DUS' ? 14000 : 12500,
        Consultation: center.code === 'DUS' ? 16800 : 15000,
        Branch_Total: center.code === 'DUS' ? 140000 : 125000,
      });

      // Electricity row
      costsPerLabData.push({
        Month: ym,
        Branch: center.name,
        Expense_Category: 'Electricity',
        Dialysis: center.code === 'DUS' ? 12800 : 12000,
        Blood_Tests: center.code === 'DUS' ? 8000 : 7500,
        USG: center.code === 'DUS' ? 5600 : 5000,
        X_Ray: center.code === 'DUS' ? 4800 : 4500,
        Physiotherapy: center.code === 'DUS' ? 4000 : 3500,
        Consultation: center.code === 'DUS' ? 4800 : 4500,
        Branch_Total: center.code === 'DUS' ? 40000 : 37000,
      });

      // Misc row
      costsPerLabData.push({
        Month: ym,
        Branch: center.name,
        Expense_Category: 'Misc',
        Dialysis: center.code === 'DUS' ? 9600 : 8000,
        Blood_Tests: center.code === 'DUS' ? 6000 : 5000,
        USG: center.code === 'DUS' ? 4200 : 3500,
        X_Ray: center.code === 'DUS' ? 3600 : 3000,
        Physiotherapy: center.code === 'DUS' ? 3000 : 2500,
        Consultation: center.code === 'DUS' ? 3600 : 3000,
        Branch_Total: center.code === 'DUS' ? 30000 : 25000,
      });

      // Total row
      costsPerLabData.push({
        Month: ym,
        Branch: center.name,
        Expense_Category: 'Total',
        Dialysis: center.code === 'DUS' ? 163200 : 144000,
        Blood_Tests: center.code === 'DUS' ? 102000 : 90500,
        USG: center.code === 'DUS' ? 71400 : 63500,
        X_Ray: center.code === 'DUS' ? 61200 : 54000,
        Physiotherapy: center.code === 'DUS' ? 51000 : 45500,
        Consultation: center.code === 'DUS' ? 61200 : 54000,
        Branch_Total: center.code === 'DUS' ? 510000 : 451500,
      });
    });
  });

  const wsCosts = XLSX.utils.json_to_sheet(costsPerLabData);
  setColWidths(wsCosts, costsPerLabData);
  XLSX.utils.book_append_sheet(wb, wsCosts, 'Costs_per_lab');

  XLSX.writeFile(wb, 'Clinic_Data_Import_Template.xlsx');
}

// ----------------------------------------------------------------------
// 2. EXPORT MASTER COMPREHENSIVE WORKBOOK (.XLSX)
// Populates the 5 operational sheets from live Dexie database
// ----------------------------------------------------------------------
export async function exportFullExcelWorkbook(): Promise<void> {
  const [
    branches,
    slots,
    departmentCosts,
    invoices,
    opdSlots,
  ] = await Promise.all([
    db.branches.toArray(),
    db.dialysisSlots.toArray(),
    db.departmentCosts.toArray(),
    db.patientInvoices.toArray(),
    db.opdRoomSlots.toArray(),
  ]);

  const branchCodeMap = new Map(branches.map((b) => [b.id, b.code]));
  const branchNameMap = new Map(branches.map((b) => [b.id, b.name]));
  const wb = XLSX.utils.book_new();

  // --------------------------------------------------------------------
  // Tab 1: Dar Al Shifa Invoices
  // --------------------------------------------------------------------
  const dusDbInvoices = invoices.filter((inv) => inv.branchId === 'br_dar_ul_shifa');
  const dusData = dusDbInvoices.length > 0
    ? dusDbInvoices.map((inv, idx) => ({
        'Sr. no.': inv.srNo || idx + 1,
        'Invoice number': inv.invoiceNumber,
        'time of Bill': inv.timeOfBill,
        'Net Amt': inv.netAmt,
        'UMR': inv.umr,
        'Patient Name': inv.patientName,
        'Age/Gender': inv.ageGender,
        'Personal contact': inv.personalContact,
      }))
    : getSampleInvoices('DUS');

  const wsDus = XLSX.utils.json_to_sheet(dusData);
  setColWidths(wsDus, dusData);
  XLSX.utils.book_append_sheet(wb, wsDus, 'Dar Al Shifa');

  // --------------------------------------------------------------------
  // Tab 2: Saifee Diagnostic Centre Invoices
  // --------------------------------------------------------------------
  const sdcDbInvoices = invoices.filter((inv) => inv.branchId === 'br_saifee_diag');
  const sdcData = sdcDbInvoices.length > 0
    ? sdcDbInvoices.map((inv, idx) => ({
        'Sr. no.': inv.srNo || idx + 1,
        'Invoice number': inv.invoiceNumber,
        'time of Bill': inv.timeOfBill,
        'Net Amt': inv.netAmt,
        'UMR': inv.umr,
        'Patient Name': inv.patientName,
        'Age/Gender': inv.ageGender,
        'Personal contact': inv.personalContact,
      }))
    : getSampleInvoices('SDC');

  const wsSdc = XLSX.utils.json_to_sheet(sdcData);
  setColWidths(wsSdc, sdcData);
  XLSX.utils.book_append_sheet(wb, wsSdc, 'Saifee Diagnostic Centre');

  // --------------------------------------------------------------------
  // Tab 3: OPD_Rooms (Saifee OPD 1, Dar Al Shifa OPD 1 & OPD 2)
  // --------------------------------------------------------------------
  let opdExportData: any[] = [];
  if (opdSlots.length > 0) {
    const grouped = new Map<string, Record<string, string>>();
    opdSlots.forEach((slot) => {
      const key = `${slot.roomName}__${slot.dayOfWeek}`;
      const existing = grouped.get(key) || {
        OPD_Room: slot.roomName,
        Day_of_Week: slot.dayOfWeek,
      };
      const slotHeader = slot.timeSlot.replace(' AM', '').replace(' PM', '').trim();
      existing[slot.timeSlot] = slot.doctorName ? `${slot.doctorName} (${slot.specialty || ''})` : 'Available';
      grouped.set(key, existing);
    });

    opdExportData = Array.from(grouped.values()).map((row) => ({
      OPD_Room: row.OPD_Room,
      Day_of_Week: row.Day_of_Week,
      '08:00 AM - 10:00 AM': row['08:00 AM - 10:00 AM'] || 'Available',
      '10:00 AM - 12:00 PM': row['10:00 AM - 12:00 PM'] || 'Available',
      '12:00 PM - 02:00 PM': row['12:00 PM - 02:00 PM'] || 'Available',
      '02:00 PM - 04:00 PM': row['02:00 PM - 04:00 PM'] || 'Available',
      '04:00 PM - 06:00 PM': row['04:00 PM - 06:00 PM'] || 'Available',
      '06:00 PM - 08:00 PM': row['06:00 PM - 08:00 PM'] || 'Available',
      Rate_Per_2Hrs: 2500,
    }));
  }

  if (opdExportData.length === 0) {
    // Generate default template data if table empty
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    ['Saifee Diagnostic Centre - OPD 1', 'Dar Al Shifa - OPD 1', 'Dar Al Shifa - OPD 2'].forEach((room) => {
      days.forEach((d) => {
        opdExportData.push({
          OPD_Room: room,
          Day_of_Week: d,
          '08:00 AM - 10:00 AM': 'Dr. Z. Qureshi (Nephrology)',
          '10:00 AM - 12:00 PM': 'Dr. M. Ansari (Cardiology)',
          '12:00 PM - 02:00 PM': 'Available',
          '02:00 PM - 04:00 PM': 'Dr. S. Merchant (Gen. Medicine)',
          '04:00 PM - 06:00 PM': 'Available',
          '06:00 PM - 08:00 PM': 'Dr. A. Mehta (Endocrinology)',
          Rate_Per_2Hrs: 2500,
        });
      });
    });
  }

  const wsOpd = XLSX.utils.json_to_sheet(opdExportData);
  setColWidths(wsOpd, opdExportData);
  XLSX.utils.book_append_sheet(wb, wsOpd, 'OPD_Rooms');

  // --------------------------------------------------------------------
  // Tab 4: Dialysis_slots (Date-wise center-wise tables)
  // --------------------------------------------------------------------
  const dialysisData = slots
    .filter((s) => s.isOccupied)
    .map((s) => ({
      Date: s.date,
      Center: branchNameMap.get(s.branchId) || branchCodeMap.get(s.branchId) || s.branchId,
      Machine: `Machine ${s.machineIndex}`,
      Shift: s.slotIndex === 1 ? 'Shift 1 (08:00 - 12:00)' : 'Shift 2 (12:30 - 16:30)',
      Slot_Type: s.slotType,
      Applied_Rate: s.appliedRate,
      Patient_Name: `Patient M${s.machineIndex}-S${s.slotIndex}`,
      Booking_Status: 'Occupied',
    }));

  const wsDialysis = XLSX.utils.json_to_sheet(dialysisData);
  setColWidths(wsDialysis, dialysisData);
  XLSX.utils.book_append_sheet(wb, wsDialysis, 'Dialysis_slots');

  // --------------------------------------------------------------------
  // Tab 5: Costs_per_lab (Categorized OPEX from July 2026 onwards)
  // --------------------------------------------------------------------
  // Filter department costs for July 2026 and after (e.g. 2026-07, 2026-08, 2026-09)
  const filteredCosts = departmentCosts.filter((dc) => dc.yearMonth >= '2026-07');
  const targetCosts = filteredCosts.length > 0 ? filteredCosts : departmentCosts;

  // Group by (yearMonth + branchId)
  const monthBranchMap = new Map<string, typeof departmentCosts>();
  targetCosts.forEach((dc) => {
    const key = `${dc.yearMonth}__${dc.branchId}`;
    const list = monthBranchMap.get(key) || [];
    list.push(dc);
    monthBranchMap.set(key, list);
  });

  const costsPerLabRows: any[] = [];
  const categories = [
    { key: 'consumables', label: 'Consumables' },
    { key: 'staffing', label: 'Manpower' },
    { key: 'rent', label: 'Rent' },
    { key: 'electricity', label: 'Electricity' },
    { key: 'other', label: 'Misc' },
  ];

  monthBranchMap.forEach((deptList, key) => {
    const [ym, brId] = key.split('__');
    const branchName = branchNameMap.get(brId) || branchCodeMap.get(brId) || brId;

    const findDeptCost = (deptId: string, catKey: string): number => {
      const rec = deptList.find((d) => d.department === deptId);
      if (!rec) return 0;
      if (catKey === 'consumables') return rec.consumables;
      if (catKey === 'staffing') return rec.staffing;
      if (catKey === 'rent') return rec.rent;
      if (catKey === 'electricity') return rec.electricity;
      if (catKey === 'other') return rec.licensing + rec.other;
      return 0;
    };

    let totalDialysis = 0;
    let totalBlood = 0;
    let totalUsg = 0;
    let totalXray = 0;
    let totalPhysio = 0;
    let totalConsult = 0;
    let totalAll = 0;

    categories.forEach((cat) => {
      const dia = findDeptCost('DIALYSIS', cat.key);
      const bld = findDeptCost('BLOOD_TEST', cat.key);
      const usg = findDeptCost('USG', cat.key);
      const xry = findDeptCost('XRAY', cat.key);
      const phy = findDeptCost('PHYSIO', cat.key);
      const con = findDeptCost('CONSULTATION', cat.key);
      const rowSum = dia + bld + usg + xry + phy + con;

      totalDialysis += dia;
      totalBlood += bld;
      totalUsg += usg;
      totalXray += xry;
      totalPhysio += phy;
      totalConsult += con;
      totalAll += rowSum;

      costsPerLabRows.push({
        Month: ym,
        Branch: branchName,
        Expense_Category: cat.label,
        Dialysis: dia,
        Blood_Tests: bld,
        USG: usg,
        X_Ray: xry,
        Physiotherapy: phy,
        Consultation: con,
        Branch_Total: rowSum,
      });
    });

    // Total row for this month and branch
    costsPerLabRows.push({
      Month: ym,
      Branch: branchName,
      Expense_Category: 'Total',
      Dialysis: totalDialysis,
      Blood_Tests: totalBlood,
      USG: totalUsg,
      X_Ray: totalXray,
      Physiotherapy: totalPhysio,
      Consultation: totalConsult,
      Branch_Total: totalAll,
    });
  });

  const wsCosts = XLSX.utils.json_to_sheet(costsPerLabRows);
  setColWidths(wsCosts, costsPerLabRows);
  XLSX.utils.book_append_sheet(wb, wsCosts, 'Costs_per_lab');

  const exportDate = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Clinic_Master_Workbook_${exportDate}.xlsx`);
}

// ----------------------------------------------------------------------
// 3. CSV EXPORTERS (ONE CSV PER DESIGNATED DATASET)
// ----------------------------------------------------------------------

// 3.1 Dar Al Shifa Invoices CSV
export async function exportDarAlShifaInvoicesCsv(): Promise<void> {
  const invoices = await db.patientInvoices.where('branchId').equals('br_dar_ul_shifa').toArray();
  const data = invoices.length > 0
    ? invoices.map((inv, idx) => ({
        'Sr. no.': inv.srNo || idx + 1,
        'Invoice number': inv.invoiceNumber,
        'time of Bill': inv.timeOfBill,
        'Net Amt': inv.netAmt,
        'UMR': inv.umr,
        'Patient Name': inv.patientName,
        'Age/Gender': inv.ageGender,
        'Personal contact': inv.personalContact,
      }))
    : getSampleInvoices('DUS');

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadCsvBlob(csv, `dar-al-shifa-invoices-${new Date().toISOString().slice(0, 10)}.csv`);
}

// 3.2 Saifee Diagnostic Centre Invoices CSV
export async function exportSaifeeInvoicesCsv(): Promise<void> {
  const invoices = await db.patientInvoices.where('branchId').equals('br_saifee_diag').toArray();
  const data = invoices.length > 0
    ? invoices.map((inv, idx) => ({
        'Sr. no.': inv.srNo || idx + 1,
        'Invoice number': inv.invoiceNumber,
        'time of Bill': inv.timeOfBill,
        'Net Amt': inv.netAmt,
        'UMR': inv.umr,
        'Patient Name': inv.patientName,
        'Age/Gender': inv.ageGender,
        'Personal contact': inv.personalContact,
      }))
    : getSampleInvoices('SDC');

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadCsvBlob(csv, `saifee-invoices-${new Date().toISOString().slice(0, 10)}.csv`);
}

// 3.3 OPD Rooms Booking Slots CSV (Rate: 2500/2 hrs)
export async function exportOpdRoomsCsv(): Promise<void> {
  const opdSlots = await db.opdRoomSlots.toArray();
  let data: any[] = [];

  if (opdSlots.length > 0) {
    const grouped = new Map<string, Record<string, string>>();
    opdSlots.forEach((slot) => {
      const key = `${slot.roomName}__${slot.dayOfWeek}`;
      const existing = grouped.get(key) || {
        OPD_Room: slot.roomName,
        Day_of_Week: slot.dayOfWeek,
      };
      existing[slot.timeSlot] = slot.doctorName ? `${slot.doctorName} (${slot.specialty || ''})` : 'Available';
      grouped.set(key, existing);
    });

    data = Array.from(grouped.values()).map((row) => ({
      OPD_Room: row.OPD_Room,
      Day_of_Week: row.Day_of_Week,
      '08:00 AM - 10:00 AM': row['08:00 AM - 10:00 AM'] || 'Available',
      '10:00 AM - 12:00 PM': row['10:00 AM - 12:00 PM'] || 'Available',
      '12:00 PM - 02:00 PM': row['12:00 PM - 02:00 PM'] || 'Available',
      '02:00 PM - 04:00 PM': row['02:00 PM - 04:00 PM'] || 'Available',
      '04:00 PM - 06:00 PM': row['04:00 PM - 06:00 PM'] || 'Available',
      '06:00 PM - 08:00 PM': row['06:00 PM - 08:00 PM'] || 'Available',
      Rate_Per_2Hrs: 2500,
    }));
  }

  if (data.length === 0) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    ['Saifee Diagnostic Centre - OPD 1', 'Dar Al Shifa - OPD 1', 'Dar Al Shifa - OPD 2'].forEach((room) => {
      days.forEach((d) => {
        data.push({
          OPD_Room: room,
          Day_of_Week: d,
          '08:00 AM - 10:00 AM': 'Dr. Z. Qureshi (Nephrology)',
          '10:00 AM - 12:00 PM': 'Dr. M. Ansari (Cardiology)',
          '12:00 PM - 02:00 PM': 'Available',
          '02:00 PM - 04:00 PM': 'Dr. S. Merchant (Gen. Medicine)',
          '04:00 PM - 06:00 PM': 'Available',
          '06:00 PM - 08:00 PM': 'Dr. A. Mehta (Endocrinology)',
          Rate_Per_2Hrs: 2500,
        });
      });
    });
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadCsvBlob(csv, `opd-room-slots-${new Date().toISOString().slice(0, 10)}.csv`);
}

// 3.4 Dialysis Slots CSV (Table for each date for each center)
export async function exportDialysisSlotsCsv(): Promise<void> {
  const [slots, branches] = await Promise.all([
    db.dialysisSlots.toArray(),
    db.branches.toArray(),
  ]);
  const branchNameMap = new Map(branches.map((b) => [b.id, b.name]));

  const data = slots
    .filter((s) => s.isOccupied)
    .map((s) => ({
      Date: s.date,
      Center: branchNameMap.get(s.branchId) || s.branchId,
      Machine: `Machine ${s.machineIndex}`,
      Shift: s.slotIndex === 1 ? 'Shift 1 (08:00 - 12:00)' : 'Shift 2 (12:30 - 16:30)',
      Slot_Type: s.slotType,
      Applied_Rate: s.appliedRate,
      Patient_Name: `Patient M${s.machineIndex}-S${s.slotIndex}`,
      Booking_Status: 'Occupied',
    }));

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadCsvBlob(csv, `dialysis-slots-${new Date().toISOString().slice(0, 10)}.csv`);
}

// 3.5 Costs Per Lab CSV (Categorized from July 2026 onwards)
export async function exportCostsPerLabCsv(): Promise<void> {
  const [departmentCosts, branches] = await Promise.all([
    db.departmentCosts.toArray(),
    db.branches.toArray(),
  ]);
  const branchNameMap = new Map(branches.map((b) => [b.id, b.name]));

  const targetCosts = departmentCosts.filter((dc) => dc.yearMonth >= '2026-07');
  const activeCosts = targetCosts.length > 0 ? targetCosts : departmentCosts;

  const monthBranchMap = new Map<string, typeof departmentCosts>();
  activeCosts.forEach((dc) => {
    const key = `${dc.yearMonth}__${dc.branchId}`;
    const list = monthBranchMap.get(key) || [];
    list.push(dc);
    monthBranchMap.set(key, list);
  });

  const rows: any[] = [];
  const categories = [
    { key: 'consumables', label: 'Consumables' },
    { key: 'staffing', label: 'Manpower' },
    { key: 'rent', label: 'Rent' },
    { key: 'electricity', label: 'Electricity' },
    { key: 'other', label: 'Misc' },
  ];

  monthBranchMap.forEach((deptList, key) => {
    const [ym, brId] = key.split('__');
    const branchName = branchNameMap.get(brId) || brId;

    const findCost = (deptId: string, catKey: string): number => {
      const rec = deptList.find((d) => d.department === deptId);
      if (!rec) return 0;
      if (catKey === 'consumables') return rec.consumables;
      if (catKey === 'staffing') return rec.staffing;
      if (catKey === 'rent') return rec.rent;
      if (catKey === 'electricity') return rec.electricity;
      if (catKey === 'other') return rec.licensing + rec.other;
      return 0;
    };

    let totalDia = 0, totalBld = 0, totalUsg = 0, totalXry = 0, totalPhy = 0, totalCon = 0, totalAll = 0;

    categories.forEach((cat) => {
      const dia = findCost('DIALYSIS', cat.key);
      const bld = findCost('BLOOD_TEST', cat.key);
      const usg = findCost('USG', cat.key);
      const xry = findCost('XRAY', cat.key);
      const phy = findCost('PHYSIO', cat.key);
      const con = findCost('CONSULTATION', cat.key);
      const sum = dia + bld + usg + xry + phy + con;

      totalDia += dia; totalBld += bld; totalUsg += usg; totalXry += xry; totalPhy += phy; totalCon += con; totalAll += sum;

      rows.push({
        Month: ym,
        Branch: branchName,
        Expense_Category: cat.label,
        Dialysis: dia,
        Blood_Tests: bld,
        USG: usg,
        X_Ray: xry,
        Physiotherapy: phy,
        Consultation: con,
        Branch_Total: sum,
      });
    });

    rows.push({
      Month: ym,
      Branch: branchName,
      Expense_Category: 'Total',
      Dialysis: totalDia,
      Blood_Tests: totalBld,
      USG: totalUsg,
      X_Ray: totalXry,
      Physiotherapy: totalPhy,
      Consultation: totalCon,
      Branch_Total: totalAll,
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadCsvBlob(csv, `costs-per-lab-${new Date().toISOString().slice(0, 10)}.csv`);
}

// 3.6 Daily Revenue CSV
export async function exportDailyEntriesCsv(): Promise<void> {
  const [entries, branches, catalog] = await Promise.all([
    db.dailyEntries.toArray(),
    db.branches.toArray(),
    db.serviceCatalog.toArray(),
  ]);

  const branchCodeMap = new Map(branches.map((b) => [b.id, b.code]));
  const csvData = entries.map((e) => {
    const srv = catalog.find((c) => c.id === e.serviceId);
    return {
      Date: e.date,
      Branch_Code: branchCodeMap.get(e.branchId) || e.branchId,
      Department: e.department,
      Service_Name: srv?.name || e.serviceId,
      Patient_Count: e.patientCount,
      Applied_Rate: e.rate,
      Calculated_Revenue: e.revenue,
      Doctor_Payout: e.doctorVariablePayout,
    };
  });

  const ws = XLSX.utils.json_to_sheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadCsvBlob(csv, `daily-revenue-${new Date().toISOString().slice(0, 10)}.csv`);
}
