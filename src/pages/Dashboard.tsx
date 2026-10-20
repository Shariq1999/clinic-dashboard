import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import {
  computePeriodMetrics,
  getPreviousPeriodContext,
  calcDeltaPct,
} from '../engine/financialEngine';
import { formatINR, formatPct, formatNumber } from '../utils/formatters';
import { KpiCard } from '../components/ui/KpiCard';
import { RevenueBarChart } from '../components/charts/RevenueBarChart';
import { CostBreakdownDonut } from '../components/charts/CostBreakdownDonut';
import { OccupancyTrendLine } from '../components/charts/OccupancyTrendLine';
import { FootfallByDeptBar } from '../components/charts/FootfallByDeptBar';
import { ProfitWaterfallChart } from '../components/charts/ProfitWaterfallChart';
import {
  IndianRupee,
  Coins,
  TrendingUp,
  Percent,
  Activity,
  Users,
  Building,
} from 'lucide-react';
import { eachWeekOfInterval, parseISO, format, endOfWeek, min, max, getDay } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { branchId, startDate, endDate, department } = useAppStore();

  // Reactive IndexedDB data
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const capacityLogs = useLiveQuery(() => db.capacityLogs.toArray(), []);
  const dialysisSlots = useLiveQuery(() => db.dialysisSlots.toArray(), []);
  const dailyEntries = useLiveQuery(() => db.dailyEntries.toArray(), []);
  const monthlyCosts = useLiveQuery(() => db.monthlyCosts.toArray(), []);
  const serviceCatalog = useLiveQuery(() => db.serviceCatalog.toArray(), []);
  const rateOverrides = useLiveQuery(() => db.rateOverrides.toArray(), []);

  const isReady =
    branches &&
    capacityLogs &&
    dialysisSlots &&
    dailyEntries &&
    monthlyCosts &&
    serviceCatalog &&
    rateOverrides;

  // 1. Current Period Metrics
  const currentMetrics = useMemo(() => {
    if (!isReady) return null;
    return computePeriodMetrics(
      { branchId, startDate, endDate, department },
      branches,
      capacityLogs,
      dialysisSlots,
      dailyEntries,
      monthlyCosts,
      serviceCatalog,
      rateOverrides
    );
  }, [isReady, branchId, startDate, endDate, department, branches, capacityLogs, dialysisSlots, dailyEntries, monthlyCosts, serviceCatalog, rateOverrides]);

  // 2. Previous Period Metrics for Delta %
  const prevMetrics = useMemo(() => {
    if (!isReady) return null;
    const prevCtx = getPreviousPeriodContext({ branchId, startDate, endDate, department });
    return computePeriodMetrics(
      prevCtx,
      branches,
      capacityLogs,
      dialysisSlots,
      dailyEntries,
      monthlyCosts,
      serviceCatalog,
      rateOverrides
    );
  }, [isReady, branchId, startDate, endDate, department, branches, capacityLogs, dialysisSlots, dailyEntries, monthlyCosts, serviceCatalog, rateOverrides]);

  // 3. Monthly Revenue Stacked Bar Data
  const monthlyRevenueData = useMemo(() => {
    if (!isReady) return [];
    const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
    const activeBranchIds = new Set(
      branchId === 'ALL' ? branches.map((b) => b.id) : [branchId]
    );

    return months.map((ym) => {
      // Dialysis revenue for that month
      const dialRev = dialysisSlots
        .filter(
          (s) =>
            activeBranchIds.has(s.branchId) &&
            s.date.startsWith(ym) &&
            s.isOccupied &&
            getDay(parseISO(s.date)) !== 0
        )
        .reduce((sum, s) => sum + s.appliedRate, 0);

      // Dept revenues
      const entries = dailyEntries.filter(
        (e) => activeBranchIds.has(e.branchId) && e.date.startsWith(ym)
      );

      const sumDept = (dId: string) =>
        entries.filter((e) => e.department === dId).reduce((s, e) => s + e.revenue, 0);

      const dName = format(parseISO(`${ym}-01`), 'MMM yyyy');

      return {
        month: dName,
        dialysis: dialRev,
        bloodTest: sumDept('BLOOD_TEST'),
        xray: sumDept('XRAY'),
        usg: sumDept('USG'),
        physio: sumDept('PHYSIO'),
        consultation: sumDept('CONSULTATION'),
      };
    });
  }, [isReady, branches, branchId, dialysisSlots, dailyEntries]);

  // 4. Cost Breakdown Donut Data
  const costBreakdown = useMemo(() => {
    if (!isReady || !currentMetrics) return null;
    const activeBranchIds = new Set(
      branchId === 'ALL' ? branches.map((b) => b.id) : [branchId]
    );

    // Sum OPEX records in period
    let rent = 0;
    let electricity = 0;
    let staffing = 0;
    let consumables = 0;
    let licensing = 0;
    let other = 0;

    monthlyCosts.forEach((c) => {
      if (activeBranchIds.has(c.branchId)) {
        rent += c.rent;
        electricity += c.electricity;
        staffing += c.staffing;
        consumables += c.consumables;
        licensing += c.licensing;
        other += c.other;
      }
    });

    return {
      rent,
      electricity,
      staffing,
      consumables,
      licensing,
      other,
      doctorPayouts: currentMetrics.totalDoctorPayout,
    };
  }, [isReady, currentMetrics, branchId, branches, monthlyCosts]);

  // 5. Dialysis Occupancy Trend Data (Weekly)
  const occupancyTrendData = useMemo(() => {
    if (!isReady) return [];
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
      const activeBranchIds = new Set(
        branchId === 'ALL' ? branches.map((b) => b.id) : [branchId]
      );

      return weeks.map((wStart) => {
        const wEnd = min([endOfWeek(wStart, { weekStartsOn: 1 }), end]);
        const startStr = format(wStart, 'yyyy-MM-dd');
        const endStr = format(wEnd, 'yyyy-MM-dd');

        // Available slots excluding Sunday
        let avail = 0;
        let occupied = 0;

        dialysisSlots.forEach((slot) => {
          if (
            activeBranchIds.has(slot.branchId) &&
            slot.date >= startStr &&
            slot.date <= endStr &&
            getDay(parseISO(slot.date)) !== 0
          ) {
            avail++;
            if (slot.isOccupied) occupied++;
          }
        });

        const pct = avail > 0 ? (occupied / avail) * 100 : 0;
        return {
          dateLabel: format(wStart, 'dd MMM'),
          occupancyPct: Math.round(pct * 10) / 10,
          occupiedSlots: occupied,
          availableSlots: avail,
        };
      });
    } catch {
      return [];
    }
  }, [isReady, startDate, endDate, branchId, branches, dialysisSlots]);

  // 6. Footfall by Dept
  const deptFootfallData = useMemo(() => {
    if (!isReady || !currentMetrics) return [];
    const activeBranchIds = new Set(
      branchId === 'ALL' ? branches.map((b) => b.id) : [branchId]
    );

    const filtered = dailyEntries.filter(
      (e) =>
        activeBranchIds.has(e.branchId) &&
        e.date >= startDate &&
        e.date <= endDate
    );

    const getCount = (d: string) =>
      filtered.filter((e) => e.department === d).reduce((s, e) => s + e.patientCount, 0);

    return [
      { department: 'Dialysis', count: currentMetrics.dialysisFootfall, color: '#0d9488' },
      { department: 'Blood Tests', count: getCount('BLOOD_TEST'), color: '#f43f5e' },
      { department: 'Consultation', count: getCount('CONSULTATION'), color: '#10b981' },
      { department: 'Physiotherapy', count: getCount('PHYSIO'), color: '#f59e0b' },
      { department: 'X-Ray', count: getCount('XRAY'), color: '#3b82f6' },
      { department: 'USG / Doppler', count: getCount('USG'), color: '#8b5cf6' },
    ];
  }, [isReady, currentMetrics, branchId, branches, dailyEntries, startDate, endDate]);

  if (!isReady || !currentMetrics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Activity className="w-6 h-6 animate-spin mr-2 text-teal-600" />
        <span>Computing consolidated metrics...</span>
      </div>
    );
  }

  // Deltas
  const revDelta = prevMetrics ? calcDeltaPct(currentMetrics.totalRevenue, prevMetrics.totalRevenue) : undefined;
  const costDelta = prevMetrics ? calcDeltaPct(currentMetrics.totalCost, prevMetrics.totalCost) : undefined;
  const profitDelta = prevMetrics ? calcDeltaPct(currentMetrics.netProfit, prevMetrics.netProfit) : undefined;
  const footfallDelta = prevMetrics ? calcDeltaPct(currentMetrics.totalFootfall, prevMetrics.totalFootfall) : undefined;
  const occDelta = prevMetrics ? currentMetrics.dialysisOccupancyPct - prevMetrics.dialysisOccupancyPct : undefined;

  return (
    <div className="space-y-6">
      {/* Branch Banner if filtered */}
      {branchId !== 'ALL' && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-700" />
            <span className="font-semibold">
              Filtered to: {branches?.find((b) => b.id === branchId)?.name} ({branches?.find((b) => b.id === branchId)?.code})
            </span>
          </div>
          <span className="text-teal-700 font-medium">
            Location: {branches?.find((b) => b.id === branchId)?.location}
          </span>
        </div>
      )}

      {/* Row 1: 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatINR(currentMetrics.totalRevenue, true)}
          subValue={formatINR(currentMetrics.totalRevenue)}
          deltaPct={revDelta}
          icon={IndianRupee}
          variant="teal"
        />

        <KpiCard
          title="Total Cost"
          value={formatINR(currentMetrics.totalCost, true)}
          subValue={`OPEX: ${formatINR(currentMetrics.proRatedOpex, true)}`}
          deltaPct={costDelta}
          isInverseDelta={true}
          icon={Coins}
          variant="rose"
        />

        <KpiCard
          title="Net Profit"
          value={formatINR(currentMetrics.netProfit, true)}
          subValue={`Margin: ${currentMetrics.netMarginPct.toFixed(1)}%`}
          deltaPct={profitDelta}
          icon={TrendingUp}
          variant={currentMetrics.netProfit >= 0 ? 'emerald' : 'rose'}
        />

        <KpiCard
          title="Profit Margin"
          value={formatPct(currentMetrics.netMarginPct, false)}
          subValue={currentMetrics.netProfit >= 0 ? 'Profitable' : 'Deficit'}
          deltaPct={profitDelta}
          icon={Percent}
          variant="indigo"
        />

        <KpiCard
          title="Dialysis Occupancy"
          value={formatPct(currentMetrics.dialysisOccupancyPct, false)}
          subValue={`${currentMetrics.dialysisFootfall} / ${currentMetrics.totalAvailableSlots} slots`}
          deltaPct={occDelta}
          deltaLabel="pp vs prior"
          icon={Activity}
          variant="blue"
        />

        <KpiCard
          title="Patient Footfall"
          value={formatNumber(currentMetrics.totalFootfall)}
          subValue={`Dialysis: ${currentMetrics.dialysisFootfall}`}
          deltaPct={footfallDelta}
          icon={Users}
          variant="amber"
        />
      </div>

      {/* Row 2: Charts (Revenue Stacked Bar + Cost Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueBarChart monthlyData={monthlyRevenueData} />
        </div>
        <div>
          {costBreakdown && (
            <CostBreakdownDonut
              rent={costBreakdown.rent}
              electricity={costBreakdown.electricity}
              staffing={costBreakdown.staffing}
              consumables={costBreakdown.consumables}
              licensing={costBreakdown.licensing}
              other={costBreakdown.other}
              doctorPayouts={costBreakdown.doctorPayouts}
            />
          )}
        </div>
      </div>

      {/* Row 3: Occupancy Trend, Footfall Bar, Waterfall */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OccupancyTrendLine trendData={occupancyTrendData} />
        <FootfallByDeptBar deptFootfall={deptFootfallData} />
        <ProfitWaterfallChart
          grossRevenue={currentMetrics.totalRevenue}
          fixedOpex={currentMetrics.proRatedOpex}
          doctorPayouts={currentMetrics.totalDoctorPayout}
          netProfit={currentMetrics.netProfit}
        />
      </div>
    </div>
  );
};
