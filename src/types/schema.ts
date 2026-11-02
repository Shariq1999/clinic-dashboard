export type BranchId = 'br_dar_ul_shifa' | 'br_saifee_diag' | string;

export type DepartmentId =
  | 'DIALYSIS'
  | 'BLOOD_TEST'
  | 'XRAY'
  | 'USG'
  | 'PHYSIO'
  | 'CONSULTATION';

export const DEPARTMENT_NAMES: Record<DepartmentId, string> = {
  DIALYSIS: 'Dialysis Center',
  BLOOD_TEST: 'Blood Tests (Pathology)',
  XRAY: 'X-Ray & Radiology',
  USG: 'USG / Doppler',
  PHYSIO: 'Physiotherapy',
  CONSULTATION: 'Doctor Consultations',
};

export interface DepartmentProfitabilityMetric {
  department: DepartmentId;
  name: string;
  footfall: number;
  revenue: number;
  proRatedOpex: {
    rent: number;
    electricity: number;
    staffing: number;
    consumables: number;
    licensing: number;
    other: number;
    total: number;
  };
  doctorPayouts: {
    variable: number;
    fixed: number;
    total: number;
  };
  totalCost: number;
  netProfit: number;
  marginPct: number;
  revContributionPct: number;
  profitContributionPct: number;
}

export type DialysisSlotType = 'STANDARD' | 'EMERGENCY' | 'SINGLE_USE';

export type DoctorPayoutModel = 'NONE' | 'REVENUE_SHARE' | 'FIXED_MONTHLY' | 'HYBRID';

export interface Branch {
  id: BranchId;
  code: string;               // "DUS" | "SDC"
  name: string;               // "Dar ul Shifa" | "Saifee Diagnostics Center"
  location: string;
  isActive: boolean;
  sundayOpen: boolean;        // Default: false (Sunday is a non-working day)
}

export interface DialysisCapacityLog {
  id: string;                 // `${branchId}_${effectiveFrom}`
  branchId: BranchId;
  effectiveFrom: string;      // YYYY-MM-DD (sorted ascending)
  machineCount: number;       // Default: 4
  slotsPerMachine: number;    // Default: 2
  note: string;
}

export interface DialysisSlotRecord {
  id: string;                 // `${branchId}_${date}_M${machineIndex}_S${slotIndex}`
  branchId: BranchId;
  date: string;               // YYYY-MM-DD
  machineIndex: number;       // 1..machineCount
  slotIndex: number;          // 1..slotsPerMachine
  isOccupied: boolean;
  slotType: DialysisSlotType; // Default: 'STANDARD' (future-proof for altered pricing)
  appliedRate: number;        // Snapshotted INR rate (Default: 1800)
}

export interface ServiceCatalogItem {
  id: string;                 // e.g., "srv_xray_chest", "srv_con_nephro"
  department: DepartmentId;
  name: string;               // e.g., "X-Ray Chest PA", "Nephrologist"
  subCategory?: string;       // e.g., "Routine", "Doppler", "Specialist"
  defaultRate: number;        // Standard INR price
  // Future-proof Dialysis shift modifiers (optional)
  emergencyRateSurcharge?: number;
  singleUseRateSurcharge?: number;
  // Doctor Payout defaults (used when department === 'CONSULTATION')
  payoutModel: DoctorPayoutModel;
  defaultRevSharePct: number;        // e.g., 60 means 60% to doctor, 40% retained by clinic
  defaultFixedMonthlyFee: number;    // e.g., 45000 INR/month fixed retainer
  isActive: boolean;
}

export interface BranchRateOverride {
  id: string;                 // `${branchId}_${serviceId}`
  branchId: BranchId;
  serviceId: string;
  overrideRate?: number;             // Optional branch-specific patient fee
  overridePayoutModel?: DoctorPayoutModel;
  overrideRevSharePct?: number;      // Optional branch-specific doctor % share
  overrideFixedMonthlyFee?: number;  // Optional branch-specific fixed monthly retainer
}

export interface DailyDepartmentEntry {
  id: string;                 // `${branchId}_${date}_${serviceId}`
  branchId: BranchId;
  date: string;               // YYYY-MM-DD
  department: DepartmentId;   // Excludes 'DIALYSIS'
  serviceId: string;
  patientCount: number;
  rate: number;               // Applied patient rate (INR)
  revenue: number;            // patientCount * rate
  doctorVariablePayout: number; // Auto-calculated if CONSULTATION & REVENUE_SHARE/HYBRID
}

export interface MonthlyCostRecord {
  id: string;                 // `${branchId}_${yearMonth}`
  branchId: BranchId;
  yearMonth: string;          // "YYYY-MM"
  rent: number;
  electricity: number;
  staffing: number;
  consumables: number;
  licensing: number;
  other: number;
  fixedOpeXTotal: number;     // Sum of the 6 manual buckets above
}

export interface DepartmentCostRecord {
  id: string;                 // `${branchId}_${yearMonth}_${department}`
  branchId: BranchId;
  yearMonth: string;          // "YYYY-MM"
  department: DepartmentId;   // 'DIALYSIS' | 'BLOOD_TEST' | 'XRAY' | 'USG' | 'PHYSIO' | 'CONSULTATION'
  rent: number;
  electricity: number;
  staffing: number;
  consumables: number;
  licensing: number;
  other: number;
  fixedOpeXTotal: number;     // Sum of the 6 buckets for this department
}

export interface PatientInvoiceRecord {
  id: string;                 // `${branchId}_${invoiceNumber}`
  branchId: BranchId;
  srNo: number;
  invoiceNumber: string;
  timeOfBill: string;         // "YYYY-MM-DD HH:mm"
  netAmt: number;
  umr: string;
  patientName: string;
  ageGender: string;
  personalContact: string;
}

export type OpdRoomId = 'SDC_OPD1' | 'DUS_OPD1' | 'DUS_OPD2' | 'SDC_FREE_OPD';

export interface OpdRoomSlotBooking {
  id: string;                 // `${branchId}_${roomId}_${weekLabel}_${dayOfWeek}_S${slotIndex}`
  branchId: BranchId;
  roomId: OpdRoomId;
  roomName: string;
  weekLabel: string;          // "Week 1", "Week 2", "Week 3", "Week 4"
  weekNumber: number;         // 1..4
  dayOfWeek: string;          // "Sunday" .. "Saturday"
  slotIndex: number;          // 1..6
  timeSlot: string;           // "08:00 - 10:00", etc.
  rate: number;               // Flat 2500 INR / 2 hrs
  doctorName?: string;
  specialty?: string;
  isBooked: boolean;
}

export interface BackupPayload {
  version: string;
  exportedAt: string;
  branches: Branch[];
  capacityLogs: DialysisCapacityLog[];
  dialysisSlots: DialysisSlotRecord[];
  serviceCatalog: ServiceCatalogItem[];
  rateOverrides: BranchRateOverride[];
  dailyEntries: DailyDepartmentEntry[];
  monthlyCosts: MonthlyCostRecord[];
  departmentCosts?: DepartmentCostRecord[];
  patientInvoices?: PatientInvoiceRecord[];
  opdRoomSlots?: OpdRoomSlotBooking[];
}
