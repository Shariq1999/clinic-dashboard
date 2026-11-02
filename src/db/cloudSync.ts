import { db } from './database';
import { importParsedSpreadsheetData } from '../engine/importEngine';

export interface CloudSyncConfig {
  provider: 'googlesheets' | 'gist' | 'supabase';
  autoSync: boolean;
  lastSyncAt?: string;
  // Google Sheets integration
  googleSyncMethod: 'appsscript' | 'api';
  googleAppsScriptUrl?: string;
  googleSpreadsheetId?: string;
  googleAccessToken?: string;
  googleSpreadsheetUrl?: string;
  // GitHub Gist credentials
  githubToken?: string;
  gistId?: string;
  // Supabase credentials
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

const STORAGE_KEY = 'clinic_cloud_sync_config';

export function getCloudSyncConfig(): CloudSyncConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: parsed.provider || 'googlesheets',
        autoSync: Boolean(parsed.autoSync),
        lastSyncAt: parsed.lastSyncAt,
        googleSyncMethod: parsed.googleSyncMethod || 'appsscript',
        googleAppsScriptUrl: parsed.googleAppsScriptUrl || '',
        googleSpreadsheetId: parsed.googleSpreadsheetId || '',
        googleAccessToken: parsed.googleAccessToken || '',
        googleSpreadsheetUrl: parsed.googleSpreadsheetUrl || '',
        githubToken: parsed.githubToken,
        gistId: parsed.gistId,
        supabaseUrl: parsed.supabaseUrl,
        supabaseAnonKey: parsed.supabaseAnonKey,
      };
    }
  } catch (err) {
    console.error('Failed to parse cloud sync config:', err);
  }
  return {
    provider: 'googlesheets',
    autoSync: false,
    googleSyncMethod: 'appsscript',
  };
}

