import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { DialysisCapacityLog, BranchId, Branch } from '../types/schema';
import {
  getCloudSyncConfig,
  saveCloudSyncConfig,
  testConnection,
  pushToCloud,
  pullFromCloud,
  triggerAutoSync,
  CloudSyncConfig,
} from '../db/cloudSync';
import {
  Sliders,
  Plus,
  Trash2,
  Calendar,
  Building,
  Building2,
  CheckCircle,
  AlertCircle,
  History,
  Cloud,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  Key,
  Globe,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  MapPin,
  Check,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const Settings: React.FC = () => {
  const capacityLogs = useLiveQuery(() => db.capacityLogs.toArray(), []);
  const branches = useLiveQuery(() => db.branches.toArray(), []);

  // ----------------------------------------------------
  // 1. CLOUD SYNC STATE
  // ----------------------------------------------------
  const [cloudConfig, setCloudConfig] = useState<CloudSyncConfig>(() => getCloudSyncConfig());
  const [syncStatus, setSyncStatus] = useState<{
    type: 'idle' | 'testing' | 'pushing' | 'pulling' | 'success' | 'error';
    text: string;
  }>({ type: 'idle', text: '' });

  const handleUpdateConfig = (patch: Partial<CloudSyncConfig>) => {
    const updated = { ...cloudConfig, ...patch };
    setCloudConfig(updated);
    saveCloudSyncConfig(updated);
  };

  const handleTestCloudConnection = async () => {
    setSyncStatus({ type: 'testing', text: 'Testing cloud connection...' });
    const res = await testConnection();
    setSyncStatus({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const handlePushCloud = async () => {
    setSyncStatus({ type: 'pushing', text: 'Uploading local IndexedDB snapshot to cloud...' });
    const res = await pushToCloud();
    if (res.success) {
      const refreshed = getCloudSyncConfig();
      setCloudConfig(refreshed);
      setSyncStatus({ type: 'success', text: res.message });
    } else {
      setSyncStatus({ type: 'error', text: res.message });
    }
  };

  const handlePullCloud = async () => {
    const proceed = window.confirm(
      'Warning: Pulling from cloud will replace the local browser database with the remote snapshot. Unsynced local edits will be overwritten. Proceed?'
    );
    if (!proceed) return;

    setSyncStatus({ type: 'pulling', text: 'Fetching and restoring snapshot from cloud...' });
    const res = await pullFromCloud();
    if (res.success) {
      const refreshed = getCloudSyncConfig();
      setCloudConfig(refreshed);
      setSyncStatus({ type: 'success', text: `${res.message} Reloading data...` });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      setSyncStatus({ type: 'error', text: res.message });
    }
  };

  // ----------------------------------------------------
  // 2. BRANCH MANAGEMENT STATE
  // ----------------------------------------------------
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({
    code: '',
    name: '',
    location: '',
    sundayOpen: false,
  });
  const [branchStatusMsg, setBranchStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim() || !newBranch.code.trim()) {
      setBranchStatusMsg({ type: 'error', text: 'Branch name and code are required.' });
      return;
    }

    const cleanCode = newBranch.code.trim().toUpperCase();
    const id: BranchId = `br_${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;

    const branchRecord: Branch = {
      id,
      code: cleanCode,
      name: newBranch.name.trim(),
      location: newBranch.location.trim() || 'Mumbai, Maharashtra',
      isActive: true,
      sundayOpen: newBranch.sundayOpen,
    };

    // Baseline capacity for the new branch so it's functional immediately
    const baselineCapacity: DialysisCapacityLog = {
      id: `${id}_2026-04-01`,
      branchId: id,
      effectiveFrom: '2026-04-01',
      machineCount: 4,
      slotsPerMachine: 2,
      note: 'Initial baseline machine fleet for branch onboarding',
    };

    try {
      await db.transaction('rw', [db.branches, db.capacityLogs, db.meta], async () => {
        await db.branches.put(branchRecord);
        await db.capacityLogs.put(baselineCapacity);
        await db.meta.put({ key: 'isEdited', value: true });
      });

      triggerAutoSync();

      setBranchStatusMsg({
        type: 'success',
        text: `Successfully added new branch: ${branchRecord.name} (${branchRecord.code})!`,
      });
      setNewBranch({ code: '', name: '', location: '', sundayOpen: false });
      setShowAddBranch(false);
      setTimeout(() => setBranchStatusMsg(null), 3500);
    } catch (err: any) {
      setBranchStatusMsg({ type: 'error', text: err?.message || 'Failed to add branch.' });
    }
  };

  const handleToggleBranchActive = async (b: Branch) => {
    const updated: Branch = { ...b, isActive: !b.isActive };
    await db.branches.put(updated);
    await db.meta.put({ key: 'isEdited', value: true });
    triggerAutoSync();
  };

  const handleToggleBranchSunday = async (b: Branch) => {
    const updated: Branch = { ...b, sundayOpen: !b.sundayOpen };
    await db.branches.put(updated);
    await db.meta.put({ key: 'isEdited', value: true });
    triggerAutoSync();
  };

  // ----------------------------------------------------
  // 3. CAPACITY VERSIONING FORM STATE
  // ----------------------------------------------------
  const [capacityBranchId, setCapacityBranchId] = useState<BranchId>('br_dar_ul_shifa');
  const [effectiveFrom, setEffectiveFrom] = useState('2026-10-01');
  const [machineCount, setMachineCount] = useState<number>(6);
  const [slotsPerMachine, setSlotsPerMachine] = useState<number>(2);
  const [note, setNote] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync capacityBranchId to first branch when loaded if default isn't present
  React.useEffect(() => {
    if (branches && branches.length > 0) {
      if (!branches.some((b) => b.id === capacityBranchId)) {
        setCapacityBranchId(branches[0].id);
      }
    }
  }, [branches, capacityBranchId]);

  const sortedLogs = React.useMemo(() => {
    if (!capacityLogs) return [];
    return [...capacityLogs].sort((a, b) => {
      if (a.branchId !== b.branchId) return a.branchId.localeCompare(b.branchId);
      return a.effectiveFrom.localeCompare(b.effectiveFrom);
    });
  }, [capacityLogs]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveFrom) {
      setStatusMsg({ type: 'error', text: 'Please choose an effective date.' });
      return;
    }

    const id = `${capacityBranchId}_${effectiveFrom}`;
    const logRecord: DialysisCapacityLog = {
      id,
      branchId: capacityBranchId,
      effectiveFrom,
      machineCount: Number(machineCount),
      slotsPerMachine: Number(slotsPerMachine),
      note: note.trim() || 'Capacity update',
    };

    try {
      await db.capacityLogs.put(logRecord);
      await db.meta.put({ key: 'isEdited', value: true });
      triggerAutoSync();

      setStatusMsg({
        type: 'success',
        text: `Successfully logged new capacity (${machineCount} machines × ${slotsPerMachine} shifts) effective from ${effectiveFrom}!`,
      });
      setNote('');
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to save capacity record.' });
    }
  };

  const handleDeleteLog = async (id: string) => {
    await db.capacityLogs.delete(id);
    await db.meta.put({ key: 'isEdited', value: true });
    triggerAutoSync();
  };

  return (
    <div className="space-y-8">
      {/* ==================================================== */}
      {/* 1. ZERO-COST CLOUD SYNC & MULTI-DEVICE BACKUP        */}
      {/* ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Zero-Cost Cloud Sync & Multi-Device Backup
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Free
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct browser-to-cloud synchronization using GitHub Gist or Supabase REST APIs. No server required.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Last Synced:</span>
            <span className="font-semibold text-slate-700">
              {cloudConfig.lastSyncAt
                ? format(parseISO(cloudConfig.lastSyncAt), 'dd MMM yyyy, HH:mm:ss')
                : 'Never'}
            </span>
          </div>
        </div>

        {/* Sync Status Feedback Banner */}
        {syncStatus.text && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              syncStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : syncStatus.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-teal-50 text-teal-800 border border-teal-200 animate-pulse'
            }`}
          >
            {syncStatus.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
            {syncStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {(syncStatus.type === 'testing' ||
              syncStatus.type === 'pushing' ||
              syncStatus.type === 'pulling') && (
              <RefreshCw className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
            )}
            <span>{syncStatus.text}</span>
          </div>
        )}

        {/* Provider Selector Tabs */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Storage Provider:
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleUpdateConfig({ provider: 'gist' })}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  cloudConfig.provider === 'gist'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                GitHub Gist (Recommended)
              </button>
              <button
                type="button"
                onClick={() => handleUpdateConfig({ provider: 'supabase' })}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  cloudConfig.provider === 'supabase'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Supabase Free Tier (REST)
              </button>
            </div>
          </div>

          {/* GitHub Gist Configuration */}
          {cloudConfig.provider === 'gist' && (
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    GitHub Personal Access Token (classic or fine-grained) *
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={cloudConfig.githubToken || ''}
                    onChange={(e) => handleUpdateConfig({ githubToken: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Must have <code className="text-teal-700 font-semibold">gist</code> scope. Stored strictly in your browser's localStorage.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Target Gist ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty to auto-create on first push"
                    value={cloudConfig.gistId || ''}
                    onChange={(e) => handleUpdateConfig({ gistId: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Auto-populated upon first push. Paste an existing Gist ID to restore or sync from another computer.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Supabase Configuration */}
          {cloudConfig.provider === 'supabase' && (
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Supabase Project URL *
                  </label>
                  <input
                    type="text"
                    placeholder="https://xyzproject.supabase.co"
                    value={cloudConfig.supabaseUrl || ''}
                    onChange={(e) => handleUpdateConfig({ supabaseUrl: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    Supabase Anon Public Key *
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={cloudConfig.supabaseAnonKey || ''}
                    onChange={(e) => handleUpdateConfig({ supabaseAnonKey: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Snapshots are stored in bucket <code className="text-teal-700 font-semibold">clinic-backups</code>.
              </span>
            </div>
          )}

          {/* Action Buttons & Auto-Sync Switch */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={cloudConfig.autoSync}
                onChange={(e) => handleUpdateConfig({ autoSync: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">
                Auto-sync changes to cloud (Debounced 5s on save)
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestCloudConnection}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Test Connection</span>
              </button>

              <button
                type="button"
                onClick={handlePushCloud}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Push to Cloud</span>
              </button>

              <button
                type="button"
                onClick={handlePullCloud}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Pull from Cloud</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. BRANCH NETWORK MANAGEMENT                         */}
      {/* ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Branch Network & Clinic Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic clinic entities: All reports, filters, and capacity allocations reflect these branches.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddBranch(!showAddBranch)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddBranch ? 'Cancel' : 'Add New Branch'}</span>
          </button>
        </div>

        {branchStatusMsg && (
          <div
            className={`mx-5 mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              branchStatusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {branchStatusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{branchStatusMsg.text}</span>
          </div>
        )}

        {/* Add Branch Inline Form */}
        {showAddBranch && (
          <form
            onSubmit={handleCreateBranch}
            className="m-5 p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-4"
          >
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-700" />
              Register New Clinic Branch
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Noor Hospital Clinic"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch Code (3-4 chars) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. NHC"
                  value={newBranch.code}
                  onChange={(e) => setNewBranch((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Byculla, Mumbai"
                  value={newBranch.location}
                  onChange={(e) => setNewBranch((p) => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newBranch.sundayOpen}
                    onChange={(e) => setNewBranch((p) => ({ ...p, sundayOpen: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 cursor-pointer"
                  />
                  <span>Sunday Open (Dialysis)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBranch(false)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Register & Initialize Capacity
              </button>
            </div>
          </form>
        )}

        {/* Branches Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 font-semibold text-slate-700">
                <th className="px-5 py-3">Branch Name</th>
                <th className="px-5 py-3 text-center">Code</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3 text-center">Sunday Working</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches?.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-teal-600" />
                    <span>{b.name}</span>
                  </td>
                  <td className="px-5 py-3 text-center font-bold text-teal-700">
                    <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
                      {b.code}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.location}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleBranchSunday(b)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer border ${
                        b.sundayOpen
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title="Click to toggle Sunday operating status"
                    >
                      {b.sundayOpen ? 'Open on Sundays' : 'Closed on Sundays'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleBranchActive(b)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer border ${
                        b.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {b.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {b.id}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. DIALYSIS CAPACITY VERSIONING & MACHINE FLEET     */}
      {/* ==================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Dialysis Machine & Shift Capacity Versioning
            </h3>
            <p className="text-xs text-slate-500">
              Retroactive capacity preservation: Historical dates always calculate against the exact capacity record active at that time.
            </p>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleAddLog} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Branch</label>
            <select
              value={capacityBranchId}
              onChange={(e) => setCapacityBranchId(e.target.value as BranchId)}
              className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white cursor-pointer"
            >
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Effective From Date</label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Active Machines Count
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={machineCount}
              onChange={(e) => setMachineCount(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Slots / Shifts Per Machine
            </label>
            <input
              type="number"
              min="1"
              max="4"
              value={slotsPerMachine}
              onChange={(e) => setSlotsPerMachine(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-5 flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reason / Clinical Audit Note
              </label>
              <input
                type="text"
                placeholder="e.g. Procured 2 additional Fresenius 4008S machines for morning shift"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors shrink-0 cursor-pointer"
            >
              Commit Capacity Record
            </button>
          </div>
        </form>
      </div>

      {/* Historical Capacity Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Chronological Capacity Audit Trail
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Sorted by branch & effective date
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Effective Date</th>
                <th className="px-4 py-3 text-center">Machines</th>
                <th className="px-4 py-3 text-center">Shifts/Machine</th>
                <th className="px-4 py-3 text-center font-bold text-teal-700">Daily Slots</th>
                <th className="px-4 py-3">Audit Note</th>
                <th className="px-4 py-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedLogs.map((log) => {
                const brName = branches?.find((b) => b.id === log.branchId)?.name || log.branchId;
                const isBaseline = log.effectiveFrom === '2026-04-01';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">{brName}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {format(parseISO(log.effectiveFrom), 'dd MMMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                      {log.machineCount}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                      {log.slotsPerMachine}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-teal-700">
                      {log.machineCount * log.slotsPerMachine} slots/day
                    </td>
                    <td className="px-4 py-3 text-slate-600">{log.note}</td>
                    <td className="px-4 py-3 text-center">
                      {!isBaseline ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          title="Delete capacity entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Baseline
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
