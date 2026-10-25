import { db } from './database';
import { BackupPayload } from '../types/schema';

export interface CloudSyncConfig {
  provider: 'gist' | 'supabase';
  autoSync: boolean;
  lastSyncAt?: string;
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
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse cloud sync config:', err);
  }
  return {
    provider: 'gist',
    autoSync: false,
  };
}

export function saveCloudSyncConfig(config: CloudSyncConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// 0. TEST connection to configured cloud provider
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  const config = getCloudSyncConfig();

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
          message: `GitHub authentication failed (${res.status}): Please check token permissions (must have 'gist' scope).`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Network error: ${err.message || 'Could not reach api.github.com'}`,
      };
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
        return {
          success: true,
          message: 'Connected successfully to Supabase Storage!',
        };
      } else {
        return {
          success: false,
          message: `Supabase returned status ${res.status}. Check URL, Anon Key, and ensure Storage is enabled.`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Network error: ${err.message || 'Could not connect to Supabase'}`,
      };
    }
  }

  return { success: false, message: 'Unsupported provider.' };
}

// 1. PUSH local IndexedDB state to free cloud
export async function pushToCloud(): Promise<{ success: boolean; message: string; gistId?: string }> {
  const config = getCloudSyncConfig();
  const backupJson = await db.exportToJsonBackup();

  if (config.provider === 'gist') {
    if (!config.githubToken?.trim()) {
      return { success: false, message: 'GitHub Personal Access Token is required for Gist sync.' };
    }

    const payload = {
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
        body: JSON.stringify(payload),
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

      // Update config with the gist ID and sync timestamp
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

    let baseUrl = config.supabaseUrl.trim().replace(/\/$/, '');
    const storageUrl = `${baseUrl}/storage/v1/object/clinic-backups/clinic-chain-state.json`;

    try {
      // Upsert file to Supabase storage bucket "clinic-backups"
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
          message: `Supabase Storage error (${res.status}): Make sure 'clinic-backups' bucket exists and is public or allows authenticated uploads. Details: ${errText.slice(0, 120)}`,
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

// 2. PULL cloud state and restore into local IndexedDB
export async function pullFromCloud(): Promise<{ success: boolean; message: string }> {
  const config = getCloudSyncConfig();

  if (config.provider === 'gist') {
    if (!config.gistId?.trim()) {
      return { success: false, message: 'Gist ID is missing. Push first or paste an existing Gist ID.' };
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
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

      await db.restoreFromJsonBackup(fileObj.content);

      const updatedConfig: CloudSyncConfig = {
        ...config,
        lastSyncAt: new Date().toISOString(),
      };
      saveCloudSyncConfig(updatedConfig);

      return { success: true, message: 'Successfully pulled and restored state from GitHub Gist!' };
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
      await db.restoreFromJsonBackup(jsonText);

      const updatedConfig: CloudSyncConfig = {
        ...config,
        lastSyncAt: new Date().toISOString(),
      };
      saveCloudSyncConfig(updatedConfig);

      return { success: true, message: 'Successfully restored state from Supabase Cloud!' };
    } catch (err: any) {
      return { success: false, message: `Supabase pull error: ${err.message || 'Network error'}` };
    }
  }

  return { success: false, message: 'Unsupported cloud provider.' };
}

// 3. Auto-sync hook on data modifications
let autoSyncTimeout: any = null;
export function triggerAutoSync(): void {
  const config = getCloudSyncConfig();
  if (!config.autoSync) return;

  // Debounce auto-sync by 5 seconds
  if (autoSyncTimeout) clearTimeout(autoSyncTimeout);
  autoSyncTimeout = setTimeout(async () => {
    try {
      console.log('[CloudSync] Auto-syncing state to cloud...');
      await pushToCloud();
    } catch (err) {
      console.warn('[CloudSync] Auto-sync error:', err);
    }
  }, 5000);
}
