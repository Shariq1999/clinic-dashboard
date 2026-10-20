import * as XLSX from 'xlsx';
import { db } from '../db/database';

export async function exportFullExcelWorkbook(): Promise<void> {
  const [branches, slots, entries, costs, catalog, overrides] = await Promise.all([
    db.branches.toArray(),
    db.dialysisSlots.toArray(),
    db.dailyEntries.toArray(),
    db.monthlyCosts.toArray(),
    db.serviceCatalog.toArray(),
    db.rateOverrides.toArray(),
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(branches), 'Branches');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(catalog), 'RateCard_Master');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overrides), 'Branch_Overrides');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(costs), 'Monthly_Costs');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(entries), 'Daily_Dept_Revenue');
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(slots.filter((s) => s.isOccupied)),
    'Occupied_Dialysis_Slots'
  );

  XLSX.writeFile(wb, `Clinic_Dashboard_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportDailyEntriesCsv(): Promise<void> {
  const entries = await db.dailyEntries.toArray();
  const ws = XLSX.utils.json_to_sheet(entries);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daily-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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
