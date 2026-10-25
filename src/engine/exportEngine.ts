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

// 1. DOWNLOAD OFFICIAL 5-TAB IMPORT TEMPLATE
export async function downloadExcelImportTemplate(): Promise<void> {
  const [branches, catalog] = await Promise.all([
    db.branches.toArray(),
    db.serviceCatalog.toArray(),
  ]);

  const wb = XLSX.utils.book_new();

  // Tab 1: INSTRUCTIONS
  const instructionsData = [
    {
      Section: '1. General Instructions',
      Details: 'This Excel template is designed for seamless bi-directional import into the ClinicChain Dashboard. You can edit existing rows or append new data.',
    },
    {
      Section: '2. Branch Codes',
      Details: `Valid Branch Codes: ${branches.map((b) => `${b.code} (${b.name})`).join(', ')}. Branch code mapping is case-insensitive.`,
    },
    {
      Section: '3. Date Formats',
      Details: 'Dates must follow YYYY-MM-DD (e.g. 2026-05-15). Months must follow YYYY-MM (e.g. 2026-05).',
    },
    {
      Section: '4. Sunday Safety Lock',
      Details: 'Dialysis shifts on Sundays are strictly excluded by clinical safety policy and will be automatically skipped upon import.',
    },
    {
      Section: '5. Auto Calculations',
      Details: 'If Applied_Rate is left blank in Daily_Dept_Revenue, the system automatically pulls the active price from the Rate Card and computes Doctor Remuneration.',
    },
    {
      Section: '6. Import Modes',
      Details: 'MERGE mode will upsert records without deleting existing entries. OVERWRITE mode will replace existing table data.',
    },
  ];
  const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
  setColWidths(wsInstructions, instructionsData);
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'INSTRUCTIONS');

  // Tab 2: Daily_Dept_Revenue
  const sampleDaily = [
    { Date: '2026-05-02', Branch_Code: 'DUS', Department: 'BLOOD_TEST', Service_Name: 'CBC', Patient_Count: 14, Applied_Rate: 300 },
    { Date: '2026-05-02', Branch_Code: 'DUS', Department: 'USG', Service_Name: 'USG Whole Abdomen', Patient_Count: 6, Applied_Rate: 1200 },
    { Date: '2026-05-02', Branch_Code: 'DUS', Department: 'XRAY', Service_Name: 'X-Ray Chest PA', Patient_Count: 8, Applied_Rate: 400 },
    { Date: '2026-05-02', Branch_Code: 'SDC', Department: 'PHYSIO', Service_Name: 'Physiotherapy Routine Session', Patient_Count: 7, Applied_Rate: 450 },
    { Date: '2026-05-02', Branch_Code: 'SDC', Department: 'CONSULTATION', Service_Name: 'Nephrologist Consultation', Patient_Count: 10, Applied_Rate: 1000 },
  ];
  const wsDaily = XLSX.utils.json_to_sheet(sampleDaily);
  setColWidths(wsDaily, sampleDaily);
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily_Dept_Revenue');

  // Tab 3: Department_Costs
  const sampleDeptCosts = [
    { Year_Month: '2026-05', Branch_Code: 'DUS', Department: 'DIALYSIS', Rent: 44800, Electricity: 12800, Staffing: 64000, Consumables: 32000, Licensing: 4800, Other: 4800 },
    { Year_Month: '2026-05', Branch_Code: 'DUS', Department: 'BLOOD_TEST', Rent: 28000, Electricity: 8000, Staffing: 40000, Consumables: 20000, Licensing: 3000, Other: 3000 },
    { Year_Month: '2026-05', Branch_Code: 'DUS', Department: 'USG', Rent: 19600, Electricity: 5600, Staffing: 28000, Consumables: 14000, Licensing: 2100, Other: 2100 },
    { Year_Month: '2026-05', Branch_Code: 'DUS', Department: 'XRAY', Rent: 16800, Electricity: 4800, Staffing: 24000, Consumables: 12000, Licensing: 1800, Other: 1800 },
    { Year_Month: '2026-05', Branch_Code: 'DUS', Department: 'PHYSIO', Rent: 14000, Electricity: 4000, Staffing: 20000, Consumables: 10000, Licensing: 1500, Other: 1500 },
    { Year_Month: '2026-05', Branch_Code: 'DUS', Department: 'CONSULTATION', Rent: 16800, Electricity: 4800, Staffing: 24000, Consumables: 12000, Licensing: 1800, Other: 1800 },
  ];
  const wsDeptCosts = XLSX.utils.json_to_sheet(sampleDeptCosts);
  setColWidths(wsDeptCosts, sampleDeptCosts);
  XLSX.utils.book_append_sheet(wb, wsDeptCosts, 'Department_Costs');

  // Tab 4: Occupied_Dialysis_Slots
  const sampleDialysis = [
    { Date: '2026-05-02', Branch_Code: 'DUS', Machine_Index: 1, Shift_Index: 1, Slot_Type: 'STANDARD', Applied_Rate: 1800 },
    { Date: '2026-05-02', Branch_Code: 'DUS', Machine_Index: 1, Shift_Index: 2, Slot_Type: 'STANDARD', Applied_Rate: 1800 },
    { Date: '2026-05-02', Branch_Code: 'DUS', Machine_Index: 2, Shift_Index: 1, Slot_Type: 'SINGLE_USE', Applied_Rate: 2200 },
    { Date: '2026-05-02', Branch_Code: 'SDC', Machine_Index: 1, Shift_Index: 1, Slot_Type: 'STANDARD', Applied_Rate: 1800 },
  ];
  const wsDialysis = XLSX.utils.json_to_sheet(sampleDialysis);
  setColWidths(wsDialysis, sampleDialysis);
  XLSX.utils.book_append_sheet(wb, wsDialysis, 'Occupied_Dialysis_Slots');

  // Tab 5: RateCard_Master (Pre-filled from DB)
  const masterCatalogData = catalog.map((c) => ({
    Department: c.department,
    Service_Name: c.name,
    Sub_Category: c.subCategory || '',
    Default_Rate: c.defaultRate,
    Payout_Model: c.payoutModel,
    Rev_Share_Pct: c.defaultRevSharePct,
    Fixed_Monthly_Fee: c.defaultFixedMonthlyFee,
  }));
  const wsMaster = XLSX.utils.json_to_sheet(masterCatalogData);
  setColWidths(wsMaster, masterCatalogData);
  XLSX.utils.book_append_sheet(wb, wsMaster, 'RateCard_Master');

  XLSX.writeFile(wb, 'Clinic_Data_Import_Template.xlsx');
}

