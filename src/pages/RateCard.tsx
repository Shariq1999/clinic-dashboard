import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import {
  ServiceCatalogItem,
  BranchRateOverride,
  DoctorPayoutModel,
  DepartmentId,
  BranchId,
} from '../types/schema';
import { triggerAutoSync } from '../db/cloudSync';
import { formatINR } from '../utils/formatters';
import {
  Tag,
  Building,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  HelpCircle,
  X,
} from 'lucide-react';

export const RateCard: React.FC = () => {
  const { branchId, setBranchId } = useAppStore();

  // Live data
  const catalog = useLiveQuery(() => db.serviceCatalog.toArray(), []);
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const activeBranchId: BranchId =
    branchId === 'ALL'
      ? (branches && branches.length > 0 ? branches[0].id : 'br_saifee_diag')
      : (branchId as BranchId);

  const overrides = useLiveQuery(
    () => db.rateOverrides.where('branchId').equals(activeBranchId).toArray(),
    [activeBranchId]
  );

  // Master rate card editing state
  const [editingCatalog, setEditingCatalog] = useState<Record<string, ServiceCatalogItem>>({});
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Add Custom Service Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSrvForm, setNewSrvForm] = useState<{
    name: string;
    department: DepartmentId;
    subCategory: string;
    defaultRate: number;
    payoutModel: DoctorPayoutModel;
    defaultRevSharePct: number;
    defaultFixedMonthlyFee: number;
  }>({
    name: '',
    department: 'BLOOD_TEST',
    subCategory: '',
    defaultRate: 500,
    payoutModel: 'NONE',
    defaultRevSharePct: 0,
    defaultFixedMonthlyFee: 0,
  });

  // Overrides editing state
  const [editingOverrides, setEditingOverrides] = useState<Record<string, BranchRateOverride>>({});

  // Sync catalog when loaded
  React.useEffect(() => {
    if (catalog) {
      const map: Record<string, ServiceCatalogItem> = {};
      catalog.forEach((item) => {
        map[item.id] = { ...item };
      });
      setEditingCatalog(map);
    }
  }, [catalog]);

  // Sync overrides when loaded
  React.useEffect(() => {
    if (overrides) {
      const map: Record<string, BranchRateOverride> = {};
      overrides.forEach((item) => {
        map[item.id] = { ...item };
      });
      setEditingOverrides(map);
    }
  }, [overrides]);

  const handleCatalogFieldChange = (
    id: string,
    field: keyof ServiceCatalogItem,
    val: any
  ) => {
    setEditingCatalog((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: val,
      },
    }));
  };

  const handleSaveCatalogRow = async (id: string) => {
    const item = editingCatalog[id];
    if (!item) return;

    await db.serviceCatalog.put(item);
    await db.meta.put({ key: 'isEdited', value: true });
    triggerAutoSync();

    setSaveSuccess(id);
    setTimeout(() => setSaveSuccess(null), 2000);
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the service catalog?`)) {
      await db.serviceCatalog.delete(id);
      await db.meta.put({ key: 'isEdited', value: true });
      triggerAutoSync();
    }
  };

  const handleCreateCustomService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvForm.name.trim()) return;

    const id = `srv_custom_${Date.now()}`;
    const newRecord: ServiceCatalogItem = {
      id,
      name: newSrvForm.name.trim(),
      department: newSrvForm.department,
      subCategory: newSrvForm.subCategory.trim() || undefined,
      defaultRate: Number(newSrvForm.defaultRate) || 0,
      payoutModel: newSrvForm.payoutModel,
      defaultRevSharePct: Number(newSrvForm.defaultRevSharePct) || 0,
      defaultFixedMonthlyFee: Number(newSrvForm.defaultFixedMonthlyFee) || 0,
      isActive: true,
    };

    await db.serviceCatalog.put(newRecord);
    await db.meta.put({ key: 'isEdited', value: true });
    triggerAutoSync();

    setShowAddModal(false);
    setNewSrvForm({
      name: '',
      department: 'BLOOD_TEST',
      subCategory: '',
      defaultRate: 500,
      payoutModel: 'NONE',
      defaultRevSharePct: 0,
      defaultFixedMonthlyFee: 0,
    });
  };

  const handleSaveOverrideRow = async (overrideId: string) => {
    const item = editingOverrides[overrideId];
    if (!item) return;

    await db.rateOverrides.put(item);
    await db.meta.put({ key: 'isEdited', value: true });
    triggerAutoSync();

    setSaveSuccess(overrideId);
    setTimeout(() => setSaveSuccess(null), 2000);
  };

  const handleDeleteOverride = async (overrideId: string) => {
    await db.rateOverrides.delete(overrideId);
    await db.meta.put({ key: 'isEdited', value: true });
    triggerAutoSync();
  };

  const handleAddOverride = async (serviceId: string) => {
    const srv = catalog?.find((s) => s.id === serviceId);
    if (!srv) return;

    const newOverride: BranchRateOverride = {
      id: `${activeBranchId}_${serviceId}`,
      branchId: activeBranchId,
      serviceId,
      overrideRate: srv.defaultRate,
      overridePayoutModel: srv.payoutModel,
      overrideRevSharePct: srv.defaultRevSharePct,
      overrideFixedMonthlyFee: srv.defaultFixedMonthlyFee,
    };

    await db.rateOverrides.put(newOverride);
    await db.meta.put({ key: 'isEdited', value: true });
    triggerAutoSync();
  };

  const activeBranchName = branches?.find((b) => b.id === activeBranchId)?.name;

  return (
    <div className="space-y-8">
      {/* 1. MASTER RATE CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-600" />
              Master Service Catalog & Standard Rate Card
            </h3>
            <p className="text-xs text-slate-500">
              Inline editable baseline pricing and doctor remuneration models applicable across all branches
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Service</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 font-semibold text-slate-700">
                <th className="px-4 py-3">Dept</th>
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Sub-Modality</th>
                <th className="px-4 py-3 text-right w-32">Standard Rate (₹)</th>
                <th className="px-4 py-3 w-40">Payout Model</th>
                <th className="px-4 py-3 text-right w-28">Rev Share %</th>
                <th className="px-4 py-3 text-right w-36">Fixed Fee (₹/Mo)</th>
                <th className="px-4 py-3 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {catalog?.map((item) => {
                const current = editingCatalog[item.id] || item;
                const isSaved = saveSuccess === item.id;
                const model = current.payoutModel || 'NONE';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2 font-semibold text-teal-700">
                      {item.department}
                    </td>
                    <td className="px-4 py-2 font-bold text-slate-900">{item.name}</td>
                    <td className="px-4 py-2 text-slate-500">{item.subCategory || '—'}</td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        value={current.defaultRate}
                        onChange={(e) =>
                          handleCatalogFieldChange(
                            item.id,
                            'defaultRate',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-24 text-right px-2 py-1 border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-teal-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={model}
                        onChange={(e) =>
                          handleCatalogFieldChange(
                            item.id,
                            'payoutModel',
                            e.target.value as DoctorPayoutModel
                          )
                        }
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-medium bg-white"
                      >
                        <option value="NONE">NONE</option>
                        <option value="REVENUE_SHARE">REVENUE_SHARE</option>
                        <option value="FIXED_MONTHLY">FIXED_MONTHLY</option>
                        <option value="HYBRID">HYBRID</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {model === 'REVENUE_SHARE' || model === 'HYBRID' ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={current.defaultRevSharePct}
                          onChange={(e) =>
                            handleCatalogFieldChange(
                              item.id,
                              'defaultRevSharePct',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-20 text-right px-2 py-1 border border-slate-300 rounded font-bold text-slate-900"
                        />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {model === 'FIXED_MONTHLY' || model === 'HYBRID' ? (
                        <input
                          type="number"
                          min="0"
                          value={current.defaultFixedMonthlyFee}
                          onChange={(e) =>
                            handleCatalogFieldChange(
                              item.id,
                              'defaultFixedMonthlyFee',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-28 text-right px-2 py-1 border border-slate-300 rounded font-bold text-slate-900"
                        />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveCatalogRow(item.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700'
                          }`}
                        >
                          {isSaved ? 'Saved ✓' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(item.id, item.name)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. BRANCH RATE OVERRIDES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" />
              Per-Branch Rate & Doctor Payout Overrides
            </h3>
            <p className="text-xs text-slate-500">
              Customize fees or contracts for specific branches without altering master catalog defaults
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Target Branch:</span>
            <select
              value={activeBranchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
            >
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing Overrides Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 font-semibold text-slate-700">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3 text-right">Master Rate</th>
                <th className="px-4 py-3 text-right w-36">Override Rate (₹)</th>
                <th className="px-4 py-3 w-40">Override Payout Model</th>
                <th className="px-4 py-3 text-right w-28">Override Rev %</th>
                <th className="px-4 py-3 text-right w-36">Override Fixed (₹)</th>
                <th className="px-4 py-3 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overrides && overrides.length > 0 ? (
                overrides.map((ov) => {
                  const srv = catalog?.find((s) => s.id === ov.serviceId);
                  const isSaved = saveSuccess === ov.id;
                  const current = editingOverrides[ov.id] || ov;
                  const activeModel = current.overridePayoutModel ?? srv?.payoutModel ?? 'NONE';

                  return (
                    <tr key={ov.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-bold text-slate-900">
                        {srv?.name || ov.serviceId}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-400">
                        {srv ? formatINR(srv.defaultRate) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <input
                          type="number"
                          min="0"
                          value={current.overrideRate ?? ''}
                          onChange={(e) =>
                            setEditingOverrides((prev) => ({
                              ...prev,
                              [ov.id]: {
                                ...prev[ov.id],
                                overrideRate: parseInt(e.target.value, 10) || 0,
                              },
                            }))
                          }
                          className="w-28 text-right px-2 py-1 border border-teal-300 rounded font-bold text-teal-800 bg-teal-50/40"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={activeModel}
                          onChange={(e) =>
                            setEditingOverrides((prev) => ({
                              ...prev,
                              [ov.id]: {
                                ...prev[ov.id],
                                overridePayoutModel: e.target.value as DoctorPayoutModel,
                              },
                            }))
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-medium bg-white"
                        >
                          <option value="NONE">NONE</option>
                          <option value="REVENUE_SHARE">REVENUE_SHARE</option>
                          <option value="FIXED_MONTHLY">FIXED_MONTHLY</option>
                          <option value="HYBRID">HYBRID</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {activeModel === 'REVENUE_SHARE' || activeModel === 'HYBRID' ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={current.overrideRevSharePct ?? ''}
                            onChange={(e) =>
                              setEditingOverrides((prev) => ({
                                ...prev,
                                [ov.id]: {
                                  ...prev[ov.id],
                                  overrideRevSharePct: parseInt(e.target.value, 10) || 0,
                                },
                              }))
                            }
                            className="w-20 text-right px-2 py-1 border border-slate-300 rounded font-bold text-slate-900"
                          />
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {activeModel === 'FIXED_MONTHLY' || activeModel === 'HYBRID' ? (
                          <input
                            type="number"
                            min="0"
                            value={current.overrideFixedMonthlyFee ?? ''}
                            onChange={(e) =>
                              setEditingOverrides((prev) => ({
                                ...prev,
                                [ov.id]: {
                                  ...prev[ov.id],
                                  overrideFixedMonthlyFee: parseInt(e.target.value, 10) || 0,
                                },
                              }))
                            }
                            className="w-28 text-right px-2 py-1 border border-slate-300 rounded font-bold text-slate-900"
                          />
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveOverrideRow(ov.id)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold ${
                            isSaved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white'
                          }`}
                        >
                          {isSaved ? '✓' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOverride(ov.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete override and revert to master"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    No rate overrides defined for {activeBranchName}. All services use master catalog rates.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Add Override Strip */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Add Override for:</span>
            <select
              id="add-override-select"
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-medium text-slate-800"
            >
              {catalog
                ?.filter(
                  (c) => !overrides?.some((ov) => ov.serviceId === c.id)
                )
                .map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} ({srv.department})
                  </option>
                ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('add-override-select') as HTMLSelectElement;
              if (el?.value) handleAddOverride(el.value);
            }}
            className="flex items-center gap-1 text-xs font-semibold bg-white border border-slate-300 hover:border-teal-500 text-slate-700 hover:text-teal-700 px-3 py-1 rounded shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>Create Branch Override</span>
          </button>
        </div>
      </div>

      {/* Add Custom Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-600" />
                Add Custom Clinic Service
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomService} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MRI Brain with Contrast"
                    value={newSrvForm.name}
                    onChange={(e) => setNewSrvForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={newSrvForm.department}
                    onChange={(e) =>
                      setNewSrvForm((p) => ({ ...p, department: e.target.value as DepartmentId }))
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="BLOOD_TEST">Pathology / Blood Test</option>
                    <option value="USG">USG / Ultrasound</option>
                    <option value="XRAY">X-Ray / Radiology</option>
                    <option value="PHYSIO">Physiotherapy</option>
                    <option value="CONSULTATION">Doctor Consultation</option>
                    <option value="DIALYSIS">Dialysis Modality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sub-Modality / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special, Routine, Doppler"
                    value={newSrvForm.subCategory}
                    onChange={(e) => setNewSrvForm((p) => ({ ...p, subCategory: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Standard Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newSrvForm.defaultRate}
                    onChange={(e) =>
                      setNewSrvForm((p) => ({
                        ...p,
                        defaultRate: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Doctor Remuneration Model
                  </label>
                  <select
                    value={newSrvForm.payoutModel}
                    onChange={(e) =>
                      setNewSrvForm((p) => ({
                        ...p,
                        payoutModel: e.target.value as DoctorPayoutModel,
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="NONE">NONE (No Doctor Fee)</option>
                    <option value="REVENUE_SHARE">REVENUE_SHARE (% Fee)</option>
                    <option value="FIXED_MONTHLY">FIXED_MONTHLY (Retainer)</option>
                    <option value="HYBRID">HYBRID (Retainer + %)</option>
                  </select>
                </div>

                {(newSrvForm.payoutModel === 'REVENUE_SHARE' ||
                  newSrvForm.payoutModel === 'HYBRID') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rev Share % (Doctor)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newSrvForm.defaultRevSharePct}
                      onChange={(e) =>
                        setNewSrvForm((p) => ({
                          ...p,
                          defaultRevSharePct: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                )}

                {(newSrvForm.payoutModel === 'FIXED_MONTHLY' ||
                  newSrvForm.payoutModel === 'HYBRID') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fixed Retainer (₹/Month)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newSrvForm.defaultFixedMonthlyFee}
                      onChange={(e) =>
                        setNewSrvForm((p) => ({
                          ...p,
                          defaultFixedMonthlyFee: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
