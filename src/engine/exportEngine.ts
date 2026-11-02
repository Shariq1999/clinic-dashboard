import * as XLSX from 'xlsx';
import { db } from '../db/database';
import { computeDepartmentProfitability } from './financialEngine';

// Helper to set standard auto-fit column widths
function setColWidths(ws: XLSX.WorkSheet, data: any[]) {
  if (!data || data.length === 0) return;
  const colWidths = Object.keys(data[0]).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => (row[key] !== undefined && row[key] !== null ? String(row[key]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
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

// ----------------------------------------------------------------------
// 1. DOWNLOAD OFFICIAL 3-TAB IMPORT TEMPLATE (.XLSX)
// Sheet 1: Dialysis_Slots
// Sheet 2: RateCard_Consultation
// Sheet 3: Costs_Per_Lab
// ----------------------------------------------------------------------
export async function downloadExcelImportTemplate(): Promise<void> {
  const [branches, catalog, overrides] = await Promise.all([
    db.branches.toArray(),
    db.serviceCatalog.toArray(),
    db.rateOverrides.toArray(),
  ]);

  const branchCodeMap = new Map(branches.map((b) => [b.id, b.code]));
  const wb = XLSX.utils.book_new();

  // Tab 1: Dialysis_Slots (dialysis slots in one sheet)
  const sampleDialysisSlots = [
    { Date: '2026-05-02', Branch_Code: 'DUS', Machine_Index: 1, Shift_Index: 1, Slot_Type: 'STANDARD', Applied_Rate: 1800, Patient_Status: 'Occupied' },
    { Date: '2026-05-02', Branch_Code: 'DUS', Machine_Index: 1, Shift_Index: 2, Slot_Type: 'STANDARD', Applied_Rate: 1800, Patient_Status: 'Occupied' },
    { Date: '2026-05-02', Branch_Code: 'DUS', Machine_Index: 2, Shift_Index: 1, Slot_Type: 'SINGLE_USE', Applied_Rate: 2200, Patient_Status: 'Occupied' },
    { Date: '2026-05-02', Branch_Code: 'DUS', Machine_Index: 2, Shift_Index: 2, Slot_Type: 'STANDARD', Applied_Rate: 1800, Patient_Status: 'Occupied' },
    { Date: '2026-05-02', Branch_Code: 'SDC', Machine_Index: 1, Shift_Index: 1, Slot_Type: 'STANDARD', Applied_Rate: 1800, Patient_Status: 'Occupied' },
    { Date: '2026-05-02', Branch_Code: 'SDC', Machine_Index: 1, Shift_Index: 2, Slot_Type: 'STANDARD', Applied_Rate: 1800, Patient_Status: 'Occupied' },
    { Date: '2026-05-04', Branch_Code: 'DUS', Machine_Index: 1, Shift_Index: 1, Slot_Type: 'STANDARD', Applied_Rate: 1800, Patient_Status: 'Occupied' },
    { Date: '2026-05-04', Branch_Code: 'DUS', Machine_Index: 2, Shift_Index: 1, Slot_Type: 'STANDARD', Applied_Rate: 1800, Patient_Status: 'Occupied' },
  ];
  const wsDialysis = XLSX.utils.json_to_sheet(sampleDialysisSlots);
  setColWidths(wsDialysis, sampleDialysisSlots);
  XLSX.utils.book_append_sheet(wb, wsDialysis, 'Dialysis_Slots');

  // Tab 2: RateCard_Consultation (rate card, consultation revenue in another sheet)
  const rateCardConsultationData = catalog.map((c) => {
    const ov = overrides.find((o) => o.serviceId === c.id);
    return {
      Department: c.department,
      Service_Name: c.name,
      Sub_Category: c.subCategory || '',
      Default_Rate: c.defaultRate,
      Payout_Model: c.payoutModel,
      Doctor_Rev_Share_Pct: c.defaultRevSharePct,
      Doctor_Fixed_Monthly_Fee: c.defaultFixedMonthlyFee,
      Branch_Code: ov ? branchCodeMap.get(ov.branchId) || '' : '',
      Branch_Override_Rate: ov?.overrideRate ?? '',
      Consultation_Fee: c.department === 'CONSULTATION' ? c.defaultRate : '',
    };
  });
  const wsRateCard = XLSX.utils.json_to_sheet(rateCardConsultationData);
  setColWidths(wsRateCard, rateCardConsultationData);
  XLSX.utils.book_append_sheet(wb, wsRateCard, 'RateCard_Consultation');

  // Tab 3: Costs_Per_Lab (Costs per lab in another sheet)
  const sampleCostsPerLab = [
    { Year_Month: '2026-05', Branch_Code: 'DUS', Lab_Department: 'BLOOD_TEST', Rent: 28000, Electricity: 8000, Staffing: 40000, Consumables: 20000, Licensing: 3000, Other: 3000, Fixed_Opex_Total: 102000 },
    { Year_Month: '2026-05', Branch_Code: 'DUS', Lab_Department: 'USG', Rent: 19600, Electricity: 5600, Staffing: 28000, Consumables: 14000, Licensing: 2100, Other: 2100, Fixed_Opex_Total: 71400 },
    { Year_Month: '2026-05', Branch_Code: 'DUS', Lab_Department: 'XRAY', Rent: 16800, Electricity: 4800, Staffing: 24000, Consumables: 12000, Licensing: 1800, Other: 1800, Fixed_Opex_Total: 61200 },
    { Year_Month: '2026-05', Branch_Code: 'DUS', Lab_Department: 'DIALYSIS', Rent: 44800, Electricity: 12800, Staffing: 64000, Consumables: 32000, Licensing: 4800, Other: 4800, Fixed_Opex_Total: 163200 },
    { Year_Month: '2026-05', Branch_Code: 'DUS', Lab_Department: 'PHYSIO', Rent: 14000, Electricity: 4000, Staffing: 20000, Consumables: 10000, Licensing: 1500, Other: 1500, Fixed_Opex_Total: 51000 },
    { Year_Month: '2026-05', Branch_Code: 'DUS', Lab_Department: 'CONSULTATION', Rent: 16800, Electricity: 4800, Staffing: 24000, Consumables: 12000, Licensing: 1800, Other: 1800, Fixed_Opex_Total: 61200 },
    { Year_Month: '2026-05', Branch_Code: 'SDC', Lab_Department: 'BLOOD_TEST', Rent: 25000, Electricity: 7500, Staffing: 35000, Consumables: 18000, Licensing: 2500, Other: 2500, Fixed_Opex_Total: 90500 },
    { Year_Month: '2026-05', Branch_Code: 'SDC', Lab_Department: 'USG', Rent: 17500, Electricity: 5000, Staffing: 25000, Consumables: 12500, Licensing: 2000, Other: 2000, Fixed_Opex_Total: 64000 },
  ];
  const wsCosts = XLSX.utils.json_to_sheet(sampleCostsPerLab);
  setColWidths(wsCosts, sampleCostsPerLab);
  XLSX.utils.book_append_sheet(wb, wsCosts, 'Costs_Per_Lab');

  XLSX.writeFile(wb, 'Clinic_Data_Import_Template.xlsx');
}

// ----------------------------------------------------------------------
// 2. EXPORT MASTER COMPREHENSIVE WORKBOOK (.XLSX)
// Includes the 3 core sheets + Daily revenue and Branches
// ----------------------------------------------------------------------
export async function exportFullExcelWorkbook(): Promise<void> {
  const [
    branches,
    slots,
    entries,
    monthlyCosts,
    departmentCosts,
    catalog,
    overrides,
    capacityLogs,
  ] = await Promise.all([
    db.branches.toArray(),
    db.dialysisSlots.toArray(),
    db.dailyEntries.toArray(),
    db.monthlyCosts.toArray(),
    db.departmentCosts.toArray(),
    db.serviceCatalog.toArray(),
    db.rateOverrides.toArray(),
    db.capacityLogs.toArray(),
  ]);

  const branchCodeMap = new Map(branches.map((b) => [b.id, b.code]));

  // Calculate comprehensive department profitability
  const profitability = computeDepartmentProfitability(
    { branchId: 'ALL', startDate: '2026-04-01', endDate: '2026-09-30', department: 'ALL' },
    branches,
    capacityLogs,
    slots,
    entries,
    departmentCosts,
    monthlyCosts,
    catalog,
    overrides
  );

  const wb = XLSX.utils.book_new();

  // Sheet 1: Dialysis_Slots (Occupied Dialysis Slots)
  const dialysisData = slots
    .filter((s) => s.isOccupied)
    .map((s) => ({
      Date: s.date,
      Branch_Code: branchCodeMap.get(s.branchId) || s.branchId,
      Machine_Index: s.machineIndex,
      Shift_Index: s.slotIndex,
      Slot_Type: s.slotType,
      Applied_Rate: s.appliedRate,
      Patient_Status: 'Occupied',
    }));
  const wsDialysis = XLSX.utils.json_to_sheet(dialysisData);
  setColWidths(wsDialysis, dialysisData);
  XLSX.utils.book_append_sheet(wb, wsDialysis, 'Dialysis_Slots');

  // Sheet 2: RateCard_Consultation (Rate Card, Consultation Revenue & Doctor Payouts)
  const rateCardData = catalog.map((c) => {
    const ov = overrides.find((o) => o.serviceId === c.id);
    return {
      Department: c.department,
      Service_Name: c.name,
      Sub_Category: c.subCategory || '',
      Default_Rate: c.defaultRate,
      Payout_Model: c.payoutModel,
      Doctor_Rev_Share_Pct: c.defaultRevSharePct,
      Doctor_Fixed_Monthly_Fee: c.defaultFixedMonthlyFee,
      Branch_Code: ov ? branchCodeMap.get(ov.branchId) || '' : '',
      Branch_Override_Rate: ov?.overrideRate ?? '',
      Consultation_Fee: c.department === 'CONSULTATION' ? c.defaultRate : '',
      Is_Active: c.isActive ? 'YES' : 'NO',
    };
  });
  const wsRateCard = XLSX.utils.json_to_sheet(rateCardData);
  setColWidths(wsRateCard, rateCardData);
  XLSX.utils.book_append_sheet(wb, wsRateCard, 'RateCard_Consultation');

  // Sheet 3: Costs_Per_Lab (Department & Lab OPEX Costs)
  const costsPerLabData = departmentCosts.map((dc) => ({
    Year_Month: dc.yearMonth,
    Branch_Code: branchCodeMap.get(dc.branchId) || dc.branchId,
    Lab_Department: dc.department,
    Rent: dc.rent,
    Electricity: dc.electricity,
    Staffing: dc.staffing,
    Consumables: dc.consumables,
    Licensing: dc.licensing,
    Other: dc.other,
    Fixed_Opex_Total: dc.fixedOpeXTotal,
  }));
  const wsCosts = XLSX.utils.json_to_sheet(costsPerLabData);
  setColWidths(wsCosts, costsPerLabData);
  XLSX.utils.book_append_sheet(wb, wsCosts, 'Costs_Per_Lab');

  // Sheet 4: Daily_Dept_Revenue
  const dailyData = entries.map((e) => {
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
  const wsDaily = XLSX.utils.json_to_sheet(dailyData);
  setColWidths(wsDaily, dailyData);
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily_Dept_Revenue');

  // Sheet 5: Branches
  const branchesData = branches.map((b) => ({
    Branch_Id: b.id,
    Branch_Code: b.code,
    Branch_Name: b.name,
    Location: b.location,
    Sunday_Open: b.sundayOpen ? 'YES' : 'NO',
    Is_Active: b.isActive ? 'YES' : 'NO',
  }));
  const wsBranches = XLSX.utils.json_to_sheet(branchesData);
  setColWidths(wsBranches, branchesData);
  XLSX.utils.book_append_sheet(wb, wsBranches, 'Branches');

  // Sheet 6: Department_Profitability
  const profData = profitability.map((p) => ({
    Department: p.name,
    Patient_Footfall: p.footfall,
    Gross_Revenue: p.revenue,
    Revenue_Share_Pct: `${p.revContributionPct.toFixed(1)}%`,
    Pro_Rated_OPEX: p.proRatedOpex.total,
    Doctor_Payouts: p.doctorPayouts.total,
    Total_Cost: p.totalCost,
    Net_Operating_Profit: p.netProfit,
    Net_Margin_Pct: `${p.marginPct.toFixed(1)}%`,
    Profit_Contribution_Pct: `${p.profitContributionPct.toFixed(1)}%`,
  }));
  const wsProf = XLSX.utils.json_to_sheet(profData);
  setColWidths(wsProf, profData);
  XLSX.utils.book_append_sheet(wb, wsProf, 'Department_Profitability');

  const exportDate = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Clinic_Master_Workbook_${exportDate}.xlsx`);
}

// ----------------------------------------------------------------------
// 3. CSV EXPORTERS (ONE CSV PER DATASET)
// ----------------------------------------------------------------------

// 3.1 Dialysis Slots CSV
export async function exportDialysisSlotsCsv(): Promise<void> {
  const [slots, branches] = await Promise.all([
    db.dialysisSlots.toArray(),
    db.branches.toArray(),
  ]);
  const branchCodeMap = new Map(branches.map((b) => [b.id, b.code]));

  const data = slots
    .filter((s) => s.isOccupied)
    .map((s) => ({
      Date: s.date,
      Branch_Code: branchCodeMap.get(s.branchId) || s.branchId,
      Machine_Index: s.machineIndex,
      Shift_Index: s.slotIndex,
      Slot_Type: s.slotType,
      Applied_Rate: s.appliedRate,
      Patient_Status: 'Occupied',
    }));

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadCsvBlob(csv, `dialysis-slots-${new Date().toISOString().slice(0, 10)}.csv`);
}

// 3.2 Rate Card & Consultation Revenue CSV
export async function exportRateCardConsultationCsv(): Promise<void> {
  const [catalog, overrides, branches] = await Promise.all([
    db.serviceCatalog.toArray(),
    db.rateOverrides.toArray(),
    db.branches.toArray(),
  ]);
  const branchCodeMap = new Map(branches.map((b) => [b.id, b.code]));

  const data = catalog.map((c) => {
    const ov = overrides.find((o) => o.serviceId === c.id);
    return {
      Department: c.department,
      Service_Name: c.name,
      Sub_Category: c.subCategory || '',
      Default_Rate: c.defaultRate,
      Payout_Model: c.payoutModel,
      Doctor_Rev_Share_Pct: c.defaultRevSharePct,
      Doctor_Fixed_Monthly_Fee: c.defaultFixedMonthlyFee,
      Branch_Code: ov ? branchCodeMap.get(ov.branchId) || '' : '',
      Branch_Override_Rate: ov?.overrideRate ?? '',
      Consultation_Fee: c.department === 'CONSULTATION' ? c.defaultRate : '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadCsvBlob(csv, `ratecard-consultation-${new Date().toISOString().slice(0, 10)}.csv`);
}

// 3.3 Costs Per Lab CSV
export async function exportCostsPerLabCsv(): Promise<void> {
  const [departmentCosts, branches] = await Promise.all([
    db.departmentCosts.toArray(),
    db.branches.toArray(),
  ]);
  const branchCodeMap = new Map(branches.map((b) => [b.id, b.code]));

  const data = departmentCosts.map((dc) => ({
    Year_Month: dc.yearMonth,
    Branch_Code: branchCodeMap.get(dc.branchId) || dc.branchId,
    Lab_Department: dc.department,
    Rent: dc.rent,
    Electricity: dc.electricity,
    Staffing: dc.staffing,
    Consumables: dc.consumables,
    Licensing: dc.licensing,
    Other: dc.other,
    Fixed_Opex_Total: dc.fixedOpeXTotal,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadCsvBlob(csv, `costs-per-lab-${new Date().toISOString().slice(0, 10)}.csv`);
}

// 3.4 Daily Department Entries CSV
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
