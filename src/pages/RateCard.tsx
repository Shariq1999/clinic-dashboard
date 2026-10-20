import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import {
  ServiceCatalogItem,
  BranchRateOverride,
  DoctorPayoutModel,
  BranchId,
} from '../types/schema';
import { formatINR } from '../utils/formatters';
import {
  Tag,
  Building,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';

export const RateCard: React.FC = () => {
  const { branchId, setBranchId } = useAppStore();

  const activeBranchId: BranchId =
    branchId === 'ALL' ? 'br_saifee_diag' : (branchId as BranchId);

  // Live data
  const catalog = useLiveQuery(() => db.serviceCatalog.toArray(), []);
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const overrides = useLiveQuery(
    () => db.rateOverrides.where('branchId').equals(activeBranchId).toArray(),
    [activeBranchId]
  );

  // Master rate card editing state
  const [editingCatalog, setEditingCatalog] = useState<Record<string, ServiceCatalogItem>>({});
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

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

    setSaveSuccess(id);
    setTimeout(() => setSaveSuccess(null), 2000);
  };

  const handleSaveOverrideRow = async (overrideId: string) => {
    const item = editingOverrides[overrideId];
    if (!item) return;

    await db.rateOverrides.put(item);
    await db.meta.put({ key: 'isEdited', value: true });

    setSaveSuccess(overrideId);
    setTimeout(() => setSaveSuccess(null), 2000);
  };

  const handleDeleteOverride = async (overrideId: string) => {
    await db.rateOverrides.delete(overrideId);
    await db.meta.put({ key: 'isEdited', value: true });
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
  };

  const activeBranchName = branches?.find((b) => b.id === activeBranchId)?.name;

  return (
    <div className="space-y-8">
      {/* 1. MASTER RATE CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-600" />
              Master Service Catalog & Standard Rate Card
            </h3>
            <p className="text-xs text-slate-500">
              Inline editable baseline pricing and doctor remuneration models applicable across all branches
            </p>
          </div>
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
                const isConsult = item.department === 'CONSULTATION';

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
                      {isConsult ? (
                        <select
                          value={current.payoutModel}
                          onChange={(e) =>
                            handleCatalogFieldChange(
                              item.id,
                              'payoutModel',
                              e.target.value as DoctorPayoutModel
                            )
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-medium"
                        >
                          <option value="NONE">NONE</option>
                          <option value="REVENUE_SHARE">REVENUE_SHARE</option>
                          <option value="FIXED_MONTHLY">FIXED_MONTHLY</option>
                          <option value="HYBRID">HYBRID</option>
                        </select>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {isConsult &&
                      (current.payoutModel === 'REVENUE_SHARE' ||
                        current.payoutModel === 'HYBRID') ? (
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
                      {isConsult &&
                      (current.payoutModel === 'FIXED_MONTHLY' ||
                        current.payoutModel === 'HYBRID') ? (
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
                      <button
                        type="button"
                        onClick={() => handleSaveCatalogRow(item.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          isSaved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700'
                        }`}
                      >
                        {isSaved ? 'Saved ✓' : 'Save'}
                      </button>
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
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              <option value="br_saifee_diag">🔬 Saifee Diagnostics Center (SDC)</option>
              <option value="br_dar_ul_shifa">🏥 Dar ul Shifa (DUS)</option>
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
                  const isConsult = srv?.department === 'CONSULTATION';

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
                        {isConsult ? (
                          <select
                            value={current.overridePayoutModel ?? srv?.payoutModel}
                            onChange={(e) =>
                              setEditingOverrides((prev) => ({
                                ...prev,
                                [ov.id]: {
                                  ...prev[ov.id],
                                  overridePayoutModel: e.target.value as DoctorPayoutModel,
                                },
                              }))
                            }
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-medium"
                          >
                            <option value="NONE">NONE</option>
                            <option value="REVENUE_SHARE">REVENUE_SHARE</option>
                            <option value="FIXED_MONTHLY">FIXED_MONTHLY</option>
                            <option value="HYBRID">HYBRID</option>
                          </select>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {isConsult ? (
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
                        {isConsult ? (
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
            className="flex items-center gap-1 text-xs font-semibold bg-white border border-slate-300 hover:border-teal-500 text-slate-700 hover:text-teal-700 px-3 py-1 rounded shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>Create Branch Override</span>
          </button>
        </div>
      </div>
    </div>
  );
};
