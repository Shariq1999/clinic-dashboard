import Dexie, { Table } from 'dexie';
import {
  Branch,
  DialysisCapacityLog,
  DialysisSlotRecord,
  ServiceCatalogItem,
  BranchRateOverride,
  DailyDepartmentEntry,
  MonthlyCostRecord,
  BackupPayload,
} from '../types/schema';

export class ClinicDatabase extends Dexie {
  branches!: Table<Branch, string>;
  capacityLogs!: Table<DialysisCapacityLog, string>;
  dialysisSlots!: Table<DialysisSlotRecord, string>;
  serviceCatalog!: Table<ServiceCatalogItem, string>;
  rateOverrides!: Table<BranchRateOverride, string>;
  dailyEntries!: Table<DailyDepartmentEntry, string>;
  monthlyCosts!: Table<MonthlyCostRecord, string>;
  meta!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('ClinicChainDashboardDB');
    this.version(1).stores({
      branches: 'id, code',
      capacityLogs: 'id, branchId, effectiveFrom, [branchId+effectiveFrom]',
      dialysisSlots: 'id, branchId, date, [branchId+date]',
      serviceCatalog: 'id, department',
      rateOverrides: 'id, branchId, serviceId, [branchId+serviceId]',
      dailyEntries: 'id, branchId, date, department, serviceId, [branchId+date]',
      monthlyCosts: 'id, branchId, yearMonth, [branchId+yearMonth]',
      meta: 'key',
    });
  }

  async exportToJsonBackup(): Promise<string> {
    const payload: BackupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      branches: await this.branches.toArray(),
      capacityLogs: await this.capacityLogs.toArray(),
      dialysisSlots: await this.dialysisSlots.toArray(),
      serviceCatalog: await this.serviceCatalog.toArray(),
      rateOverrides: await this.rateOverrides.toArray(),
      dailyEntries: await this.dailyEntries.toArray(),
      monthlyCosts: await this.monthlyCosts.toArray(),
    };
    return JSON.stringify(payload, null, 2);
  }

  async restoreFromJsonBackup(jsonString: string): Promise<void> {
    const data: BackupPayload = JSON.parse(jsonString);
    if (!data.branches || !data.serviceCatalog || !data.dailyEntries) {
      throw new Error('Invalid backup JSON structure. Missing key tables.');
    }
    await this.transaction(
      'rw',
      [
        this.branches,
        this.capacityLogs,
        this.dialysisSlots,
        this.serviceCatalog,
        this.rateOverrides,
        this.dailyEntries,
        this.monthlyCosts,
        this.meta,
      ],
      async () => {
        await Promise.all([
          this.branches.clear(),
          this.capacityLogs.clear(),
          this.dialysisSlots.clear(),
          this.serviceCatalog.clear(),
          this.rateOverrides.clear(),
          this.dailyEntries.clear(),
          this.monthlyCosts.clear(),
        ]);
        if (data.branches?.length) await this.branches.bulkAdd(data.branches);
        if (data.capacityLogs?.length) await this.capacityLogs.bulkAdd(data.capacityLogs);
        if (data.dialysisSlots?.length) await this.dialysisSlots.bulkAdd(data.dialysisSlots);
        if (data.serviceCatalog?.length) await this.serviceCatalog.bulkAdd(data.serviceCatalog);
        if (data.rateOverrides?.length) await this.rateOverrides.bulkAdd(data.rateOverrides);
        if (data.dailyEntries?.length) await this.dailyEntries.bulkAdd(data.dailyEntries);
        if (data.monthlyCosts?.length) await this.monthlyCosts.bulkAdd(data.monthlyCosts);
        await this.meta.put({ key: 'isSampleDataLoaded', value: true });
        await this.meta.put({ key: 'isEdited', value: true });
      }
    );
  }
}

export const db = new ClinicDatabase();
