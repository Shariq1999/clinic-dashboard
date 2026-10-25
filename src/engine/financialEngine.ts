import {
  Branch,
  DialysisCapacityLog,
  DialysisSlotRecord,
  DailyDepartmentEntry,
  MonthlyCostRecord,
  DepartmentCostRecord,
  ServiceCatalogItem,
  BranchRateOverride,
  DepartmentId,
  DepartmentProfitabilityMetric,
  DEPARTMENT_NAMES,
} from '../types/schema';
import { DEPARTMENT_COST_WEIGHTS } from '../db/seed';
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
  overrides: BranchRateOverride[],
  departmentCosts?: DepartmentCostRecord[]
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

  // D. Pro-rated Monthly OPEX + Pro-rated Fixed Monthly Doctor Retainers (Universal Doctor Remuneration)
  let proRatedOpex = 0;
  let proRatedFixedDoctorFee = 0;

  // Calculate fixed monthly doctor retainers per branch (filtered by department context)
  const eligibleServices = catalog.filter(
    (c) => ctx.department === 'ALL' || c.department === ctx.department
  );
  const branchMonthlyFixedDocMap = new Map<string, number>();
  activeBranches.forEach((b) => {
    let monthlyFixed = 0;
    eligibleServices.forEach((srv) => {
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
      if (ctx.department === 'ALL') {
        const costRec = monthlyCosts.find((c) => c.branchId === b.id && c.yearMonth === ym);
        if (costRec) {
          proRatedOpex += costRec.fixedOpeXTotal / daysInMo;
        }
      } else {
        // Look up department-specific cost record first
        const deptRec = departmentCosts?.find(
          (dc) => dc.branchId === b.id && dc.yearMonth === ym && dc.department === ctx.department
        );
        if (deptRec) {
          proRatedOpex += deptRec.fixedOpeXTotal / daysInMo;
        } else {
          // Fallback to proportional weight split of branch total OPEX
          const costRec = monthlyCosts.find((c) => c.branchId === b.id && c.yearMonth === ym);
          if (costRec) {
            const w = DEPARTMENT_COST_WEIGHTS[ctx.department] || 0.166;
            proRatedOpex += (costRec.fixedOpeXTotal * w) / daysInMo;
          }
        }
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

// 3. Compute Department-Wise Profitability Engine
export function computeDepartmentProfitability(
  ctx: FilterContext,
  branches: Branch[],
  capacityLogs: DialysisCapacityLog[],
  dialysisSlots: DialysisSlotRecord[],
  dailyEntries: DailyDepartmentEntry[],
  departmentCosts: DepartmentCostRecord[],
  monthlyCosts: MonthlyCostRecord[],
  catalog: ServiceCatalogItem[],
  overrides: BranchRateOverride[]
): DepartmentProfitabilityMetric[] {
  const activeBranches =
    ctx.branchId === 'ALL' ? branches : branches.filter((b) => b.id === ctx.branchId);
  const activeBranchIds = new Set(activeBranches.map((b) => b.id));

  const days = eachDayOfInterval({
    start: parseISO(ctx.startDate),
    end: parseISO(ctx.endDate),
  });

  const departments: DepartmentId[] = [
    'DIALYSIS',
    'BLOOD_TEST',
    'USG',
    'XRAY',
    'PHYSIO',
    'CONSULTATION',
  ];

  // Map of fixed doctor fees per department per branch: key = `${branchId}_${dept}`
  const branchDeptFixedDocFee = new Map<string, number>();
  activeBranches.forEach((b) => {
    departments.forEach((dept) => {
      const deptServices = catalog.filter((c) => c.department === dept);
      let fee = 0;
      deptServices.forEach((srv) => {
        const ov = overrides.find((o) => o.branchId === b.id && o.serviceId === srv.id);
        const model = ov?.overridePayoutModel ?? srv.payoutModel;
        const fixedFee = ov?.overrideFixedMonthlyFee ?? srv.defaultFixedMonthlyFee;
        if (model === 'FIXED_MONTHLY' || model === 'HYBRID') {
          fee += fixedFee;
        }
      });
      branchDeptFixedDocFee.set(`${b.id}_${dept}`, fee);
    });
  });

  const rawMetrics = departments.map((dept) => {
    // 1. Footfall, Revenue & Variable Doctor Payouts
    let footfall = 0;
    let revenue = 0;
    let variableDocPayout = 0;

    if (dept === 'DIALYSIS') {
      const slots = dialysisSlots.filter(
        (s) =>
          activeBranchIds.has(s.branchId) &&
          s.date >= ctx.startDate &&
          s.date <= ctx.endDate &&
          getDay(parseISO(s.date)) !== 0 &&
          s.isOccupied
      );
      footfall = slots.length;
      revenue = slots.reduce((sum, s) => sum + s.appliedRate, 0);
    } else {
      const entries = dailyEntries.filter(
        (e) =>
          activeBranchIds.has(e.branchId) &&
          e.date >= ctx.startDate &&
          e.date <= ctx.endDate &&
          e.department === dept
      );
      footfall = entries.reduce((sum, e) => sum + e.patientCount, 0);
      revenue = entries.reduce((sum, e) => sum + e.revenue, 0);
      variableDocPayout = entries.reduce((sum, e) => sum + (e.doctorVariablePayout || 0), 0);
    }

    // 2. Pro-rated OPEX across all 6 cost buckets
    let rent = 0;
    let electricity = 0;
    let staffing = 0;
    let consumables = 0;
    let licensing = 0;
    let other = 0;
    let fixedDocFee = 0;

    days.forEach((d) => {
      const ym = format(d, 'yyyy-MM');
      const daysInMo = getDaysInMonth(d);

      activeBranches.forEach((b) => {
        const deptRec = departmentCosts?.find(
          (dc) => dc.branchId === b.id && dc.yearMonth === ym && dc.department === dept
        );

        if (deptRec) {
          rent += deptRec.rent / daysInMo;
          electricity += deptRec.electricity / daysInMo;
          staffing += deptRec.staffing / daysInMo;
          consumables += deptRec.consumables / daysInMo;
          licensing += deptRec.licensing / daysInMo;
          other += deptRec.other / daysInMo;
        } else {
          const mc = monthlyCosts.find((c) => c.branchId === b.id && c.yearMonth === ym);
          if (mc) {
            const w = DEPARTMENT_COST_WEIGHTS[dept] || 0.166;
            rent += (mc.rent * w) / daysInMo;
            electricity += (mc.electricity * w) / daysInMo;
            staffing += (mc.staffing * w) / daysInMo;
            consumables += (mc.consumables * w) / daysInMo;
            licensing += (mc.licensing * w) / daysInMo;
            other += (mc.other * w) / daysInMo;
          }
        }

        fixedDocFee += (branchDeptFixedDocFee.get(`${b.id}_${dept}`) || 0) / daysInMo;
      });
    });

    const opexTotal = rent + electricity + staffing + consumables + licensing + other;
    const docTotal = variableDocPayout + fixedDocFee;
    const totalCost = opexTotal + docTotal;
    const netProfit = revenue - totalCost;
    const marginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      department: dept,
      name: DEPARTMENT_NAMES[dept],
      footfall,
      revenue,
      proRatedOpex: {
        rent: Math.round(rent),
        electricity: Math.round(electricity),
        staffing: Math.round(staffing),
        consumables: Math.round(consumables),
        licensing: Math.round(licensing),
        other: Math.round(other),
        total: Math.round(opexTotal),
      },
      doctorPayouts: {
        variable: Math.round(variableDocPayout),
        fixed: Math.round(fixedDocFee),
        total: Math.round(docTotal),
      },
      totalCost: Math.round(totalCost),
      netProfit: Math.round(netProfit),
      marginPct,
      revContributionPct: 0,
      profitContributionPct: 0,
    };
  });

  const totalRevAllDepts = rawMetrics.reduce((s, m) => s + m.revenue, 0);
  const totalNetProfitAllDepts = rawMetrics.reduce((s, m) => s + m.netProfit, 0);

  return rawMetrics.map((m) => ({
    ...m,
    revContributionPct: totalRevAllDepts > 0 ? (m.revenue / totalRevAllDepts) * 100 : 0,
    profitContributionPct:
      totalNetProfitAllDepts > 0 && m.netProfit > 0
        ? (m.netProfit / totalNetProfitAllDepts) * 100
        : 0,
  }));
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
