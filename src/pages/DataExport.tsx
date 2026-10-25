import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import {
  exportFullExcelWorkbook,
  downloadExcelImportTemplate,
  exportDailyEntriesCsv,
  triggerJsonBackupDownload,
} from '../engine/exportEngine';
import { importExcelWorkbook, ImportResultSummary } from '../engine/importEngine';
import { seedDatabase } from '../db/seed';
import { useAppStore } from '../store/useAppStore';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Database,
  CheckCircle,
  AlertCircle,
  FileText,
  Table,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const DataExport: React.FC = () => {
  const { setMetaStatus } = useAppStore();
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'MERGE' | 'OVERWRITE'>('MERGE');
  const [importSummary, setImportSummary] = useState<ImportResultSummary | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Table counts for audit overview
  const branchCount = useLiveQuery(() => db.branches.count());
  const catalogCount = useLiveQuery(() => db.serviceCatalog.count());
  const overrideCount = useLiveQuery(() => db.rateOverrides.count());
  const deptCostCount = useLiveQuery(() => db.departmentCosts.count());
  const costCount = useLiveQuery(() => db.monthlyCosts.count());
  const dailyCount = useLiveQuery(() => db.dailyEntries.count());
  const slotCount = useLiveQuery(() => db.dialysisSlots.count());
  const capacityCount = useLiveQuery(() => db.capacityLogs.count());

  const handleDownloadTemplate = async () => {
    setLoadingAction('template');
    try {
      await downloadExcelImportTemplate();
      setFeedback({ type: 'success', message: 'Downloaded 5-tab Excel import template (Clinic_Data_Import_Template.xlsx)!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to download template.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportExcel = async () => {
    setLoadingAction('excel');
    try {
      await exportFullExcelWorkbook();
      setFeedback({ type: 'success', message: '8-tab Master Excel workbook exported successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to generate Excel file.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportCsv = async () => {
    setLoadingAction('csv');
    try {
      await exportDailyEntriesCsv();
      setFeedback({ type: 'success', message: 'Daily department entries CSV downloaded successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export CSV.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportJson = async () => {
    setLoadingAction('json');
    try {
      await triggerJsonBackupDownload();
      setFeedback({ type: 'success', message: 'Full database JSON backup snapshot downloaded!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export JSON backup.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleImportExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (importMode === 'OVERWRITE') {
      const confirm = window.confirm(
        'CAUTION: You selected OVERWRITE mode. Existing daily department entries, dialysis slots, and department costs will be replaced with data from this workbook. Continue?'
      );
      if (!confirm) {
        if (excelFileInputRef.current) excelFileInputRef.current.value = '';
        return;
      }
    }

    setLoadingAction('excel-import');
    setImportSummary(null);
    try {
      const result = await importExcelWorkbook(file, importMode);
      setImportSummary(result);
      if (result.success) {
        setMetaStatus(true, true);
        setFeedback({
          type: 'success',
          message: `Excel import succeeded (${result.mode} mode)! See detailed audit summary below.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: result.errors[0] || 'Excel import failed. Check file structure.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Import processing error: ${err.message || 'Unknown error'}`,
      });
    } finally {
      setLoadingAction(null);
      if (excelFileInputRef.current) excelFileInputRef.current.value = '';
    }
  };

  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingAction('import');
    try {
      const text = await file.text();
      await db.restoreFromJsonBackup(text);
      setMetaStatus(true, true);
      setFeedback({
        type: 'success',
        message: 'Successfully restored all IndexedDB tables from backup JSON! Refreshing view...',
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Restore failed: ${err?.message || 'Invalid or corrupted JSON backup file.'}`,
      });
    } finally {
      setLoadingAction(null);
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
    }
  };

  const handleResetSample = async () => {
    setLoadingAction('reset');
    try {
      await seedDatabase(true);
      setMetaStatus(true, false);
      setFeedback({
        type: 'success',
        message: 'Database reset to default 6-month deterministic seed dataset! Refreshing view...',
      });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to reset sample data.' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 ml-4 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. BI-DIRECTIONAL EXCEL (.XLSX) BULK IMPORT WORKFLOW */}
      {/* ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Bi-Directional Excel (.xlsx) Import & Template Generator
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Bulk Operations
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download the standardized 5-tab spreadsheet template, fill or update operational records, and import directly into the browser database.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={loadingAction === 'template'}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{loadingAction === 'template' ? 'Generating...' : 'Download 5-Tab Template'}</span>
            </button>
          </div>
        </div>

        {/* Import Controls: Mode Switcher & File Uploader */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Mode Selector */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                Step 1: Select Import Mode
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('MERGE')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    importMode === 'MERGE'
                      ? 'bg-white border-teal-500 shadow-xs ring-2 ring-teal-500/10'
                      : 'bg-slate-100/60 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Merge / Upsert</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Safe</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Updates existing records and appends new rows without wiping other dates.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('OVERWRITE')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    importMode === 'OVERWRITE'
                      ? 'bg-white border-rose-500 shadow-xs ring-2 ring-rose-500/10'
                      : 'bg-slate-100/60 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-rose-900">Overwrite Tables</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700">Replace</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Clears imported tables before reloading to match the spreadsheet exactly.
                  </p>
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Sunday dialysis sessions are automatically skipped to protect clinical capacity rules.</span>
            </div>
          </div>

          {/* File Upload Drop Area */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                Step 2: Upload Excel File (.xlsx)
              </span>
              <p className="text-xs text-slate-500 mb-3">
                Supports official template or exported master workbooks.
              </p>
            </div>

            <input
              type="file"
              accept=".xlsx,.xls"
              ref={excelFileInputRef}
              onChange={handleImportExcelFile}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => excelFileInputRef.current?.click()}
              disabled={loadingAction === 'excel-import'}
              className="w-full py-4 px-4 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/70 rounded-xl flex items-center justify-center gap-2 text-teal-800 font-bold text-xs transition-all cursor-pointer"
            >
              <Upload className={`w-4 h-4 ${loadingAction === 'excel-import' ? 'animate-bounce' : ''}`} />
              <span>{loadingAction === 'excel-import' ? 'Parsing & Saving...' : 'Click to Browse & Import .xlsx'}</span>
            </button>
          </div>
        </div>

        {/* Import Audit Summary Card */}
        {importSummary && (
          <div className="mt-5 p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Excel Import Audit Trail Summary
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Imported at {format(parseISO(importSummary.importedAt), 'HH:mm:ss')} • Mode: <strong>{importSummary.mode}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Daily Entries</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.dailyEntries}</p>
              </div>
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Dialysis Slots</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.dialysisSlots}</p>
              </div>
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Dept Costs</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.departmentCosts}</p>
              </div>
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Monthly Costs</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.monthlyCosts}</p>
              </div>
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Service Items</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.serviceCatalog}</p>
              </div>
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Overrides</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.rateOverrides}</p>
              </div>
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Branches</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.branches}</p>
              </div>
            </div>

            {/* Sunday Exclusions Badge */}
            {importSummary.skippedSundaysCount > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Sunday Safety Rule Applied:</strong> {importSummary.skippedSundaysCount} Sunday dialysis booking rows in the spreadsheet were safely excluded from capacity.
                </span>
              </div>
            )}

            {/* Warnings list */}
            {importSummary.warnings.length > 0 && (
              <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-teal-100">
                <span className="font-semibold text-slate-700 block">Parser Audit Notes:</span>
                {importSummary.warnings.map((w, idx) => (
                  <p key={idx} className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 2. LOCAL DATABASE LIVE INVENTORY                     */}
      {/* ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Local Browser IndexedDB Inventory (`Dexie.js`)
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Branches</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{branchCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Service Items</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{catalogCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Branch Overrides</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{overrideCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Dept Costs</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{deptCostCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Monthly Costs</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{costCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Daily Dept Logs</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{dailyCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Dialysis Slots</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{slotCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Capacity Logs</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{capacityCount ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. EXPORT & BACKUP CARDS                             */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Multi-tab Excel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Export Full Excel Workbook</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Generates an 8-tab `.xlsx` master file containing Branches, Rate Card, Overrides, Department Costs, Monthly OPEX, Department Profitability, Daily Revenue, and Dialysis Sessions.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={loadingAction === 'excel'}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{loadingAction === 'excel' ? 'Exporting...' : 'Download 8-Tab .xlsx'}</span>
          </button>
        </div>

        {/* 2. CSV Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Export Daily Revenue CSV</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Extracts granular daily clinical test encounters, patient footfall, applied rates, and doctor payouts as clean `.csv` records.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={loadingAction === 'csv'}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{loadingAction === 'csv' ? 'Exporting...' : 'Download .csv'}</span>
          </button>
        </div>

        {/* 3. JSON Backup State */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Full State Backup (JSON)</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Dumps 100% of the IndexedDB state into a portable `.json` file for zero-data-loss backup, device migration, or offline archiving.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportJson}
            disabled={loadingAction === 'json'}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{loadingAction === 'json' ? 'Dumping...' : 'Export JSON State'}</span>
          </button>
        </div>

        {/* 4. JSON Restore State */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Restore State (JSON)</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Select a previously exported `.json` file. Validates schema and bulk-reloads all tables directly into IndexedDB.
            </p>
          </div>
          <input
            type="file"
            accept=".json,application/json"
            ref={jsonFileInputRef}
            onChange={handleImportJsonFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => jsonFileInputRef.current?.click()}
            disabled={loadingAction === 'import'}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{loadingAction === 'import' ? 'Validating...' : 'Select JSON to Restore'}</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Seed Reset */}
      <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              Reset Database to Initial 6-Month Seed Data
            </h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Overwrites all edits and reverts to the default deterministic dataset covering April 1, 2026 to September 30, 2026.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetSample}
            disabled={loadingAction === 'reset'}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loadingAction === 'reset' ? 'animate-spin' : ''}`} />
            <span>{loadingAction === 'reset' ? 'Resetting...' : 'Reset to Sample Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
