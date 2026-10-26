import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { resolveDailyCapacity } from '../engine/financialEngine';
import { formatINR, formatPct } from '../utils/formatters';
import {
  DialysisSlotRecord,
  DialysisSlotType,
  BranchId,
  DepartmentId,
  DEPARTMENT_NAMES,
} from '../types/schema';
import { triggerAutoSync } from '../db/cloudSync';
import {
  parseISO,
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Calendar,
  Layers,
  Lock,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const Dialysis: React.FC = () => {
  const { branchId, setBranchId, department, setDepartment } = useAppStore();

  // Month navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date('2026-04-01T00:00:00'));

  // Live data
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const capacityLogs = useLiveQuery(() => db.capacityLogs.toArray(), []);

  // If ALL branches selected globally, default to first available branch
  const activeBranchId: BranchId =
    branchId === 'ALL'
      ? (branches && branches.length > 0 ? branches[0].id : 'br_dar_ul_shifa')
      : (branchId as BranchId);
  const slots = useLiveQuery(
    () =>
      db.dialysisSlots
        .where('branchId')
        .equals(activeBranchId)
        .toArray(),
    [activeBranchId]
  );

  const activeBranch = branches?.find((b) => b.id === activeBranchId);

  // Generate days in the current selected month
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(currentMonthDate);
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);

  // Lookup map of existing slot records: key = `${date}_M${machine}_S${slot}`
  const slotMap = useMemo(() => {
    const map = new Map<string, DialysisSlotRecord>();
    if (slots) {
      slots.forEach((s) => {
        map.set(`${s.date}_M${s.machineIndex}_S${s.slotIndex}`, s);
      });
    }
    return map;
  }, [slots]);

  // Max machines and slots in this month based on capacity logs
  const monthCapacityInfo = useMemo(() => {
    if (!capacityLogs) return { machineCount: 4, slotsPerMachine: 2, dailySlots: 8 };
    const dateStr = format(monthStart, 'yyyy-MM-dd');
    return resolveDailyCapacity(activeBranchId, dateStr, capacityLogs);
  }, [activeBranchId, monthStart, capacityLogs]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    let workingDays = 0;
    let totalCapSlots = 0;
    let bookedSlots = 0;
    let totalRev = 0;

    daysInMonth.forEach((dayObj) => {
      const isSun = getDay(dayObj) === 0;
      if (isSun) return; // Strict exclusion of Sunday

      workingDays++;
      const dateStr = format(dayObj, 'yyyy-MM-dd');
      const cap = capacityLogs
        ? resolveDailyCapacity(activeBranchId, dateStr, capacityLogs)
        : { dailySlots: 8 };

      totalCapSlots += cap.dailySlots;

      // Count booked
      if (slots) {
        slots.forEach((s) => {
          if (s.date === dateStr && s.isOccupied) {
            bookedSlots++;
            totalRev += s.appliedRate || 1800;
          }
        });
      }
    });

    const occPct = totalCapSlots > 0 ? (bookedSlots / totalCapSlots) * 100 : 0;
    return { workingDays, totalCapSlots, bookedSlots, totalRev, occPct };
  }, [daysInMonth, capacityLogs, activeBranchId, slots]);

  // Handle click-to-toggle
  const handleToggleSlot = async (
    dateStr: string,
    machineIndex: number,
    slotIndex: number,
    isSunday: boolean
  ) => {
    if (isSunday) return; // Sunday is locked!

    const slotKey = `${dateStr}_M${machineIndex}_S${slotIndex}`;
    const id = `${activeBranchId}_${slotKey}`;
    const existing = slotMap.get(slotKey);

    const isOccupied = existing ? !existing.isOccupied : true;
    const slotRecord: DialysisSlotRecord = {
      id,
      branchId: activeBranchId,
      date: dateStr,
      machineIndex,
      slotIndex,
      isOccupied,
      slotType: existing?.slotType ?? 'STANDARD',
      appliedRate: existing?.appliedRate ?? 1800,
    };

    await db.dialysisSlots.put(slotRecord);
    await db.meta.put({ key: 'isEdited', value: true });
    triggerAutoSync();
  };

  return (
    <div className="space-y-6">
      {/* Department Context Notice */}
      {department !== 'ALL' && department !== 'DIALYSIS' && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-sky-900 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0"></span>
            <span>
              Global department filter is currently set to <strong>{DEPARTMENT_NAMES[department as DepartmentId] || department}</strong>. The Dialysis grid exclusively schedules Dialysis machine shifts.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDepartment('DIALYSIS')}
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-sky-300 text-sky-800 hover:bg-sky-100 transition-colors cursor-pointer"
            >
              Switch filter to Dialysis
            </button>
            <button
              type="button"
              onClick={() => setDepartment('ALL')}
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition-colors cursor-pointer"
            >
              Reset to All
            </button>
          </div>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Branch Selector (Single branch focus for grid) */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Branch Grid:
          </span>
          <select
            value={activeBranchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
          >
            {branches?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400">
            Active Baseline: {monthCapacityInfo.machineCount} Machines × {monthCapacityInfo.slotsPerMachine} Shifts/day
          </span>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonthDate(subMonths(currentMonthDate, 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-bold text-slate-800">
              {format(currentMonthDate, 'MMMM yyyy')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentMonthDate(addMonths(currentMonthDate, 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monthly Occupancy KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Working Days</span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {monthlyStats.workingDays}{' '}
            <span className="text-xs font-normal text-slate-400">(Mon–Sat)</span>
          </p>
          <span className="text-[11px] text-teal-600 font-medium">Sundays excluded</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Capacity</span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {monthlyStats.totalCapSlots}{' '}
            <span className="text-xs font-normal text-slate-400">slots</span>
          </p>
          <span className="text-[11px] text-slate-500">
            ~{monthCapacityInfo.dailySlots} slots/working day
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Booked / Occupied</span>
          <p className="text-xl font-bold text-teal-700 mt-1">
            {monthlyStats.bookedSlots}{' '}
            <span className="text-xs font-normal text-slate-400">sessions</span>
          </p>
          <span className="text-[11px] text-slate-500">
            {monthlyStats.totalCapSlots - monthlyStats.bookedSlots} available
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Occupancy Rate</span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {formatPct(monthlyStats.occPct, false)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-teal-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, monthlyStats.occPct)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Dialysis Revenue</span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {formatINR(monthlyStats.totalRev, true)}
          </p>
          <span className="text-[11px] text-slate-500">@ ₹1,800/session</span>
        </div>
      </div>

      {/* Grid Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-sm bg-teal-600 inline-block shadow-xs"></span>
            <span className="font-medium text-slate-800">Occupied (Booked)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-sm bg-white border border-slate-300 inline-block"></span>
            <span className="font-medium text-slate-700">Available (Click to book)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-sm bg-slate-200 border border-slate-300 inline-block"></span>
            <span className="font-medium text-slate-500">Sunday — Closed (Locked)</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Click any Monday–Saturday slot to toggle occupancy in real time</span>
        </div>
      </div>

      {/* Interactive Matrix Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
                <th className="sticky left-0 z-20 bg-slate-100 px-3 py-2.5 text-left font-bold text-slate-900 w-36 border-r border-slate-200">
                  Machine & Shift
                </th>
                {daysInMonth.map((dayObj) => {
                  const dayNum = format(dayObj, 'd');
                  const dayName = format(dayObj, 'EEE');
                  const isSun = getDay(dayObj) === 0;

                  return (
                    <th
                      key={dayNum}
                      className={`px-1.5 py-2 text-center font-semibold min-w-[34px] border-r border-slate-200 ${
                        isSun
                          ? 'bg-slate-200/90 text-slate-500'
                          : 'bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold tracking-tighter">
                        {dayName}
                      </div>
                      <div className="text-xs font-bold leading-none mt-0.5">{dayNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Generate rows for Machine 1..N and Slot 1..M */}
              {Array.from({ length: monthCapacityInfo.machineCount }).map((_, mIdx) => {
                const mNum = mIdx + 1;
                return (
                  <React.Fragment key={`machine_${mNum}`}>
                    {Array.from({ length: monthCapacityInfo.slotsPerMachine }).map((__, sIdx) => {
                      const sNum = sIdx + 1;
                      const shiftLabel = sNum === 1 ? 'Morning' : sNum === 2 ? 'Afternoon' : 'Evening';

                      return (
                        <tr
                          key={`row_m${mNum}_s${sNum}`}
                          className="border-b border-slate-200 hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium text-slate-800 border-r border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900">M{mNum}</span>
                              <span className="text-[11px] text-slate-500 ml-1.5">
                                Shift {sNum} ({shiftLabel})
                              </span>
                            </div>
                          </td>

                          {daysInMonth.map((dayObj) => {
                            const dateStr = format(dayObj, 'yyyy-MM-dd');
                            const isSun = getDay(dayObj) === 0;
                            const slotKey = `${dateStr}_M${mNum}_S${sNum}`;
                            const slot = slotMap.get(slotKey);
                            const isOccupied = slot?.isOccupied ?? false;

                            if (isSun) {
                              return (
                                <td
                                  key={dateStr}
                                  className="p-1 text-center bg-slate-100/90 border-r border-slate-200"
                                  title="Sunday - Facility Closed (Non-Working Day)"
                                >
                                  <div className="w-full h-7 rounded-sm flex items-center justify-center text-[9px] text-slate-400 font-bold select-none cursor-not-allowed">
                                    <Lock className="w-3 h-3 text-slate-300" />
                                  </div>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={dateStr}
                                className="p-1 text-center border-r border-slate-200 cursor-pointer"
                                onClick={() => handleToggleSlot(dateStr, mNum, sNum, isSun)}
                              >
                                <button
                                  type="button"
                                  className={`w-full h-7 rounded-sm flex items-center justify-center font-bold text-[10px] transition-all transform active:scale-95 shadow-xs ${
                                    isOccupied
                                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-900/10'
                                      : 'bg-white hover:bg-slate-100 text-slate-400 border border-slate-200 hover:border-slate-300'
                                  }`}
                                  title={`Machine ${mNum}, Shift ${sNum} on ${dateStr} - ${
                                    isOccupied ? 'Occupied (Click to free)' : 'Available (Click to book)'
                                  }`}
                                >
                                  {isOccupied ? '✓' : ''}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