export function saveCloudSyncConfig(config: CloudSyncConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// ----------------------------------------------------------------------
// GOOGLE APPS SCRIPT CODE TEMPLATE
// Users can copy this code and paste it into Extensions > Apps Script of any Google Sheet
// ----------------------------------------------------------------------
export function getGoogleAppsScriptCode(): string {
  return `/**
 * ClinicChain Dashboard — Google Sheets Sync Connector
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Replace all code in the editor with this script.
 * 4. Click 'Deploy' > 'New deployment'.
 * 5. Select type: 'Web app'.
 * 6. Execute as: 'Me' (your Google account).
 * 7. Who has access: 'Anyone'.
 * 8. Click 'Deploy', authorize permissions, and copy the Web App URL.
 * 9. Paste the Web App URL into ClinicChain Dashboard Sync settings!
 */

function doPost(e) {
  try {
    var rawText = e.postData.contents;
    var data = JSON.parse(rawText);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    function writeTab(sheetName, rows) {
      if (!rows || !rows.length) return;
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      } else {
        sheet.clear();
      }
      
      var headers = Object.keys(rows[0]);
      var matrix = [headers];
      for (var i = 0; i < rows.length; i++) {
        var r = [];
        for (var j = 0; j < headers.length; j++) {
          var val = rows[i][headers[j]];
          r.push(val !== undefined && val !== null ? val : '');
        }
        matrix.push(r);
      }
      
      sheet.getRange(1, 1, matrix.length, headers.length).setValues(matrix);
      // Format Header row
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#0F766E")
        .setFontColor("#FFFFFF");
      sheet.autoResizeColumns(1, headers.length);
    }

    if (data.Dialysis_Slots && data.Dialysis_Slots.length) {
      writeTab('Dialysis_Slots', data.Dialysis_Slots);
    }
    if (data.RateCard_Consultation && data.RateCard_Consultation.length) {
      writeTab('RateCard_Consultation', data.RateCard_Consultation);
    }
    if (data.Costs_Per_Lab && data.Costs_Per_Lab.length) {
      writeTab('Costs_Per_Lab', data.Costs_Per_Lab);
    }
    if (data.Daily_Dept_Revenue && data.Daily_Dept_Revenue.length) {
      writeTab('Daily_Dept_Revenue', data.Daily_Dept_Revenue);
    }

    var countsSummary = "Slots: " + (data.Dialysis_Slots ? data.Dialysis_Slots.length : 0) +
      ", Rates/Consultations: " + (data.RateCard_Consultation ? data.RateCard_Consultation.length : 0) +
      ", Lab Costs: " + (data.Costs_Per_Lab ? data.Costs_Per_Lab.length : 0);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Successfully synchronized records to Google Sheets (" + countsSummary + ")",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    function readTab(sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];
      var data = sheet.getDataRange().getValues();
      if (data.length < 2) return [];
      var headers = data[0];
      var result = [];
      for (var i = 1; i < data.length; i++) {
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = data[i][j];
        }
        result.push(obj);
      }
      return result;
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      title: ss.getName(),
      Dialysis_Slots: readTab('Dialysis_Slots'),
      RateCard_Consultation: readTab('RateCard_Consultation'),
      Costs_Per_Lab: readTab('Costs_Per_Lab'),
      Daily_Dept_Revenue: readTab('Daily_Dept_Revenue'),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
}

// ----------------------------------------------------------------------
// DATA EXTRACTOR FOR GOOGLE SHEETS SYNC
// Prepares tabular payloads matching the 3 designated sheets
// ----------------------------------------------------------------------
export async function prepareGoogleSheetsPayload(): Promise<{
  Dialysis_Slots: any[];
  RateCard_Consultation: any[];
  Costs_Per_Lab: any[];
  Daily_Dept_Revenue: any[];
}> {
  const [branches, slots, catalog, overrides, departmentCosts, entries] = await Promise.all([
    db.branches.toArray(),
    db.dialysisSlots.toArray(),
    db.serviceCatalog.toArray(),
    db.rateOverrides.toArray(),
    db.departmentCosts.toArray(),
    db.dailyEntries.toArray(),
  ]);

  const branchCodeMap = new Map(branches.map((b) => [b.id, b.code]));

  // 1. Dialysis_Slots (Occupied dialysis slots)
  const dialysisRows = slots
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

  // 2. RateCard_Consultation (Rate card master & doctor consultation payouts)
  const rateCardRows = catalog.map((c) => {
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

  // 3. Costs_Per_Lab (Department & lab level monthly OPEX)
  const costRows = departmentCosts.map((dc) => ({
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

  // 4. Daily_Dept_Revenue (Daily patient encounters and test revenues)
  const dailyRows = entries.map((e) => {
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

  return {
    Dialysis_Slots: dialysisRows,
    RateCard_Consultation: rateCardRows,
    Costs_Per_Lab: costRows,
    Daily_Dept_Revenue: dailyRows,
  };
}

// ----------------------------------------------------------------------
// GOOGLE SHEETS CONNECTION TEST
// ----------------------------------------------------------------------
export async function testGoogleSheetsConnection(): Promise<{ success: boolean; message: string }> {
  const config = getCloudSyncConfig();

  if (config.googleSyncMethod === 'appsscript') {
    if (!config.googleAppsScriptUrl?.trim()) {
      return { success: false, message: 'Google Apps Script Web App URL is required.' };
    }
    const cleanUrl = config.googleAppsScriptUrl.trim();
    try {
      const res = await fetch(cleanUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: `Connected successfully to Google Sheet "${data.title || 'Clinic Sheet'}" via Apps Script Web App!`,
        };
      } else {
        return {
          success: false,
          message: `Google Apps Script returned status ${res.status}. Verify that deployment is set to 'Execute as: Me' and 'Who has access: Anyone'.`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Network error reaching Google Apps Script: ${err.message || 'Make sure Web App is deployed with public access.'}`,
      };
    }
  }

  if (config.googleSyncMethod === 'api') {
    if (!config.googleSpreadsheetId?.trim()) {
      return { success: false, message: 'Google Spreadsheet ID is required for API method.' };
    }
    if (!config.googleAccessToken?.trim()) {
      return { success: false, message: 'Google OAuth Access Token is required for API method.' };
    }
    try {
      const id = config.googleSpreadsheetId.trim();
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=properties.title`, {
        headers: {
          Authorization: `Bearer ${config.googleAccessToken.trim()}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: `Connected to Google Sheets API: "${data.properties?.title || id}"`,
        };
      } else {
        return {
          success: false,
          message: `Google Sheets API returned status ${res.status}. Check your access token permissions.`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Network error connecting to Google Sheets API: ${err.message}`,
      };
    }
  }

  return { success: false, message: 'Invalid Google Sheets sync configuration.' };
}

// ----------------------------------------------------------------------
// PUSH TO GOOGLE SHEETS
// Pushes the 3 core sheets + daily entries to Google Sheets
// ----------------------------------------------------------------------
export async function pushToGoogleSheets(): Promise<{ success: boolean; message: string }> {
  const config = getCloudSyncConfig();

  if (config.googleSyncMethod === 'appsscript') {
    if (!config.googleAppsScriptUrl?.trim()) {
      return { success: false, message: 'Google Apps Script Web App URL is required to sync.' };
    }
    const payload = await prepareGoogleSheetsPayload();

    try {
      const cleanUrl = config.googleAppsScriptUrl.trim();
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Apps Script handles text/plain without CORS preflight
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        return {
          success: false,
          message: `Google Sheets Apps Script error (${res.status}): ${txt.slice(0, 150)}`,
        };
      }

      const resJson = await res.json();
      if (!resJson.success) {
        return {
          success: false,
          message: resJson.error || 'Google Apps Script failed to write sheets.',
        };
      }

      const updatedConfig: CloudSyncConfig = {
        ...config,
        lastSyncAt: new Date().toISOString(),
      };
      saveCloudSyncConfig(updatedConfig);

      return {
        success: true,
        message: resJson.message || 'Successfully updated Google Sheets tabs: Dialysis_Slots, RateCard_Consultation, Costs_Per_Lab!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Sync network failure: ${err.message || 'Could not reach Google Sheets Web App.'}`,
      };
    }
  }

  if (config.googleSyncMethod === 'api') {
    if (!config.googleSpreadsheetId?.trim() || !config.googleAccessToken?.trim()) {
      return { success: false, message: 'Google Spreadsheet ID and Access Token are required.' };
    }
    return {
      success: false,
      message: 'Direct Sheets API batch update requires Google Apps Script Web App for seamless client-side writes.',
    };
  }

  return { success: false, message: 'Unsupported Google Sheets sync method.' };
}

