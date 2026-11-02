import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import {
  exportFullExcelWorkbook,
  downloadExcelImportTemplate,
  exportDailyEntriesCsv,
  exportDialysisSlotsCsv,
  exportCostsPerLabCsv,
  exportDarAlShifaInvoicesCsv,
  exportSaifeeInvoicesCsv,
  exportOpdRoomsCsv,
} from '../engine/exportEngine';
import { importSpreadsheetFile, ImportResultSummary } from '../engine/importEngine';
import {
  getCloudSyncConfig,
  saveCloudSyncConfig,
  testGoogleSheetsConnection,
  pushToGoogleSheets,
  formatAndSyncGoogleSheet,
  pullFromGoogleSheets,
  getGoogleAppsScriptCode,
  CloudSyncConfig,
} from '../db/cloudSync';
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
  ShieldAlert,
  AlertTriangle,
  Cloud,
  RefreshCw,
  Copy,
  Check,
  Code,
  X,
  Sliders,
  Calendar,
  Building,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const DataExport: React.FC = () => {
  const { setMetaStatus, setActiveTab } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'MERGE' | 'OVERWRITE'>('MERGE');
  const [importSummary, setImportSummary] = useState<ImportResultSummary | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(
    null
  );

  // Google Sheets state
  const [cloudConfig, setCloudConfig] = useState<CloudSyncConfig>(() => getCloudSyncConfig());
  const [showAppsScriptModal, setShowAppsScriptModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<{
    type: 'idle' | 'syncing' | 'success' | 'error';
    text: string;
  }>({ type: 'idle', text: '' });

  // Table counts for audit overview
  const branchCount = useLiveQuery(() => db.branches.count());
  const catalogCount = useLiveQuery(() => db.serviceCatalog.count());
  const invoiceCount = useLiveQuery(() => db.patientInvoices.count());
  const opdSlotCount = useLiveQuery(() => db.opdRoomSlots.count());
  const deptCostCount = useLiveQuery(() => db.departmentCosts.count());
  const costCount = useLiveQuery(() => db.monthlyCosts.count());
  const dailyCount = useLiveQuery(() => db.dailyEntries.count());
  const slotCount = useLiveQuery(() => db.dialysisSlots.count());
  const capacityCount = useLiveQuery(() => db.capacityLogs.count());

  // ----------------------------------------------------
  // TEMPLATE & EXPORT HANDLERS (.XLSX & .CSV ONLY)
  // ----------------------------------------------------
  const handleDownloadTemplate = async () => {
    setLoadingAction('template');
    try {
      await downloadExcelImportTemplate();
      setFeedback({
        type: 'success',
        message: 'Downloaded standardized 5-tab Excel template (Clinic_Data_Import_Template.xlsx)!',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to download template.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportExcelMaster = async () => {
    setLoadingAction('excel');
    try {
      await exportFullExcelWorkbook();
      setFeedback({
        type: 'success',
        message: 'Full 5-tab master workbook (.xlsx) exported successfully with Dar Al Shifa, Saifee, OPD Rooms, Dialysis Slots, and Costs per Lab!',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to generate Excel file.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportDusInvoices = async () => {
    setLoadingAction('csv-dus-invoices');
    try {
      await exportDarAlShifaInvoicesCsv();
      setFeedback({ type: 'success', message: 'Dar Al Shifa patient invoices CSV exported successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export Dar Al Shifa invoices.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportSdcInvoices = async () => {
    setLoadingAction('csv-sdc-invoices');
    try {
      await exportSaifeeInvoicesCsv();
      setFeedback({ type: 'success', message: 'Saifee Diagnostic Centre patient invoices CSV exported successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export Saifee invoices.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportOpdRooms = async () => {
    setLoadingAction('csv-opd-rooms');
    try {
      await exportOpdRoomsCsv();
      setFeedback({ type: 'success', message: 'OPD room booking schedule CSV (2500/2 hrs) exported successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export OPD rooms CSV.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportDialysisCsv = async () => {
    setLoadingAction('csv-dialysis');
    try {
      await exportDialysisSlotsCsv();
      setFeedback({ type: 'success', message: 'Dialysis slots date-wise tables CSV exported successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export Dialysis CSV.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportCostsCsv = async () => {
    setLoadingAction('csv-costs');
    try {
      await exportCostsPerLabCsv();
      setFeedback({ type: 'success', message: 'Costs per lab categorized OPEX CSV (July 2026 onwards) exported successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export Costs per Lab CSV.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportDailyCsv = async () => {
    setLoadingAction('csv-daily');
    try {
      await exportDailyEntriesCsv();
      setFeedback({ type: 'success', message: 'Daily department entries CSV exported successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export Daily Revenue CSV.' });
    } finally {
      setLoadingAction(null);
    }
  };

  // ----------------------------------------------------
  // IMPORT HANDLER (.XLSX OR .CSV ONLY — JSON STRICTLY REJECTED)
  // ----------------------------------------------------
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();

    // Explicit check against JSON files
    if (lowerName.endsWith('.json') || file.type === 'application/json' || file.type.includes('json')) {
      setFeedback({
        type: 'error',
        message: 'JSON files are not accepted. Only .xlsx (Excel) or .csv (Comma-Separated Values) files can be imported.',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (importMode === 'OVERWRITE') {
      const confirm = window.confirm(
        'CAUTION: You selected OVERWRITE mode. Existing records matching the imported sheet tables will be replaced. Continue?'
      );
      if (!confirm) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    setLoadingAction('file-import');
    setImportSummary(null);

    try {
      const result = await importSpreadsheetFile(file, importMode);
      setImportSummary(result);
      if (result.success) {
        setMetaStatus(true, true);
        setFeedback({
          type: 'success',
          message: `Spreadsheet import succeeded (${result.mode} mode)! See audit summary below.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: result.errors[0] || 'Import failed. Check file structure.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Import processing error: ${err.message || 'Unknown error'}`,
      });
    } finally {
      setLoadingAction(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ----------------------------------------------------
  // GOOGLE SHEETS SYNC HANDLERS
  // ----------------------------------------------------
  const handleUpdateGoogleUrl = (url: string) => {
    const updated: CloudSyncConfig = {
      ...cloudConfig,
      provider: 'googlesheets',
      googleAppsScriptUrl: url,
    };
    setCloudConfig(updated);
    saveCloudSyncConfig(updated);
  };

  const handleTestGoogleSheets = async () => {
    setSheetsSyncStatus({ type: 'syncing', text: 'Testing Google Sheets connection...' });
    const res = await testGoogleSheetsConnection();
    setSheetsSyncStatus({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const handlePushToGoogleSheets = async () => {
    setSheetsSyncStatus({ type: 'syncing', text: 'Pushing 5 clinical tabs to Google Sheets...' });
    const res = await pushToGoogleSheets();
    if (res.success) {
      const refreshed = getCloudSyncConfig();
      setCloudConfig(refreshed);
      setSheetsSyncStatus({ type: 'success', text: res.message });
      setFeedback({ type: 'success', message: 'Successfully synced all 5 tabs to Google Sheets!' });
    } else {
      setSheetsSyncStatus({ type: 'error', text: res.message });
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleFormatAndSyncGoogleSheet = async () => {
    setSheetsSyncStatus({ type: 'syncing', text: 'Formatting & syncing Google Sheet into the 5 Excel tabs...' });
    const res = await formatAndSyncGoogleSheet();
    if (res.success) {
      const refreshed = getCloudSyncConfig();
      setCloudConfig(refreshed);
      setSheetsSyncStatus({ type: 'success', text: res.message });
      setFeedback({ type: 'success', message: 'Google Sheet successfully formatted and synced with all 5 clinical tabs!' });
    } else {
      setSheetsSyncStatus({ type: 'error', text: res.message });
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handlePullFromGoogleSheets = async () => {
    const proceed = window.confirm(
      'Notice: Pulling from Google Sheets will merge remote sheets (Dar Al Shifa, Saifee, OPD Rooms, Dialysis Slots, Costs per Lab) into your local browser database. Proceed?'
    );
    if (!proceed) return;

    setSheetsSyncStatus({ type: 'syncing', text: 'Pulling 5 latest tabs from Google Sheets...' });
    const res = await pullFromGoogleSheets();
    if (res.success) {
      const refreshed = getCloudSyncConfig();
      setCloudConfig(refreshed);
      setSheetsSyncStatus({ type: 'success', text: res.message });
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setSheetsSyncStatus({ type: 'error', text: res.message });
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleCopyAppsScript = () => {
    navigator.clipboard.writeText(getGoogleAppsScriptCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleResetSample = async () => {
    const confirm = window.confirm(
      'Are you sure you want to revert all changes and reset to the deterministic 6-month seed dataset?'
    );
    if (!confirm) return;

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
      {/* Status Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : feedback.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
            {feedback.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
            {feedback.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
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
      {/* 1. GOOGLE SHEETS LIVE SYNC INTEGRATION               */}
      {/* ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Google Sheets Bi-Directional Synchronization
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  Cloud Live Sync
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sync all 5 operational sheets (Dar Al Shifa, Saifee Diagnostic Centre, OPD Rooms, Dialysis Slots, Costs per Lab) directly with your Google Sheet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAppsScriptModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Code className="w-4 h-4 text-slate-500" />
              <span>Apps Script Connector Code</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('capacity')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Open full cloud sync settings"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Sync Settings</span>
            </button>
          </div>
        </div>

        {/* Sync Controls & URL Configuration */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Apps Script Web App URL:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={cloudConfig.googleAppsScriptUrl || ''}
                  onChange={(e) => handleUpdateGoogleUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={handleTestGoogleSheets}
                  disabled={!cloudConfig.googleAppsScriptUrl || sheetsSyncStatus.type === 'syncing'}
                  className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Test Connection
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Deploy as Web App in your Google Sheet (Extensions &gt; Apps Script), then paste the URL here.
              </span>
              <div className="mt-2.5 p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Match Excel Format:</strong> Clicking <em>Sync &amp; Format Google Sheet</em> cleans up obsolete tabs and reconfigures the exact 5 tabs: <code>Dar Al Shifa</code>, <code>Saifee Diagnostic Centre</code>, <code>OPD_Rooms</code>, <code>Dialysis_slots</code>, and <code>Costs_per_lab</code> with dark teal headers, frozen row 1, and auto-sized columns.
                  <span className="block mt-0.5 text-emerald-700 font-medium">
                    Important: If your Google Sheet still shows old tabs after syncing, ensure you have deployed a <strong>New Version</strong> in Google Sheets: <em>Extensions &gt; Apps Script &gt; Deploy &gt; Manage deployments &gt; Edit &gt; Version: New version &gt; Deploy</em>.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Cloud Sync</span>
                <span className="font-bold text-slate-800">
                  {cloudConfig.lastSyncAt
                    ? format(parseISO(cloudConfig.lastSyncAt), 'dd MMM yyyy, HH:mm:ss')
                    : 'Never Synced'}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={handleFormatAndSyncGoogleSheet}
                  disabled={!cloudConfig.googleAppsScriptUrl || sheetsSyncStatus.type === 'syncing'}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                  title="Formats Google Sheet to match Excel tabs (Dar Al Shifa, Saifee, OPD Rooms, Dialysis Slots, Costs per Lab)"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Sync &amp; Format Google Sheet (Match Excel)</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePushToGoogleSheets}
                    disabled={!cloudConfig.googleAppsScriptUrl || sheetsSyncStatus.type === 'syncing'}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Quick Push</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePullFromGoogleSheets}
                    disabled={!cloudConfig.googleAppsScriptUrl || sheetsSyncStatus.type === 'syncing'}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Pull from Sheet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sync status alert */}
          {sheetsSyncStatus.text && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                sheetsSyncStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : sheetsSyncStatus.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-teal-50 text-teal-800 border border-teal-200 animate-pulse'
              }`}
            >
              {sheetsSyncStatus.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
              {sheetsSyncStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {sheetsSyncStatus.type === 'syncing' && <RefreshCw className="w-4 h-4 text-teal-600 animate-spin shrink-0" />}
              <span>{sheetsSyncStatus.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. SPREADSHEET (.XLSX / .CSV) BULK IMPORT WORKFLOW   */}
      {/* ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Bi-Directional Spreadsheet Import (.xlsx &amp; .csv)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  5 Clinical Tabs
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download the standardized 5-tab template, update records, and import directly into the browser database. Accepts <strong>.xlsx</strong> and <strong>.csv</strong> files.
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
              <span>{loadingAction === 'template' ? 'Generating...' : 'Download 5-Tab Template (.xlsx)'}</span>
            </button>
          </div>
        </div>

        {/* 5-Tab Structure Explanation Banner */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
          <span className="font-bold text-slate-800 block">Standardized 5-Tab Workbook Structure:</span>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-slate-600">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <strong className="text-teal-700 block text-[11px] uppercase">1. Dar Al Shifa</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">Billing &amp; Invoices</span>
                <p className="text-[11px] text-slate-600 mt-1">Sr. no., Invoice number, time of Bill, Net Amt, UMR, Patient Name, Age/Gender, Personal contact.</p>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <strong className="text-teal-700 block text-[11px] uppercase">2. Saifee Diagnostic Centre</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">Billing &amp; Invoices</span>
                <p className="text-[11px] text-slate-600 mt-1">Sr. no., Invoice number, time of Bill, Net Amt, UMR, Patient Name, Age/Gender, Personal contact.</p>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <strong className="text-teal-700 block text-[11px] uppercase">3. OPD_Rooms</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">₹2,500 / 2 hrs</span>
                <p className="text-[11px] text-slate-600 mt-1">Saifee OPD 1, Dar Al Shifa OPD 1 &amp; OPD 2. 6 two-hour slots (8am-8pm), 7 days a week.</p>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <strong className="text-teal-700 block text-[11px] uppercase">4. Dialysis_slots</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">Station Matrix</span>
                <p className="text-[11px] text-slate-600 mt-1">Date-wise center-wise tables for machine fleet, shifts, slot types, and applied rates.</p>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <strong className="text-teal-700 block text-[11px] uppercase">5. Costs_per_lab</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">From July 2026</span>
                <p className="text-[11px] text-slate-600 mt-1">Categorized OPEX (Consumables, Manpower, Rent, Electricity, Misc) tables for each branch.</p>
              </div>
            </div>
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
                    Updates existing records and appends new rows without wiping other tables.
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
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                Step 2: Upload Spreadsheet (.xlsx or .csv)
              </span>
              <p className="text-xs text-slate-500 mb-3">
                Upload 5-tab <strong>.xlsx</strong> template or individual dataset <strong>.csv</strong> file.
                <span className="text-rose-600 font-semibold block mt-0.5">Note: JSON files are strictly not accepted.</span>
              </p>
            </div>

            <input
              type="file"
              accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              ref={fileInputRef}
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loadingAction === 'file-import'}
              className="w-full py-4 px-4 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/70 rounded-xl flex items-center justify-center gap-2 text-teal-800 font-bold text-xs transition-all cursor-pointer"
            >
              <Upload className={`w-4 h-4 ${loadingAction === 'file-import' ? 'animate-bounce' : ''}`} />
              <span>{loadingAction === 'file-import' ? 'Parsing & Saving...' : 'Click to Browse & Import (.xlsx or .csv)'}</span>
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
                  Spreadsheet Import Audit Trail
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Imported at {format(parseISO(importSummary.importedAt), 'HH:mm:ss')} • Mode: <strong>{importSummary.mode}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Invoices</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.patientInvoices}</p>
              </div>
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">OPD Slots</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.opdRoomSlots}</p>
              </div>
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Dialysis Slots</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.dialysisSlots}</p>
              </div>
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Lab Costs</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.departmentCosts}</p>
              </div>
              <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Monthly OPEX</span>
                <p className="text-base font-bold text-slate-900">{importSummary.auditCounts.monthlyCosts}</p>
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
                  <strong>Sunday Safety Rule Applied:</strong> {importSummary.skippedSundaysCount} Sunday dialysis booking rows in the spreadsheet were safely excluded.
                </span>
              </div>
            )}

            {/* Parser Audit Notes */}
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
      {/* 3. LOCAL DATABASE LIVE INVENTORY                     */}
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
            <span className="text-[10px] uppercase font-semibold text-slate-500">Invoices</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{invoiceCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">OPD Slots</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{opdSlotCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Dialysis Slots</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{slotCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Lab Costs</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{deptCostCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Monthly Costs</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{costCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Service Items</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{catalogCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Daily Dept Logs</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{dailyCount ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. EXPORT WORKBOOK & CSV CARDS (.XLSX & .CSV ONLY)   */}
      {/* ==================================================== */}
      <div>
        <h3 className="font-bold text-slate-900 text-sm mb-3">
          Export &amp; Offline Backup Options (.xlsx and .csv only)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* 1. Master Excel Backup */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Master 5-Tab (.xlsx)</h4>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                Full 5-sheet workbook: Dar Al Shifa, Saifee, OPD Rooms, Dialysis Slots, Costs per Lab.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportExcelMaster}
              disabled={loadingAction === 'excel'}
              className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{loadingAction === 'excel' ? 'Exporting...' : 'Export .xlsx'}</span>
            </button>
          </div>

          {/* 2. Dar Al Shifa Invoices CSV */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Dar Al Shifa Bills (.csv)</h4>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                Invoice numbers, timestamps, net amounts, UMR numbers, and patient contact records.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportDusInvoices}
              disabled={loadingAction === 'csv-dus-invoices'}
              className="w-full flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{loadingAction === 'csv-dus-invoices' ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          </div>

          {/* 3. Saifee Invoices CSV */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Saifee Bills (.csv)</h4>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                Patient invoices, timestamps, net amounts, UMR, and demographic records for SDC center.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportSdcInvoices}
              disabled={loadingAction === 'csv-sdc-invoices'}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{loadingAction === 'csv-sdc-invoices' ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          </div>

          {/* 4. OPD Rooms CSV */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">OPD Rooms (.csv)</h4>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                2-hour booking slots (8am-8pm, 7 days/week) at ₹2,500/2 hrs for SDC OPD 1, DUS OPD 1 &amp; OPD 2.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportOpdRooms}
              disabled={loadingAction === 'csv-opd-rooms'}
              className="w-full flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{loadingAction === 'csv-opd-rooms' ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          </div>

          {/* 5. Dialysis Slots CSV */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Dialysis Slots (.csv)</h4>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                Date-wise center-wise shift bookings, slot types (Standard/Single-Use), and rates.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportDialysisCsv}
              disabled={loadingAction === 'csv-dialysis'}
              className="w-full flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{loadingAction === 'csv-dialysis' ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          </div>

          {/* 6. Costs Per Lab CSV */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Costs Per Lab (.csv)</h4>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                Monthly OPEX tables from July 2026 (Consumables, Manpower, Rent, Electricity, Misc).
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCostsCsv}
              disabled={loadingAction === 'csv-costs'}
              className="w-full flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{loadingAction === 'csv-costs' ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 5. DANGER ZONE: SEED RESET                          */}
      {/* ==================================================== */}
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

      {/* ==================================================== */}
      {/* MODAL: GOOGLE APPS SCRIPT CONNECTOR CODE            */}
      {/* ==================================================== */}
      {showAppsScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Google Sheets Apps Script Connector</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600">
              <p className="text-slate-700 font-medium">
                Follow these 4 simple steps to connect any Google Sheet to this dashboard with zero server requirements:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                <li>Create a new Google Sheet or open your existing clinic spreadsheet.</li>
                <li>In Google Sheets, click <strong>Extensions &gt; Apps Script</strong>.</li>
                <li>Delete any code in the editor and paste the connector script below.</li>
                <li>Click <strong>Deploy &gt; New deployment</strong>, select type <strong>Web app</strong>, choose <strong>Execute as: Me</strong>, and set <strong>Who has access: Anyone</strong>.</li>
                <li>Copy the resulting Web App URL and paste it into the Sync URL box. Syncs all 5 tabs: <code className="text-teal-700 font-bold">Dar_Al_Shifa</code>, <code className="text-teal-700 font-bold">Saifee_Diagnostic_Centre</code>, <code className="text-teal-700 font-bold">OPD_Rooms</code>, <code className="text-teal-700 font-bold">Dialysis_slots</code>, <code className="text-teal-700 font-bold">Costs_per_lab</code>.</li>
              </ol>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800">Connector Code (Copy &amp; Paste):</span>
                  <button
                    type="button"
                    onClick={handleCopyAppsScript}
                    className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-semibold transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800 select-all">
                  {getGoogleAppsScriptCode()}
                </pre>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAppsScriptModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
