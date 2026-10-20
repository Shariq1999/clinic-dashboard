import {
  Branch,
  DialysisCapacityLog,
  DialysisSlotRecord,
  DailyDepartmentEntry,
  MonthlyCostRecord,
  ServiceCatalogItem,
  BranchRateOverride,
  DepartmentId,
} from '../types/schema';
import {
  eachDayOfInterval,
  parseISO,
  format,
  getDay,
  getDaysInMonth,
  subDays,
  differenceInCalendarDays,
} from 'date-fns';

export interface FilterContext {
  branchId: 'ALL' | string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  department: 'ALL' | DepartmentId;
}

// 1. Resolve historical capacity for a branch on a specific date
export function resolveDailyCapacity(
  branchId: string,
  dateStr: string,
  capacityLogs: DialysisCapacityLog[]
): { machineCount: number; slotsPerMachine: number; dailySlots: number } {
  const matching = capacityLogs
    .filter((l) => l.branchId === branchId && l.effectiveFrom <= dateStr)
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));

  if (matching.length === 0) {
    // Fallback to earliest log for that branch or 4x2 default
    const earliest = capacityLogs
      .filter((l) => l.branchId === branchId)
      .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))[0];
    const m = earliest?.machineCount ?? 4;
    const s = earliest?.slotsPerMachine ?? 2;
    return { machineCount: m, slotsPerMachine: s, dailySlots: m * s };
  }
  const latest = matching[matching.length - 1];
  return {
    machineCount: latest.machineCount,
    slotsPerMachine: latest.slotsPerMachine,
    dailySlots: latest.machineCount * latest.slotsPerMachine,
  };
}

// 2. Compute Period Metrics (Revenue, Footfall, Sunday-Excluded Occupancy, OPEX + Doctor Payouts)
export function computePeriodMetrics(
  ctx: FilterContext,
  branches: Branch[],
  capacityLogs: DialysisCapacityLog[],
  dialysisSlots: DialysisSlotRecord[],
  dailyEntries: DailyDepartmentEntry[],
  monthlyCosts: MonthlyCostRecord[],
  catalog: ServiceCatalogItem[],
  overrides: BranchRateOverride[]
) {
  const activeBranches =
    ctx.branchId === 'ALL' ? branches : branches.filter((b) => b.id === ctx.branchId);
  const activeBranchIds = new Set(activeBranches.map((b) => b.id));

  const days = eachDayOfInterval({
    start: parseISO(ctx.startDate),
    end: parseISO(ctx.endDate),
  });

  // A. Available Dialysis Capacity (Skipping Sundays where getDay === 0)
  let totalAvailableSlots = 0;
  days.forEach((d) => {
    if (getDay(d) === 0) return; // Exclude Sunday from denominator
    const dStr = format(d, 'yyyy-MM-dd');
    activeBranches.forEach((b) => {
      totalAvailableSlots += resolveDailyCapacity(b.id, dStr, capacityLogs).dailySlots;
    });
  });

  // B. Occupied Dialysis Slots & Dialysis Revenue
  const includeDialysis = ctx.department === 'ALL' || ctx.department === 'DIALYSIS';
  const filteredSlots = includeDialysis
    ? dialysisSlots.filter(
        (s) =>
          activeBranchIds.has(s.branchId) &&
          s.date >= ctx.startDate &&
          s.date <= ctx.endDate &&
          getDay(parseISO(s.date)) !== 0 &&
          s.isOccupied
      )
    : [];

  const dialysisFootfall = filteredSlots.length;
  const dialysisRevenue = filteredSlots.reduce((sum, s) => sum + s.appliedRate, 0);
  const dialysisOccupancyPct =
    totalAvailableSlots > 0 ? (dialysisFootfall / totalAvailableSlots) * 100 : 0;

  // C. Non-Dialysis Department Revenue, Footfall & Variable Doctor Payouts
  const filteredEntries = dailyEntries.filter(
    (e) =>
      activeBranchIds.has(e.branchId) &&
      e.date >= ctx.startDate &&
      e.date <= ctx.endDate &&
      (ctx.department === 'ALL' || e.department === ctx.department)
  );

  const deptFootfall = filteredEntries.reduce((sum, e) => sum + e.patientCount, 0);
  const deptRevenue = filteredEntries.reduce((sum, e) => sum + e.revenue, 0);
  const variableDoctorPayout = filteredEntries.reduce(
    (sum, e) => sum + (e.doctorVariablePayout || 0),
    0
  );

  // D. Pro-rated Monthly OPEX + Pro-rated Fixed Monthly Doctor Retainers
  let proRatedOpex = 0;
  let proRatedFixedDoctorFee = 0;

  // Calculate fixed monthly doctor retainers per branch
  const consultServices = catalog.filter((c) => c.department === 'CONSULTATION');
  const branchMonthlyFixedDocMap = new Map<string, number>();
  activeBranches.forEach((b) => {
    let monthlyFixed = 0;
    consultServices.forEach((srv) => {
      const ov = overrides.find((o) => o.branchId === b.id && o.serviceId === srv.id);
      const model = ov?.overridePayoutModel ?? srv.payoutModel;
      const fixedFee = ov?.overrideFixedMonthlyFee ?? srv.defaultFixedMonthlyFee;
      if (model === 'FIXED_MONTHLY' || model === 'HYBRID') {
        monthlyFixed += fixedFee;
      }
    });
    branchMonthlyFixedDocMap.set(b.id, monthlyFixed);
  });

  days.forEach((d) => {
    const ym = format(d, 'yyyy-MM');
    const daysInMo = getDaysInMonth(d);
    activeBranches.forEach((b) => {
      const costRec = monthlyCosts.find((c) => c.branchId === b.id && c.yearMonth === ym);
      if (costRec) {
        proRatedOpex += costRec.fixedOpeXTotal / daysInMo;
      }
      proRatedFixedDoctorFee += (branchMonthlyFixedDocMap.get(b.id) || 0) / daysInMo;
    });
  });

  const totalDoctorPayout = Math.round(variableDoctorPayout + proRatedFixedDoctorFee);
  const totalCost = Math.round(proRatedOpex + totalDoctorPayout);
  const totalRevenue = dialysisRevenue + deptRevenue;
  const totalFootfall = dialysisFootfall + deptFootfall;
  const netProfit = totalRevenue - totalCost;
  const netMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    proRatedOpex: Math.round(proRatedOpex),
    totalDoctorPayout,
    netProfit,
    netMarginPct,
    totalFootfall,
    dialysisFootfall,
    dialysisRevenue,
    deptRevenue,
    deptFootfall,
    totalAvailableSlots,
    dialysisOccupancyPct,
  };
}

// 3. Safe Percentage Change Helper
export function calcDeltaPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// 4. Compute Previous Period Context of Equal Duration
export function getPreviousPeriodContext(ctx: FilterContext): FilterContext {
  const start = parseISO(ctx.startDate);
  const end = parseISO(ctx.endDate);
  const spanDays = differenceInCalendarDays(end, start) + 1;
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, spanDays - 1);
  return {
    ...ctx,
    startDate: format(prevStart, 'yyyy-MM-dd'),
    endDate: format(prevEnd, 'yyyy-MM-dd'),
  };
}