// ----------------------------------------------------------------------
// PULL FROM GOOGLE SHEETS
// Pulls the 3 sheets directly from Google Sheets and merges into IndexedDB
// ----------------------------------------------------------------------
export async function pullFromGoogleSheets(): Promise<{ success: boolean; message: string }> {
  const config = getCloudSyncConfig();

  if (config.googleSyncMethod === 'appsscript') {
    if (!config.googleAppsScriptUrl?.trim()) {
      return { success: false, message: 'Google Apps Script Web App URL is required.' };
    }
    try {
      const cleanUrl = config.googleAppsScriptUrl.trim();
      const res = await fetch(cleanUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        return { success: false, message: `Failed to fetch from Google Sheet (${res.status})` };
      }

      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.error || 'Apps Script returned an error.' };
      }

      const sheetsData: Record<string, any[]> = {
        Dialysis_Slots: data.Dialysis_Slots || [],
        RateCard_Consultation: data.RateCard_Consultation || [],
        Costs_Per_Lab: data.Costs_Per_Lab || [],
        Daily_Dept_Revenue: data.Daily_Dept_Revenue || [],
      };

      const result = await importParsedSpreadsheetData(sheetsData, 'MERGE');

      if (!result.success) {
        return {
          success: false,
          message: result.errors[0] || 'Failed to import Google Sheets records into local database.',
        };
      }

      const updatedConfig: CloudSyncConfig = {
        ...config,
        lastSyncAt: new Date().toISOString(),
      };
      saveCloudSyncConfig(updatedConfig);

      return {
        success: true,
        message: `Successfully pulled and merged ${result.auditCounts.dialysisSlots} dialysis slots, ${result.auditCounts.serviceCatalog} rate items, and ${result.auditCounts.departmentCosts} lab costs from Google Sheets!`,
      };
    } catch (err: any) {
      return { success: false, message: `Failed to pull from Google Sheets: ${err.message}` };
    }
  }

  return { success: false, message: 'Unsupported Google Sheets sync method.' };
}

