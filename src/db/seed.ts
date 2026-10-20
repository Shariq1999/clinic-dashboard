import { db } from './database';
import {
  Branch,
  ServiceCatalogItem,
  DialysisCapacityLog,
  BranchRateOverride,
  DialysisSlotRecord,
  DailyDepartmentEntry,
  MonthlyCostRecord,
} from '../types/schema';
import { eachDayOfInterval, parseISO, format, getDay } from 'date-fns';

// Deterministic PRNG (Mulberry32) so sample data is identical on every reset
function createPrng(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MASTER_BRANCHES: Branch[] = [
  {
    id: 'br_dar_ul_shifa',
    code: 'DUS',
    name: 'Dar ul Shifa',
    location: 'Mumbai Central / South',
    isActive: true,
    sundayOpen: false,
  },
  {
    id: 'br_saifee_diag',
    code: 'SDC',
    name: 'Saifee Diagnostics Center',
    location: 'Charni Road / Girgaon',
    isActive: true,
    sundayOpen: false,
  },
];

export const MASTER_CATALOG: ServiceCatalogItem[] = [
  // 1. DIALYSIS
  {
    id: 'srv_dialysis_std',
    department: 'DIALYSIS',
    name: 'Dialysis Session (Standard)',
    defaultRate: 1800,
    emergencyRateSurcharge: 500,
    singleUseRateSurcharge: 400,
    payoutModel: 'NONE',
    defaultRevSharePct: 0,
    defaultFixedMonthlyFee: 0,
    isActive: true,
  },
  // 2. BLOOD TESTS
  { id: 'srv_bt_cbc', department: 'BLOOD_TEST', name: 'CBC', defaultRate: 300, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_bt_kft', department: 'BLOOD_TEST', name: 'KFT (Kidney Function)', defaultRate: 500, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_bt_lft', department: 'BLOOD_TEST', name: 'LFT (Liver Function)', defaultRate: 600, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_bt_lipid', department: 'BLOOD_TEST', name: 'Lipid Profile', defaultRate: 550, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_bt_hba1c', department: 'BLOOD_TEST', name: 'HbA1c', defaultRate: 500, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_bt_tsh', department: 'BLOOD_TEST', name: 'Thyroid (TSH)', defaultRate: 400, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_bt_creat', department: 'BLOOD_TEST', name: 'Serum Creatinine', defaultRate: 200, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  // 3. X-RAY (Granular)
  { id: 'srv_xray_chest', department: 'XRAY', name: 'X-Ray Chest PA', subCategory: 'Chest', defaultRate: 400, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_xray_ortho', department: 'XRAY', name: 'X-Ray Ortho / Spine', subCategory: 'Skeletal', defaultRate: 450, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_xray_abd', department: 'XRAY', name: 'X-Ray Abdomen Erect', subCategory: 'Abdominal', defaultRate: 400, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_xray_opg', department: 'XRAY', name: 'X-Ray Dental / OPG', subCategory: 'Dental', defaultRate: 350, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  // 4. USG (Granular)
  { id: 'srv_usg_abd', department: 'USG', name: 'USG Whole Abdomen', subCategory: 'General', defaultRate: 1200, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_usg_kub', department: 'USG', name: 'USG KUB / Prostate', subCategory: 'Renal', defaultRate: 1100, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_usg_obs', department: 'USG', name: 'USG Obstetric / Pelvis', subCategory: 'OB-GYN', defaultRate: 1300, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_usg_doppler', department: 'USG', name: 'USG Renal / Carotid Doppler', subCategory: 'Vascular', defaultRate: 1800, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  // 5. PHYSIOTHERAPY
  { id: 'srv_physio_basic', department: 'PHYSIO', name: 'Basic Session', defaultRate: 500, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_physio_adv', department: 'PHYSIO', name: 'Advanced / Therapeutic', defaultRate: 800, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  { id: 'srv_physio_neuro', department: 'PHYSIO', name: 'Neuro / Rehab', defaultRate: 1000, payoutModel: 'NONE', defaultRevSharePct: 0, defaultFixedMonthlyFee: 0, isActive: true },
  // 6. CONSULTANT DOCTORS (with Revenue Share, Fixed, and Hybrid payouts)
  {
    id: 'srv_con_gp',
    department: 'CONSULTATION',
    name: 'General Physician',
    defaultRate: 500,
    payoutModel: 'FIXED_MONTHLY',
    defaultRevSharePct: 0,
    defaultFixedMonthlyFee: 45000, // Fixed monthly retainer
    isActive: true,
  },
  {
    id: 'srv_con_nephro',
    department: 'CONSULTATION',
    name: 'Nephrologist',
    defaultRate: 900,
    payoutModel: 'HYBRID',
    defaultRevSharePct: 50,        // 50% share per patient + fixed retainer
    defaultFixedMonthlyFee: 30000,
    isActive: true,
  },
  {
    id: 'srv_con_ortho',
    department: 'CONSULTATION',
    name: 'Orthopaedic',
    defaultRate: 700,
    payoutModel: 'REVENUE_SHARE',
    defaultRevSharePct: 65,        // Pure 65% revenue share per consultation
    defaultFixedMonthlyFee: 0,
    isActive: true,
  },
];

export const INITIAL_CAPACITY_LOGS: DialysisCapacityLog[] = [
  // Dar ul Shifa starts with 4 machines (8 slots), expands to 6 machines (12 slots) on July 1, 2026
  {
    id: 'br_dar_ul_shifa_2026-04-01',
    branchId: 'br_dar_ul_shifa',
    effectiveFrom: '2026-04-01',
    machineCount: 4,
    slotsPerMachine: 2,
    note: 'Initial FY26-27 baseline (4 machines, 2 shifts)',
  },
  {
    id: 'br_dar_ul_shifa_2026-07-01',
    branchId: 'br_dar_ul_shifa',
    effectiveFrom: '2026-07-01',
    machineCount: 6,
    slotsPerMachine: 2,
    note: 'Q2 Wing Expansion: Added 2 dialysis machines',
  },
  // Saifee Diagnostics Center operates 4 machines (8 slots) initially, adds a 3rd evening shift on Aug 1, 2026
  {
    id: 'br_saifee_diag_2026-04-01',
    branchId: 'br_saifee_diag',
    effectiveFrom: '2026-04-01',
    machineCount: 4,
    slotsPerMachine: 2,
    note: 'Initial baseline (4 machines, 2 shifts)',
  },
  {
    id: 'br_saifee_diag_2026-08-01',
    branchId: 'br_saifee_diag',
    effectiveFrom: '2026-08-01',
    machineCount: 4,
    slotsPerMachine: 3,
    note: 'Added twilight 3rd shift per machine (12 slots/day)',
  },
];

export async function seedDatabase(forceReset = false): Promise<void> {
  const isLoaded = await db.meta.get('isSampleDataLoaded');
  if (isLoaded && !forceReset) return;

  const rand = createPrng(20260401);
  const days = eachDayOfInterval({
    start: parseISO('2026-04-01'),
    end: parseISO('2026-09-30'),
  });

  const dialysisSlots: DialysisSlotRecord[] = [];
  const dailyEntries: DailyDepartmentEntry[] = [];
  const monthlyCosts: MonthlyCostRecord[] = [];
  const rateOverrides: BranchRateOverride[] = [
    // Sample override at Saifee Diagnostics Center for USG Whole Abdomen & Nephrologist
    {
      id: 'br_saifee_diag_srv_usg_abd',
      branchId: 'br_saifee_diag',
      serviceId: 'srv_usg_abd',
      overrideRate: 1350,
    },
    {
      id: 'br_saifee_diag_srv_con_nephro',
      branchId: 'br_saifee_diag',
      serviceId: 'srv_con_nephro',
      overrideRate: 1000,
      overridePayoutModel: 'HYBRID',
      overrideRevSharePct: 55,
      overrideFixedMonthlyFee: 35000,
    },
  ];

  // Helper to resolve capacity on a given date
  const getCap = (branchId: string, dateStr: string) => {
    const logs = INITIAL_CAPACITY_LOGS
      .filter((l) => l.branchId === branchId && l.effectiveFrom <= dateStr)
      .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
    return logs[logs.length - 1];
  };

  // Generate 6 months of daily records (Skipping Sundays!)
  days.forEach((dayObj, dayIdx) => {
    if (getDay(dayObj) === 0) return; // SUNDAY IS NON-WORKING DAY
    const dateStr = format(dayObj, 'yyyy-MM-dd');
    // Gradual upward growth trend over 6 months (1.0 in Apr -> ~1.35 in Sep)
    const growthFactor = 1 + (dayIdx / 183) * 0.35;

    MASTER_BRANCHES.forEach((branch) => {
      const isDUS = branch.id === 'br_dar_ul_shifa';
      const cap = getCap(branch.id, dateStr);
      const targetOccupancy = isDUS
        ? Math.min(0.92, 0.74 * growthFactor)
        : Math.min(0.88, 0.65 * growthFactor);

      // 1. Dialysis Slots
      for (let m = 1; m <= cap.machineCount; m++) {
        for (let s = 1; s <= cap.slotsPerMachine; s++) {
          const isOccupied = rand() < targetOccupancy;
          dialysisSlots.push({
            id: `${branch.id}_${dateStr}_M${m}_S${s}`,
            branchId: branch.id,
            date: dateStr,
            machineIndex: m,
            slotIndex: s,
            isOccupied,
            slotType: 'STANDARD',
            appliedRate: 1800,
          });
        }
      }

      // 2. Non-Dialysis Department Entries
      MASTER_CATALOG.filter((item) => item.department !== 'DIALYSIS').forEach((service) => {
        const override = rateOverrides.find(
          (o) => o.branchId === branch.id && o.serviceId === service.id
        );
        const rate = override?.overrideRate ?? service.defaultRate;
        const payoutModel = override?.overridePayoutModel ?? service.payoutModel;
        const revSharePct = override?.overrideRevSharePct ?? service.defaultRevSharePct;

        // Base daily volume by service category
        let baseVol = 4;
        if (service.department === 'BLOOD_TEST') baseVol = isDUS ? 9 : 12;
        if (service.department === 'XRAY') baseVol = isDUS ? 5 : 6;
        if (service.department === 'USG') baseVol = isDUS ? 4 : 6;
        if (service.department === 'PHYSIO') baseVol = isDUS ? 6 : 5;
        if (service.department === 'CONSULTATION') baseVol = isDUS ? 8 : 7;

        const count = Math.max(0, Math.round(baseVol * growthFactor * (0.65 + rand() * 0.7)));
        const revenue = count * rate;
        const doctorVariablePayout =
          service.department === 'CONSULTATION' &&
          (payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID')
            ? Math.round(revenue * (revSharePct / 100))
            : 0;

        dailyEntries.push({
          id: `${branch.id}_${dateStr}_${service.id}`,
          branchId: branch.id,
          date: dateStr,
          department: service.department,
          serviceId: service.id,
          patientCount: count,
          rate,
          revenue,
          doctorVariablePayout,
        });
      });
    });
  });

  // 3. Monthly Cost Sheet (Apr 2026 to Sep 2026)
  const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
  months.forEach((ym) => {
    MASTER_BRANCHES.forEach((branch) => {
      const isDUS = branch.id === 'br_dar_ul_shifa';
      const rent = isDUS ? 140000 : 165000;
      const electricity = Math.round((isDUS ? 42000 : 38000) * (0.9 + rand() * 0.25));
      const staffing = isDUS ? 210000 : 195000;
      const consumables = Math.round((isDUS ? 115000 : 98000) * (0.9 + rand() * 0.2));
      const licensing = 15000;
      const other = Math.round(18000 * (0.8 + rand() * 0.4));
      monthlyCosts.push({
        id: `${branch.id}_${ym}`,
        branchId: branch.id,
        yearMonth: ym,
        rent,
        electricity,
        staffing,
        consumables,
        licensing,
        other,
        fixedOpeXTotal: rent + electricity + staffing + consumables + licensing + other,
      });
    });
  });

  await db.transaction(
    'rw',
    [
      db.branches,
      db.serviceCatalog,
      db.capacityLogs,
      db.rateOverrides,
      db.dialysisSlots,
      db.dailyEntries,
      db.monthlyCosts,
      db.meta,
    ],
    async () => {
      await Promise.all([
        db.branches.clear(),
        db.serviceCatalog.clear(),
        db.capacityLogs.clear(),
        db.rateOverrides.clear(),
        db.dialysisSlots.clear(),
        db.dailyEntries.clear(),
        db.monthlyCosts.clear(),
      ]);
      await db.branches.bulkAdd(MASTER_BRANCHES);
      await db.serviceCatalog.bulkAdd(MASTER_CATALOG);
      await db.capacityLogs.bulkAdd(INITIAL_CAPACITY_LOGS);
      await db.rateOverrides.bulkAdd(rateOverrides);
      await db.dialysisSlots.bulkAdd(dialysisSlots);
      await db.dailyEntries.bulkAdd(dailyEntries);
      await db.monthlyCosts.bulkAdd(monthlyCosts);
      await db.meta.put({ key: 'isSampleDataLoaded', value: true });
      await db.meta.put({ key: 'isEdited', value: false });
    }
  );
}