// 2. EXPORT FULL 8-TAB COMPREHENSIVE WORKBOOK
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

  // Calculate comprehensive department profitability for active period
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

  // Tab 1: Branches
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

  // Tab 2: RateCard_Master
  const catalogData = catalog.map((c) => ({
    Department: c.department,
    Service_Name: c.name,
    Sub_Category: c.subCategory || '',
    Default_Rate: c.defaultRate,
    Payout_Model: c.payoutModel,
    Rev_Share_Pct: c.defaultRevSharePct,
    Fixed_Monthly_Fee: c.defaultFixedMonthlyFee,
    Is_Active: c.isActive ? 'YES' : 'NO',
  }));
  const wsCatalog = XLSX.utils.json_to_sheet(catalogData);
  setColWidths(wsCatalog, catalogData);
  XLSX.utils.book_append_sheet(wb, wsCatalog, 'RateCard_Master');

  // Tab 3: Branch_Overrides
  const overridesData = overrides.map((o) => {
    const srv = catalog.find((c) => c.id === o.serviceId);
    return {
      Branch_Code: branchCodeMap.get(o.branchId) || o.branchId,
      Service_Name: srv?.name || o.serviceId,
      Override_Rate: o.overrideRate,
      Override_Payout_Model: o.overridePayoutModel || srv?.payoutModel,
      Override_Rev_Share_Pct: o.overrideRevSharePct ?? srv?.defaultRevSharePct,
      Override_Fixed_Monthly_Fee: o.overrideFixedMonthlyFee ?? srv?.defaultFixedMonthlyFee,
    };
  });
  const wsOverrides = XLSX.utils.json_to_sheet(overridesData);
  setColWidths(wsOverrides, overridesData);
  XLSX.utils.book_append_sheet(wb, wsOverrides, 'Branch_Overrides');

  // Tab 4: Department_Costs
  const deptCostsData = departmentCosts.map((dc) => ({
    Year_Month: dc.yearMonth,
    Branch_Code: branchCodeMap.get(dc.branchId) || dc.branchId,
    Department: dc.department,
    Rent: dc.rent,
    Electricity: dc.electricity,
    Staffing: dc.staffing,
    Consumables: dc.consumables,
    Licensing: dc.licensing,
    Other: dc.other,
    Fixed_Opex_Total: dc.fixedOpeXTotal,
  }));
  const wsDeptCosts = XLSX.utils.json_to_sheet(deptCostsData);
  setColWidths(wsDeptCosts, deptCostsData);
  XLSX.utils.book_append_sheet(wb, wsDeptCosts, 'Department_Costs');

  // Tab 5: Monthly_Costs
  const monthlyCostsData = monthlyCosts.map((mc) => ({
    Year_Month: mc.yearMonth,
    Branch_Code: branchCodeMap.get(mc.branchId) || mc.branchId,
    Rent: mc.rent,
    Electricity: mc.electricity,
    Staffing: mc.staffing,
    Consumables: mc.consumables,
    Licensing: mc.licensing,
    Other: mc.other,
    Fixed_Opex_Total: mc.fixedOpeXTotal,
  }));
  const wsMonthlyCosts = XLSX.utils.json_to_sheet(monthlyCostsData);
  setColWidths(wsMonthlyCosts, monthlyCostsData);
  XLSX.utils.book_append_sheet(wb, wsMonthlyCosts, 'Monthly_Costs');

  // Tab 6: Department_Profitability
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

  // Tab 7: Daily_Dept_Revenue
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

  // Tab 8: Occupied_Dialysis_Slots
  const dialysisData = slots
    .filter((s) => s.isOccupied)
    .map((s) => ({
      Date: s.date,
      Branch_Code: branchCodeMap.get(s.branchId) || s.branchId,
      Machine_Index: s.machineIndex,
      Shift_Index: s.slotIndex,
      Slot_Type: s.slotType,
      Applied_Rate: s.appliedRate,
    }));
  const wsDialysis = XLSX.utils.json_to_sheet(dialysisData);
  setColWidths(wsDialysis, dialysisData);
  XLSX.utils.book_append_sheet(wb, wsDialysis, 'Occupied_Dialysis_Slots');

  const exportDate = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Clinic_Master_Workbook_${exportDate}.xlsx`);
}

// 3. EXPORT DAILY REVENUE CSV
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
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daily-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// 4. JSON FULL BACKUP SNAPSHOT
export async function triggerJsonBackupDownload(): Promise<void> {
  const json = await db.exportToJsonBackup();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clinic-state-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