// ----------------------------------------------------------------------
// UNIFIED TEST CONNECTION ROUTER
// ----------------------------------------------------------------------
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  const config = getCloudSyncConfig();

  if (config.provider === 'googlesheets') {
    return testGoogleSheetsConnection();
  }

  if (config.provider === 'gist') {
    if (!config.githubToken?.trim()) {
      return { success: false, message: 'GitHub Personal Access Token is required.' };
    }
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${config.githubToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: `Connected successfully to GitHub as @${data.login || 'user'}!`,
        };
      } else {
        return {
          success: false,
          message: `GitHub authentication failed (${res.status}): Check token permissions (must have 'gist' scope).`,
        };
      }
    } catch (err: any) {
      return { success: false, message: `Network error: ${err.message || 'Could not reach api.github.com'}` };
    }
  }

  if (config.provider === 'supabase') {
    if (!config.supabaseUrl?.trim() || !config.supabaseAnonKey?.trim()) {
      return { success: false, message: 'Supabase URL and Anon Key are required.' };
    }
    const baseUrl = config.supabaseUrl.trim().replace(/\/$/, '');
    try {
      const res = await fetch(`${baseUrl}/storage/v1/bucket`, {
        headers: {
          apikey: config.supabaseAnonKey.trim(),
          Authorization: `Bearer ${config.supabaseAnonKey.trim()}`,
        },
      });
      if (res.ok) {
        return { success: true, message: 'Connected successfully to Supabase Storage!' };
      } else {
        return { success: false, message: `Supabase returned status ${res.status}.` };
      }
    } catch (err: any) {
      return { success: false, message: `Network error: ${err.message || 'Could not connect to Supabase'}` };
    }
  }

  return { success: false, message: 'Unsupported provider.' };
}

