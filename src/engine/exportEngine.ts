import * as XLSX from 'xlsx';
import { db } from '../db/database';
import { computeDepartmentProfitability } from './financialEngine';
import { OpdRoomId, PatientInvoiceRecord } from '../types/schema';
import {
  PRELIMINARY_DUS_INVOICES,
  PRELIMINARY_SDC_INVOICES,
  SDC_OPD1_SCHEDULE,
  DUS_OPD1_SCHEDULE,
  DUS_OPD2_SCHEDULE,
} from '../db/preliminaryClinicData';

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

// Default preliminary patient invoices from clinic dataset
function getSampleInvoices(branchCode: 'DUS' | 'SDC') {
  const source = branchCode === 'DUS' ? PRELIMINARY_DUS_INVOICES : PRELIMINARY_SDC_INVOICES;
  return source.map((inv) => ({
    'Sr. no.': inv.srNo,
    'Invoice number': inv.invoiceNumber,
    'time of Bill': inv.timeOfBill,
    'Net Amt': inv.netAmt,
    'UMR': inv.umr,
    'Patient Name': inv.patientName,
    'Age/Gender': inv.ageGender,
    'Personal contact': inv.personalContact,
  }));
}

// ----------------------------------------------------------------------
// 1. DOWNLOAD OFFICIAL 5-TAB CLINIC IMPORT TEMPLATE (.XLSX)
// Tab 1: Dar Al Shifa
// Tab 2: Saifee Diagnostic Centre
// Tab 3: OPD_Rooms (Tables for each week, 6 slots from 8am-8pm, 7 days/week, 2500/2 hrs)
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
  // Tab 3: OPD_Rooms (Weekly tables for SDC OPD 1, DUS OPD 1, DUS OPD 2)
  // Rate: 2500/2 hrs, 6 slots (8am-8pm), 7 days/week, one table for each week!
  // --------------------------------------------------------------------
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const opdRoomsList = [
    { id: 'SDC_OPD1', name: 'Saifee Diagnostic Centre - OPD 1', schedule: SDC_OPD1_SCHEDULE },
    { id: 'DUS_OPD1', name: 'Dar Al Shifa - OPD 1', schedule: DUS_OPD1_SCHEDULE },
    { id: 'DUS_OPD2', name: 'Dar Al Shifa - OPD 2', schedule: DUS_OPD2_SCHEDULE },
  ];

  const opdScheduleData: any[] = [];
  weeks.forEach((wk) => {
    opdRoomsList.forEach((room) => {
      daysOfWeek.forEach((day) => {
        const daySched = room.schedule.find((s) => s.dayOfWeek.toLowerCase() === day.toLowerCase());
        opdScheduleData.push({
          Week: wk,
          OPD_Room: room.name,
          Day_of_Week: day,
          '08:00 - 10:00': daySched?.slots['08:00 - 10:00'] || 'Available',
          '10:00 - 12:00': daySched?.slots['10:00 - 12:00'] || 'Available',
          '12:00 - 14:00': daySched?.slots['12:00 - 14:00'] || 'Available',
          '14:00 - 16:00': daySched?.slots['14:00 - 16:00'] || 'Available',
          '16:00 - 18:00': daySched?.slots['16:00 - 18:00'] || 'Available',
          '18:00 - 20:00': daySched?.slots['18:00 - 20:00'] || 'Available',
          Rate_Per_2Hrs: 2500,
        });
      });
    });
  });

  const wsOpd = XLSX.utils.json_to_sheet(opdScheduleData);
  setColWidths(wsOpd, opdScheduleData);
  XLSX.utils.book_append_sheet(wb, wsOpd, 'OPD_Rooms');

  // --------------------------------------------------------------------
  // Tab 4: Dialysis_slots (Date-wise center-wise table with AKD roster)
  // --------------------------------------------------------------------
  const dialysisSlotsData: any[] = [];
  const activeDates = ['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08'];

  activeDates.forEach((dateStr) => {
    const isMWF = ['2026-08-03', '2026-08-05', '2026-08-07'].includes(dateStr);

    // SDC AKD 1
    dialysisSlotsData.push({
      Date: dateStr,
      Center: 'Saifee Diagnostic Centre',
      Machine: 'SDC AKD 1',
      Shift: '08:00 - 12:00',
      Slot_Type: 'STANDARD',
      Applied_Rate: 1800,
      Patient_Name: isMWF ? 'Yasmin' : 'Preeti Bawa',
      Booking_Status: 'Occupied',
    });
    dialysisSlotsData.push({
      Date: dateStr,
      Center: 'Saifee Diagnostic Centre',
      Machine: 'SDC AKD 1',
      Shift: '12:00 - 16:00',
      Slot_Type: 'STANDARD',
      Applied_Rate: 1800,
      Patient_Name: isMWF ? 'Hetal Rewar' : 'Suresh Jain',
      Booking_Status: 'Occupied',
    });

    // DAS AKD 1
    dialysisSlotsData.push({
      Date: dateStr,
      Center: 'Dar Al Shifa',
      Machine: 'DAS AKD 1',
      Shift: '08:00 - 12:00',
      Slot_Type: 'STANDARD',
      Applied_Rate: 1800,
      Patient_Name: isMWF ? 'Yusuf Patel' : 'Nafisa Kagalwala',
      Booking_Status: 'Occupied',
    });
    dialysisSlotsData.push({
      Date: dateStr,
      Center: 'Dar Al Shifa',
      Machine: 'DAS AKD 1',
      Shift: '12:00 - 16:00',
      Slot_Type: 'STANDARD',
      Applied_Rate: 1800,
      Patient_Name: isMWF ? 'Farida Noori' : 'Shahida Khan',
      Booking_Status: 'Occupied',
    });

    // DAS AKD 2
    dialysisSlotsData.push({
      Date: dateStr,
      Center: 'Dar Al Shifa',
      Machine: 'DAS AKD 2',
      Shift: '08:00 - 12:00',
      Slot_Type: 'SINGLE_USE',
      Applied_Rate: 2200,
      Patient_Name: isMWF ? 'Ulfat Jahan' : 'Sakina',
      Booking_Status: 'Occupied',
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
  const costCenters = [
    { code: 'DUS', name: 'Dar Al Shifa' },
    { code: 'SDC', name: 'Saifee Diagnostic Centre' },
  ];
  const costsPerLabData: any[] = [];

  months.forEach((ym) => {
    costCenters.forEach((center) => {
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
  // Tab 3: OPD_Rooms (Saifee OPD 1, Dar Al Shifa OPD 1 & OPD 2 - Weekly Tables)
  // --------------------------------------------------------------------
  let opdExportData: any[] = [];
  if (opdSlots.length > 0) {
    const grouped = new Map<string, Record<string, string>>();
    opdSlots.forEach((slot) => {
      const wk = slot.weekLabel || 'Week 1';
      const key = `${wk}__${slot.roomName}__${slot.dayOfWeek}`;
      const existing = grouped.get(key) || {
        Week: wk,
        OPD_Room: slot.roomName,
        Day_of_Week: slot.dayOfWeek,
      };
      existing[slot.timeSlot.replace(' AM', '').replace(' PM', '').trim()] = slot.doctorName || 'Available';
      existing[slot.timeSlot] = slot.doctorName || 'Available';
      grouped.set(key, existing);
    });

    opdExportData = Array.from(grouped.values()).map((row) => ({
      Week: row.Week,
      OPD_Room: row.OPD_Room,
      Day_of_Week: row.Day_of_Week,
      '08:00 - 10:00': row['08:00 - 10:00'] || row['08:00 AM - 10:00 AM'] || 'Available',
      '10:00 - 12:00': row['10:00 - 12:00'] || row['10:00 AM - 12:00 PM'] || 'Available',
      '12:00 - 14:00': row['12:00 - 14:00'] || row['12:00 PM - 02:00 PM'] || 'Available',
      '14:00 - 16:00': row['14:00 - 16:00'] || row['02:00 PM - 04:00 PM'] || 'Available',
      '16:00 - 18:00': row['16:00 - 18:00'] || row['04:00 PM - 06:00 PM'] || 'Available',
      '18:00 - 20:00': row['18:00 - 20:00'] || row['06:00 PM - 08:00 PM'] || 'Available',
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

// 3.3 OPD Rooms Booking Slots CSV (Rate: 2500/2 hrs, weekly tables)
export async function exportOpdRoomsCsv(): Promise<void> {
  const opdSlots = await db.opdRoomSlots.toArray();
  let data: any[] = [];

  if (opdSlots.length > 0) {
    const grouped = new Map<string, Record<string, string>>();
    opdSlots.forEach((slot) => {
      const wk = slot.weekLabel || 'Week 1';
      const key = `${wk}__${slot.roomName}__${slot.dayOfWeek}`;
      const existing = grouped.get(key) || {
        Week: wk,
        OPD_Room: slot.roomName,
        Day_of_Week: slot.dayOfWeek,
      };
      existing[slot.timeSlot.replace(' AM', '').replace(' PM', '').trim()] = slot.doctorName || 'Available';
      existing[slot.timeSlot] = slot.doctorName || 'Available';
      grouped.set(key, existing);
    });

    data = Array.from(grouped.values()).map((row) => ({
      Week: row.Week,
      OPD_Room: row.OPD_Room,
      Day_of_Week: row.Day_of_Week,
      '08:00 - 10:00': row['08:00 - 10:00'] || row['08:00 AM - 10:00 AM'] || 'Available',
      '10:00 - 12:00': row['10:00 - 12:00'] || row['10:00 AM - 12:00 PM'] || 'Available',
      '12:00 - 14:00': row['12:00 - 14:00'] || row['12:00 PM - 02:00 PM'] || 'Available',
      '14:00 - 16:00': row['14:00 - 16:00'] || row['02:00 PM - 04:00 PM'] || 'Available',
      '16:00 - 18:00': row['16:00 - 18:00'] || row['04:00 PM - 06:00 PM'] || 'Available',
      '18:00 - 20:00': row['18:00 - 20:00'] || row['06:00 PM - 08:00 PM'] || 'Available',
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
