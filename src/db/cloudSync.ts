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
 * 
 * NOTE: If you already deployed earlier, click 'Deploy' > 'Manage deployments' > 
 * Edit (pencil icon) > select 'Version: New version' > click 'Deploy'.
 */

function doPost(e) {
  try {
    var rawText = e.postData.contents;
    var data = JSON.parse(rawText);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Automatically delete/archive obsolete legacy tabs to match the 5-tab Excel format
    if (data.formatToMatchExcel) {
      var obsoleteTabs = [
        'Sheet1',
        'RateCard_Consultation',
        'Daily_Dept_Revenue',
        'Dialysis_Slots',
        'Costs_Per_Lab',
        'Dar_Al_Shifa',
        'Saifee_Diagnostic_Centre'
      ];
      obsoleteTabs.forEach(function(oldName) {
        var oldSheet = ss.getSheetByName(oldName);
        if (oldSheet && ss.getSheets().length > 1) {
          try { ss.deleteSheet(oldSheet); } catch(ex) {}
        }
      });
    }

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
      // Format Header row matching Excel theme
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#0F766E")
        .setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
    }

    // 1. Dar Al Shifa
    var dusData = data['Dar Al Shifa'] || data.Dar_Al_Shifa;
    if (dusData && dusData.length) writeTab('Dar Al Shifa', dusData);

    // 2. Saifee Diagnostic Centre
    var sdcData = data['Saifee Diagnostic Centre'] || data.Saifee_Diagnostic_Centre;
    if (sdcData && sdcData.length) writeTab('Saifee Diagnostic Centre', sdcData);

    // 3. OPD_Rooms
    var opdData = data['OPD_Rooms'] || data.OPD_Rooms;
    if (opdData && opdData.length) writeTab('OPD_Rooms', opdData);

    // 4. Dialysis_slots
    var diaData = data['Dialysis_slots'] || data.Dialysis_slots;
    if (diaData && diaData.length) writeTab('Dialysis_slots', diaData);

    // 5. Costs_per_lab
    var cstData = data['Costs_per_lab'] || data.Costs_per_lab;
    if (cstData && cstData.length) writeTab('Costs_per_lab', cstData);

    var countsSummary = "Dar Al Shifa: " + (dusData ? dusData.length : 0) +
      ", Saifee: " + (sdcData ? sdcData.length : 0) +
      ", OPD: " + (opdData ? opdData.length : 0) +
      ", Dialysis: " + (diaData ? diaData.length : 0) +
      ", Costs: " + (cstData ? cstData.length : 0);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Successfully synchronized 5 clinical tabs to Google Sheets (" + countsSummary + ")",
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

    var dus = readTab('Dar Al Shifa').length ? readTab('Dar Al Shifa') : readTab('Dar_Al_Shifa');
    var sdc = readTab('Saifee Diagnostic Centre').length ? readTab('Saifee Diagnostic Centre') : readTab('Saifee_Diagnostic_Centre');

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      title: ss.getName(),
      'Dar Al Shifa': dus,
      Dar_Al_Shifa: dus,
      'Saifee Diagnostic Centre': sdc,
      Saifee_Diagnostic_Centre: sdc,
      OPD_Rooms: readTab('OPD_Rooms'),
      Dialysis_slots: readTab('Dialysis_slots'),
      Costs_per_lab: readTab('Costs_per_lab'),
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
// Prepares tabular payloads matching the 5 clinical tabs
// ----------------------------------------------------------------------
export async function prepareGoogleSheetsPayload(): Promise<{
  'Dar Al Shifa': any[];
  Dar_Al_Shifa: any[];
  'Saifee Diagnostic Centre': any[];
  Saifee_Diagnostic_Centre: any[];
  OPD_Rooms: any[];
  Dialysis_slots: any[];
  Costs_per_lab: any[];
}> {
  const [branches, slots, departmentCosts, invoices, opdSlots] = await Promise.all([
    db.branches.toArray(),
    db.dialysisSlots.toArray(),
    db.departmentCosts.toArray(),
    db.patientInvoices.toArray(),
    db.opdRoomSlots.toArray(),
  ]);

  const branchCodeMap = new Map(branches.map((b) => [b.id, b.code]));
  const branchNameMap = new Map(branches.map((b) => [b.id, b.name]));

  // 1. Dar Al Shifa (Invoices)
  const dusInvoices = invoices.filter((i) => i.branchId === 'br_dar_ul_shifa');
  const dusRows = dusInvoices.map((inv, idx) => ({
    'Sr. no.': inv.srNo || idx + 1,
    'Invoice number': inv.invoiceNumber,
    'time of Bill': inv.timeOfBill,
    'Net Amt': inv.netAmt,
    'UMR': inv.umr,
    'Patient Name': inv.patientName,
    'Age/Gender': inv.ageGender,
    'Personal contact': inv.personalContact,
  }));

  // 2. Saifee Diagnostic Centre (Invoices)
  const sdcInvoices = invoices.filter((i) => i.branchId === 'br_saifee_diag');
  const sdcRows = sdcInvoices.map((inv, idx) => ({
    'Sr. no.': inv.srNo || idx + 1,
    'Invoice number': inv.invoiceNumber,
    'time of Bill': inv.timeOfBill,
    'Net Amt': inv.netAmt,
    'UMR': inv.umr,
    'Patient Name': inv.patientName,
    'Age/Gender': inv.ageGender,
    'Personal contact': inv.personalContact,
  }));

  // 3. OPD_Rooms (Weekly tables)
  const groupedOpd = new Map<string, Record<string, string>>();
  opdSlots.forEach((slot) => {
    const wk = slot.weekLabel || 'Week 1';
    const key = `${wk}__${slot.roomName}__${slot.dayOfWeek}`;
    const existing = groupedOpd.get(key) || {
      Week: wk,
      OPD_Room: slot.roomName,
      Day_of_Week: slot.dayOfWeek,
    };
    existing[slot.timeSlot.replace(' AM', '').replace(' PM', '').trim()] = slot.doctorName || 'Available';
    existing[slot.timeSlot] = slot.doctorName || 'Available';
    groupedOpd.set(key, existing);
  });

  const opdRows = Array.from(groupedOpd.values()).map((row) => ({
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

  // 4. Dialysis_slots
  const dialysisRows = slots
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

  // 5. Costs_per_lab (Categorized monthly from July 2026)
  const targetCosts = departmentCosts.filter((dc) => dc.yearMonth >= '2026-07');
  const activeCosts = targetCosts.length > 0 ? targetCosts : departmentCosts;

  const monthBranchMap = new Map<string, typeof departmentCosts>();
  activeCosts.forEach((dc) => {
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

    let tDia = 0, tBld = 0, tUsg = 0, tXry = 0, tPhy = 0, tCon = 0, tAll = 0;

    categories.forEach((cat) => {
      const dia = findCost('DIALYSIS', cat.key);
      const bld = findCost('BLOOD_TEST', cat.key);
      const usg = findCost('USG', cat.key);
      const xry = findCost('XRAY', cat.key);
      const phy = findCost('PHYSIO', cat.key);
      const con = findCost('CONSULTATION', cat.key);
      const sum = dia + bld + usg + xry + phy + con;
      tDia += dia; tBld += bld; tUsg += usg; tXry += xry; tPhy += phy; tCon += con; tAll += sum;

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
        Branch_Total: sum,
      });
    });

    costsPerLabRows.push({
      Month: ym,
      Branch: branchName,
      Expense_Category: 'Total',
      Dialysis: tDia,
      Blood_Tests: tBld,
      USG: tUsg,
      X_Ray: tXry,
      Physiotherapy: tPhy,
      Consultation: tCon,
      Branch_Total: tAll,
    });
  });

  return {
    'Dar Al Shifa': dusRows,
    Dar_Al_Shifa: dusRows,
    'Saifee Diagnostic Centre': sdcRows,
    Saifee_Diagnostic_Centre: sdcRows,
    OPD_Rooms: opdRows,
    Dialysis_slots: dialysisRows,
    Costs_per_lab: costsPerLabRows,
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
        message: resJson.message || 'Successfully updated Google Sheets 5 clinical tabs!',
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
// FORMAT & SYNC TO GOOGLE SHEETS (MATCH EXCEL TEMPLATE)
// Re-initializes, removes obsolete sheets, and formats Google Sheets
// into the exact 5 tabs matching Excel with teal headers & frozen rows
// ----------------------------------------------------------------------
export async function formatAndSyncGoogleSheet(): Promise<{ success: boolean; message: string }> {
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
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          ...payload,
          formatToMatchExcel: true,
        }),
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
          message: resJson.error || 'Google Apps Script failed to format and write sheets.',
        };
      }

      const updatedConfig: CloudSyncConfig = {
        ...config,
        lastSyncAt: new Date().toISOString(),
      };
      saveCloudSyncConfig(updatedConfig);

      return {
        success: true,
        message: resJson.message || 'Successfully formatted and synchronized Google Sheet into the 5 clinical tabs matching Excel!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Sync network failure: ${err.message || 'Could not reach Google Sheets Web App.'}`,
      };
    }
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
        'Dar Al Shifa': data.Dar_Al_Shifa || data['Dar Al Shifa'] || [],
        'Saifee Diagnostic Centre': data.Saifee_Diagnostic_Centre || data['Saifee Diagnostic Centre'] || [],
        'OPD_Rooms': data.OPD_Rooms || data['OPD_Rooms'] || [],
        'Dialysis_slots': data.Dialysis_slots || data['Dialysis_slots'] || [],
        'Costs_per_lab': data.Costs_per_lab || data['Costs_per_lab'] || [],
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
        message: `Successfully pulled and merged ${result.auditCounts.patientInvoices} invoices, ${result.auditCounts.opdRoomSlots} OPD room slots, ${result.auditCounts.dialysisSlots} dialysis slots, and ${result.auditCounts.departmentCosts} lab costs from Google Sheets!`,
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