// ----------------------------------------------------------------------
// UNIFIED PUSH TO CLOUD ROUTER
// ----------------------------------------------------------------------
export async function pushToCloud(): Promise<{ success: boolean; message: string; gistId?: string }> {
  const config = getCloudSyncConfig();

  if (config.provider === 'googlesheets') {
    return pushToGoogleSheets();
  }

  if (config.provider === 'gist') {
    if (!config.githubToken?.trim()) {
      return { success: false, message: 'GitHub Personal Access Token is required for Gist sync.' };
    }

    const payload = await prepareGoogleSheetsPayload();
    const backupJson = JSON.stringify(payload, null, 2);

    const gistPayload = {
      description: 'ClinicChain Dashboard — Browser State Snapshot',
      public: false,
      files: {
        'clinic-chain-state.json': {
          content: backupJson,
        },
      },
    };

    const isUpdate = Boolean(config.gistId?.trim());
    const url = isUpdate
      ? `https://api.github.com/gists/${config.gistId}`
      : 'https://api.github.com/gists';
    const method = isUpdate ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `token ${config.githubToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gistPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        return {
          success: false,
          message: `GitHub API error (${response.status}): ${errText.slice(0, 150)}`,
        };
      }

      const resData = await response.json();
      const updatedGistId = resData.id;

      const updatedConfig: CloudSyncConfig = {
        ...config,
        gistId: updatedGistId,
        lastSyncAt: new Date().toISOString(),
      };
      saveCloudSyncConfig(updatedConfig);

      return {
        success: true,
        message: `Successfully pushed snapshot to GitHub Gist (${updatedGistId.slice(0, 8)}...)`,
        gistId: updatedGistId,
      };
    } catch (err: any) {
      return { success: false, message: `Network failed: ${err.message || 'Unknown network error'}` };
    }
  }

  if (config.provider === 'supabase') {
    if (!config.supabaseUrl?.trim() || !config.supabaseAnonKey?.trim()) {
      return { success: false, message: 'Supabase URL and Anon Key are required.' };
    }

    const payload = await prepareGoogleSheetsPayload();
    const backupJson = JSON.stringify(payload, null, 2);
    const baseUrl = config.supabaseUrl.trim().replace(/\/$/, '');
    const storageUrl = `${baseUrl}/storage/v1/object/clinic-backups/clinic-chain-state.json`;

    try {
      const res = await fetch(storageUrl, {
        method: 'POST',
        headers: {
          apikey: config.supabaseAnonKey.trim(),
          Authorization: `Bearer ${config.supabaseAnonKey.trim()}`,
          'Content-Type': 'application/json',
          'x-upsert': 'true',
        },
        body: backupJson,
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          success: false,
          message: `Supabase Storage error (${res.status}): ${errText.slice(0, 120)}`,
        };
      }

      const updatedConfig: CloudSyncConfig = {
        ...config,
        lastSyncAt: new Date().toISOString(),
      };
      saveCloudSyncConfig(updatedConfig);

      return { success: true, message: 'Successfully uploaded backup snapshot to Supabase Storage!' };
    } catch (err: any) {
      return { success: false, message: `Supabase sync failed: ${err.message || 'Network error'}` };
    }
  }

  return { success: false, message: 'Unsupported cloud provider.' };
}

// ----------------------------------------------------------------------
// UNIFIED PULL FROM CLOUD ROUTER
// ----------------------------------------------------------------------
export async function pullFromCloud(): Promise<{ success: boolean; message: string }> {
  const config = getCloudSyncConfig();

  if (config.provider === 'googlesheets') {
    return pullFromGoogleSheets();
  }

  if (config.provider === 'gist') {
    if (!config.gistId?.trim()) {
      return { success: false, message: 'Gist ID is missing. Push first or paste an existing Gist ID.' };
    }

    const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
    if (config.githubToken?.trim()) {
      headers['Authorization'] = `token ${config.githubToken.trim()}`;
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${config.gistId.trim()}`, { headers });
      if (!response.ok) {
        return { success: false, message: `Failed to fetch Gist (${response.status})` };
      }

      const gist = await response.json();
      const fileObj = gist.files?.['clinic-chain-state.json'];
      if (!fileObj || !fileObj.content) {
        return { success: false, message: "Gist does not contain 'clinic-chain-state.json' file." };
      }

      const parsedData = JSON.parse(fileObj.content);
      const res = await importParsedSpreadsheetData(parsedData, 'OVERWRITE');

      const updatedConfig: CloudSyncConfig = {
        ...config,
        lastSyncAt: new Date().toISOString(),
      };
      saveCloudSyncConfig(updatedConfig);

      return { success: true, message: `Successfully pulled state from GitHub Gist! Loaded ${res.auditCounts.dialysisSlots} slots.` };
    } catch (err: any) {
      return { success: false, message: `Pull failed: ${err.message || 'Unknown error'}` };
    }
  }

  if (config.provider === 'supabase') {
    if (!config.supabaseUrl?.trim() || !config.supabaseAnonKey?.trim()) {
      return { success: false, message: 'Supabase URL and Anon Key are required.' };
    }

    const baseUrl = config.supabaseUrl.trim().replace(/\/$/, '');
    const storageUrl = `${baseUrl}/storage/v1/object/public/clinic-backups/clinic-chain-state.json`;

    try {
      const res = await fetch(storageUrl, {
        headers: {
          apikey: config.supabaseAnonKey.trim(),
          Authorization: `Bearer ${config.supabaseAnonKey.trim()}`,
        },
      });

      if (!res.ok) {
        return { success: false, message: `Failed to fetch from Supabase (${res.status}).` };
      }

      const jsonText = await res.text();
      const parsedData = JSON.parse(jsonText);
      const resImport = await importParsedSpreadsheetData(parsedData, 'OVERWRITE');

      const updatedConfig: CloudSyncConfig = {
        ...config,
        lastSyncAt: new Date().toISOString(),
      };
      saveCloudSyncConfig(updatedConfig);

      return { success: true, message: `Successfully restored state from Supabase Cloud! Loaded ${resImport.auditCounts.dialysisSlots} slots.` };
    } catch (err: any) {
      return { success: false, message: `Supabase pull error: ${err.message || 'Network error'}` };
    }
  }

  return { success: false, message: 'Unsupported cloud provider.' };
}

// ----------------------------------------------------------------------
// AUTO-SYNC HOOK
// ----------------------------------------------------------------------
let autoSyncTimeout: any = null;
export function triggerAutoSync(): void {
  const config = getCloudSyncConfig();
  if (!config.autoSync) return;

  if (autoSyncTimeout) clearTimeout(autoSyncTimeout);
  autoSyncTimeout = setTimeout(async () => {
    try {
      console.log('[CloudSync] Auto-syncing state to configured cloud...');
      await pushToCloud();
    } catch (err) {
      console.warn('[CloudSync] Auto-sync error:', err);
    }
  }, 5000);
}
