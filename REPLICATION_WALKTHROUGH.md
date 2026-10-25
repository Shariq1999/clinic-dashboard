# REPLICATION WALKTHROUGH
## Project: Multi-Branch Diagnostic & Dialysis Clinic Dashboard (PoC)

> **Document Purpose:** This document is an exhaustive, standalone replication blueprint. A software engineer with zero prior context, no access to past chat logs, and only this document must be able to recreate the entire application from scratch and achieve the exact same functioning system. Nothing is omitted, assumed, or summarized.

---

# 1. PROJECT OVERVIEW

### 1.1 What It Does, Who It Is For, and the Problem It Solves
The **Multi-Branch Diagnostic & Dialysis Clinic Dashboard** is a local-first single-page web application designed for independent healthcare chains operating multi-modality diagnostic centers and renal dialysis facilities. Specifically, it models two high-volume branches in Mumbai, India:
1. **Dar ul Shifa (DUS)** — Mumbai Central / South
2. **Saifee Diagnostics Center (SDC)** — Charni Road / Girgaon

Traditional Hospital Information Systems (HIS) and clinic ERPs are typically heavy, expensive, reliant on continuous internet connectivity, and rigid regarding clinical compensation models. Small-to-medium diagnostic chains often struggle with:
- Tracking dialysis station utilization without inflating capacity across non-working days (Sundays).
- Managing multi-tier specialist doctor compensation (pure revenue sharing, guaranteed monthly retainers, or hybrid models) alongside operational clinic overhead (OPEX).
- Monitoring branch-level vs. chain-consolidated financial margins without sending sensitive financial data to third-party cloud servers.
- Preserving historical capacity audit logs (e.g., adding a machine mid-year should not retroactively alter the capacity denominator of previous quarters).

This application solves these challenges by running **100% in the browser** using client-side IndexedDB (`Dexie.js`), dynamic chart visualization (`Chart.js`), robust date-math (`date-fns`), and client-side multi-sheet Excel/CSV export (`SheetJS`).

### 1.2 Final Deliverables and "Working" System Definition
A fully functional replica delivers:
- **Zero-Cloud Local Execution:** Boots instantly via Vite and persists all state in browser IndexedDB.
- **Deterministic 6-Month Seed Data:** Seeds exactly 183 days (`2026-04-01` to `2026-09-30`) using a seeded pseudo-random number generator (Mulberry32). Every reset yields identical clinical volume, revenue, and cost numbers.
- **Executive KPI Dashboard:** Real-time calculation of Gross Revenue, Total Operating Cost, Net Profit, Profit Margin %, Dialysis Occupancy %, and Patient Footfall with previous-period comparison deltas.
- **5 Visual Analytics Charts:**
  1. Stacked Monthly Department Revenue Bar Chart
  2. 7-Segment Cost Structure Donut Chart (6 OPEX buckets + Doctor Payouts)
  3. Weekly Dialysis Occupancy Trend Line Chart (Sunday-safe denominator)
  4. Horizontal Patient Footfall by Department Bar Chart
  5. P&L Financial Flow Waterfall Bridge Chart
- **Interactive Dialysis Matrix Grid:** Month-by-month grid displaying machines and shifts. Clicking any Monday–Saturday slot toggles booking in real-time. Sundays are visually disabled and strictly excluded from capacity denominators.
- **Inline Spreadsheet Daily Data Entry:** Grid for logging patient volume across 21 diagnostic and consultation services with real-time revenue and doctor share calculations.
- **Financials & OPEX Editor:** 6-bucket monthly expense form (Rent, Electricity, Staffing, Consumables, Licensing, Other) + 6-month master P&L ledger.
- **Service Catalog & Branch Override Manager:** Master price list and doctor compensation models with per-branch rate overrides.
- **Capacity Log Timeline:** Historical versioning of dialysis machines and shift counts.
- **Complete Data Portability:** 6-tab `.xlsx` Excel export, `.csv` export, timestamped `.json` full-state backup export, and 1-click `.json` state restore.

### 1.3 Scope Boundaries (Explicitly NOT Included)
- **No Multi-User Authentication / RBAC:** The PoC operates under a single administrative user model. No login, JWT, or password management exists.
- **No External Backend or Cloud API:** There is no Node/Express server, no PostgreSQL database, and no cloud syncing. All storage is browser-local IndexedDB.
- **No Hardware Telemetry:** Dialysis machine utilization is entered via booking records, not IoT sensors.
- **No Patient Electronic Health Records (EHR):** Tracks aggregated service volumes and slot occupancy, not individual patient identifiable health records (PII).

---

# 2. ENVIRONMENT AND SETUP

### 2.1 Target Environment
- **Operating System:** Windows 10/11, macOS 12+, or Ubuntu 20.04+
- **Runtime:** Node.js `v20.0.0` or higher (CI/CD pipeline runs on Node `24.x`)
- **Package Manager:** `npm` (`v10.x` or `v11.x`) or `pnpm` (`v9.x`)
- **Browser Compatibility:** Chrome 90+, Edge 90+, Firefox 90+, Safari 15+ (requires IndexedDB and ES2020 support)

### 2.2 Dependencies and Exact Versions

```json
{
  "dependencies": {
    "chart.js": "^4.4.4",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^3.6.0",
    "dexie": "^4.0.8",
    "dexie-react-hooks": "^1.1.7",
    "lucide-react": "^0.446.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "xlsx": "^0.18.5",
    "zustand": "^4.5.5",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.5.3",
    "vite": "^5.4.8"
  }
}
```

#### Rationale for Each Dependency
| Package | Version | Justification |
|---|---|---|
| `react` & `react-dom` | `^18.3.1` | Modern concurrent UI runtime with strict typing. |
| `dexie` | `^4.0.8` | Typesafe, high-performance wrapper over browser IndexedDB with compound index support. |
| `dexie-react-hooks` | `^1.1.7` | Provides `useLiveQuery` to automatically re-render React components whenever IndexedDB tables mutate. |
| `chart.js` & `react-chartjs-2` | `^4.4.4` / `^5.2.0` | Canvas-based charting engine capable of rendering stacked bars, donuts, and line charts with custom tooltip formatters. |
| `date-fns` | `^3.6.0` | Lightweight, immutable date utility library used for ISO parsing, interval calculations, and Sunday identification (`getDay === 0`). |
| `xlsx` | `^0.18.5` | SheetJS community edition for client-side generation of multi-sheet `.xlsx` workbooks and CSV downloads without server involvement. |
| `zustand` | `^4.5.5` | Minimalistic state management for global active filters (selected branch, date range, active tab). |
| `lucide-react` | `^0.446.0` | Clinical and administrative icon library. |
| `clsx` & `tailwind-merge` | `^2.1.1` / `^2.5.2` | Clean conditional class name merging for UI components. |
| `tailwindcss`, `postcss`, `autoprefixer` | `^3.4.13` | Utility-first CSS styling framework. |
| `typescript` | `^5.5.3` | Type safety and static schema enforcement across database models. |
| `vite` | `^5.4.8` | Ultra-fast ESM bundler with hot module replacement (HMR). |

### 2.3 Environment Variables
No secrets or API keys are required. For GitHub Pages hosting, the build requires setting `base: '/clinic-dashboard/'` in `vite.config.ts`.

### 2.4 Project Directory Structure

```
c:\Users\shari\Downloads\Dashboard\
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD deployment workflow
├── dist/                           # Compiled production output (generated by npm run build)
├── node_modules/                   # Node dependencies
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── chartSetup.ts       # Global Chart.js component registrations
│   │   │   ├── CostBreakdownDonut.tsx # 7-segment cost donut chart
│   │   │   ├── FootfallByDeptBar.tsx  # Horizontal patient footfall chart
│   │   │   ├── OccupancyTrendLine.tsx # Weekly dialysis occupancy line chart
│   │   │   ├── ProfitWaterfallChart.tsx # P&L bridge waterfall chart
│   │   │   └── RevenueBarChart.tsx # Stacked monthly revenue by department chart
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Top-level shell (Sidebar + TopBar + Main container)
│   │   │   ├── Sidebar.tsx         # Left navigation bar with clinical route tabs
│   │   │   └── TopBar.tsx          # Global controls (Branch selector, Date picker, Badge)
│   │   └── ui/
│   │       ├── BranchSelector.tsx  # Dropdown selector for ALL / DUS / SDC
│   │       ├── DateRangePicker.tsx # From/To date inputs with quick presets
│   │       ├── KpiCard.tsx         # Executive metric card with trend indicators
│   │       └── SampleDataBadge.tsx # "SAMPLE DATA MODE" pill & reset modal trigger
│   ├── db/
│   │   ├── database.ts             # Dexie.js database schema & backup/restore methods
│   │   └── seed.ts                 # Deterministic 6-month sample data generator (Mulberry32)
│   ├── engine/
│   │   ├── exportEngine.ts         # SheetJS Excel multi-tab workbook & CSV export
│   │   └── financialEngine.ts      # Core financial calculations, Sunday exclusions, OPEX
│   ├── pages/
│   │   ├── DailyEntry.tsx          # Inline spreadsheet grid for daily patient test logging
│   │   ├── Dashboard.tsx           # Executive Overview with 6 KPI cards & 5 charts
│   │   ├── DataExport.tsx          # Excel/CSV download, JSON state backup & restore
│   │   ├── Dialysis.tsx            # Click-to-toggle monthly dialysis shift matrix
│   │   ├── Financials.tsx          # 6-bucket monthly OPEX form & 6-month P&L ledger
│   │   ├── RateCard.tsx            # Master service catalog & branch rate overrides
│   │   └── Settings.tsx            # Machine and shift capacity logs audit trail
│   ├── store/
│   │   └── useAppStore.ts          # Zustand global filter and tab navigation store
│   ├── types/
│   │   └── schema.ts               # Master TypeScript interfaces and data models
│   ├── utils/
│   │   └── formatters.ts           # Indian Rupee (en-IN) & percentage formatters
│   ├── App.tsx                     # Top-level page router and metadata initializer
│   ├── index.css                   # Tailwind CSS directives & scrollbar styling
│   └── main.tsx                    # React DOM root mounting & DB auto-seed bootstrap
├── .gitignore                      # Git ignored paths (node_modules, dist, .env)
├── index.html                      # HTML entrypoint with viewport & Inter font
├── package.json                    # Project metadata, scripts, and dependencies
├── postcss.config.js               # PostCSS Tailwind and Autoprefixer plugins
├── tailwind.config.js              # Tailwind theme configuration with teal palette
├── tsconfig.json                   # TypeScript compiler options (bundler mode)
├── tsconfig.node.json              # TypeScript config for Vite configuration
└── vite.config.ts                  # Vite config with manual chunk splitting & base path
```

---

# 3. ARCHITECTURE AND DESIGN DECISIONS

### Decision 1: Browser-Local Persistence (Dexie.js IndexedDB)
- **Decision:** Use IndexedDB via Dexie.js as the primary persistence layer.
- **Alternatives Considered:**
  1. *SQLite via WASM (`sql.js` / `wa-sqlite`):* Heavy binary payload (>1.5MB), complex asynchronous file-system persistence bridges.
  2. *Cloud Backend (Node.js + PostgreSQL / Firebase):* Introduces hosting costs, network latency, CORS setup, and breaks the privacy constraint for local PoC testing.
  3. *Browser LocalStorage:* Strict 5MB storage limit; incapable of indexing 183 days of granular slot and test records.
- **Why:** IndexedDB provides hundreds of megabytes of storage, transactions, and index searches (`[branchId+date]`). Dexie's `useLiveQuery` provides zero-latency reactivity.
- **Consequences:** Data is tied to the specific browser instance. Mitigated by building an automated JSON state backup and restore engine.

### Decision 2: Sunday Non-Working Day Strict Exclusion
- **Decision:** Strictly exclude Sundays (`new Date(d).getDay() === 0`) from dialysis capacity denominators, shade Sunday columns as closed in the matrix grid, and prevent synthetic routine volume on Sundays.
- **Alternatives Considered:**
  1. *7-day continuous operating assumption:* Standard in hospital software, but clinically inaccurate for standalone outpatient day-care dialysis units.
  2. *Custom per-branch holiday calendar:* Over-engineered for a 2-branch PoC.
- **Why:** Dividing occupied sessions by a 30-day denominator when the unit is only open 26 days artificially depresses reported occupancy from 90% down to ~78%, giving clinic management a distorted picture of capacity utilization.
- **Consequences:** Every date range calculation must iterate through days and evaluate `getDay(d) !== 0`.

### Decision 3: Retroactive Dialysis Capacity Versioning (`DialysisCapacityLog`)
- **Decision:** Model machine and shift expansions as a timeline of dated log records (`effectiveFrom`). Resolving capacity on any date uses the latest log record where `effectiveFrom <= targetDate`.
- **Alternatives Considered:**
  1. *Storing current machine count on the `Branch` record:* Retroactively corrupts historical occupancy metrics. If Dar ul Shifa expands from 4 to 6 machines on July 1, April's occupancy would incorrectly divide by 12 slots/day instead of 8.
- **Why:** Allows historical audit integrity. A clinic can expand its fleet without altering historical reports.
- **Consequences:** Capacity cannot be fetched with a static number; it must be resolved dynamically via `resolveDailyCapacity()`.

### Decision 4: 3-Tier Doctor Remuneration Integrated into Total Cost
- **Decision:** Support `REVENUE_SHARE`, `FIXED_MONTHLY`, and `HYBRID` models, calculated dynamically and integrated into the P&L as a distinct cost component alongside 6 monthly OPEX buckets. Total Cost = `Monthly OPEX + Doctor Payouts`.
- **Alternatives Considered:**
  1. *Treating doctor payouts as an accounting journal entry separate from clinic OPEX:* Obscures the true break-even point for diagnostic consultations.
  2. *Pure commission-only:* Unrealistic for senior nephrologists who require a guaranteed monthly retainer.
- **Why:** Medical specialists demand flexible contracts. A hybrid model guarantees ₹30,000/month plus 50% of consultation fees above base patient volume.
- **Consequences:** Financial engine must calculate both daily variable doctor fees from daily logs and pro-rated monthly fixed retainers from active consultant services.

### Decision 5: Tab-Based Router without `react-router-dom`
- **Decision:** Use a clean Zustand-driven active tab state (`activeTab`) inside an `AppShell` component.
- **Alternatives Considered:** `react-router-dom` or HashRouter.
- **Why:** Eliminates routing configuration mismatch errors when deploying to GitHub Pages subpaths (`/clinic-dashboard/`), while maintaining fast state-preserved tab switching.
- **Consequences:** Deep linking to individual sub-pages via browser URL path is not supported; state defaults to `dashboard` on initial load.

### Decision 6: Manual Chunk Optimization in Bundler
- **Decision:** Explicitly separate `vendor`, `charts`, `excel`, and `db` into discrete rollup chunks in `vite.config.ts`.
- **Alternatives Considered:** Default single-bundle output.
- **Why:** SheetJS (`xlsx`) is ~280kB and Chart.js is ~186kB. Without chunking, Vite outputs a warning for bundles exceeding 500kB. Chunking drops initial page load bundle sizes to ~140kB.
- **Consequences:** Requires explicit `manualChunks` mapping in `vite.config.ts`.

---

# 4. STEP-BY-STEP BUILD SEQUENCE

### Step 1: Initialize Project Directory & Manifest
- **Goal:** Create base workspace and declare all production and development dependencies.
- **Files Modified/Created:** `package.json`
- **Complete Code:** See Section 10.1 (`package.json`).
- **Explanation:** Declares module type, build scripts (`dev`, `build`, `preview`), React 18, Dexie, Chart.js, SheetJS, Tailwind, and TypeScript dependencies.
- **Verification:** Run `npm install`. Check that `node_modules/` is created with zero install errors.

### Step 2: Configure Build Tools & Compilers
- **Goal:** Configure Vite bundler, TypeScript compilation rules, Tailwind CSS, and PostCSS.
- **Files Modified/Created:** `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `.gitignore`.
- **Complete Code:** See Section 10.2 through 10.8.
- **Explanation:**
  - `vite.config.ts`: Configures `@vitejs/plugin-react`, `base: '/clinic-dashboard/'` for GitHub Pages, and `manualChunks` grouping.
  - `tsconfig.json`: Enables ES2020 target, bundler module resolution, strict mode, and JSX preservation.
  - `tailwind.config.js`: Scans `./index.html` and `./src/**/*.{js,ts,jsx,tsx}` and extends theme with clinical teal brand palette (`#0d9488`).
- **Verification:** Run `npx tsc --noEmit`. Must exit with code 0.

### Step 3: Define Data Models & TypeScript Schema
- **Goal:** Establish strict type interfaces for all database tables and business entities.
- **Files Modified/Created:** `src/types/schema.ts`
- **Complete Code:** See Section 10.10.
- **Explanation:** Defines `Branch`, `DialysisCapacityLog`, `DialysisSlotRecord`, `ServiceCatalogItem`, `BranchRateOverride`, `DailyDepartmentEntry`, `MonthlyCostRecord`, and `BackupPayload`.
- **Verification:** Ensure schema exports all 8 table models and types without syntax errors.

### Step 4: Implement Database Layer & IndexedDB Schema
- **Goal:** Initialize Dexie database with primary keys, compound indices, and JSON export/import methods.
- **Files Modified/Created:** `src/db/database.ts`
- **Complete Code:** See Section 10.11.
- **Explanation:** Subclasses `Dexie`, defines compound indices like `[branchId+date]` and `[branchId+yearMonth]`, and implements transactional `exportToJsonBackup()` and `restoreFromJsonBackup()`.
- **Verification:** Import `db` in a scratch script and verify `db.name === 'ClinicChainDashboardDB'`.

### Step 5: Implement Currency & Formatting Utilities
- **Goal:** Build Indian Rupee (`en-IN`) formatting functions and percentage formatters.
- **Files Modified/Created:** `src/utils/formatters.ts`
- **Complete Code:** See Section 10.15.
- **Explanation:**
  - `formatINR(amount, compact)`: Formats numbers using `en-IN` numbering (e.g., `₹12,45,000` or `₹12.45 L`).
  - `formatPct(val, showPlus)`: Formats signed percentage changes (`+12.4%`).
- **Verification:** Verify `formatINR(1245000, true)` returns `"₹12.45 L"`.

### Step 6: Implement Deterministic PRNG Seed Engine
- **Goal:** Generate 6 full months (`2026-04-01` to `2026-09-30`) of realistic, deterministic sample data.
- **Files Modified/Created:** `src/db/seed.ts`
- **Complete Code:** See Section 10.12.
- **Explanation:** Uses Mulberry32 bitwise PRNG with seed `20260401`. Generates master branches, 22 service catalog items, capacity logs, Sunday-safe dialysis slots, daily test entries with growth trends, and 6-month OPEX records.
- **Verification:** Call `await seedDatabase(true)` in console; verify ~4,000 dialysis slots and ~2,500 daily entries are added.

### Step 7: Build Financial Compute Engine
- **Goal:** Implement financial metrics, Sunday-safe capacity resolution, and previous-period comparison logic.
- **Files Modified/Created:** `src/engine/financialEngine.ts`
- **Complete Code:** See Section 10.13.
- **Explanation:**
  - `resolveDailyCapacity()`: Fetches capacity record active on a given date.
  - `computePeriodMetrics()`: Calculates revenue, footfall, pro-rated OPEX, dynamic doctor payouts, net profit, and Sunday-safe dialysis occupancy.
  - `getPreviousPeriodContext()`: Computes an equal-length prior date window for delta comparisons.
- **Verification:** Call `computePeriodMetrics()` with Apr-Sep 2026 dates; verify occupancy is between 75% and 88%.

### Step 8: Build SheetJS Export & Portability Engine
- **Goal:** Implement multi-tab Excel workbook generation, CSV downloads, and JSON backup trigger.
- **Files Modified/Created:** `src/engine/exportEngine.ts`
- **Complete Code:** See Section 10.14.
- **Explanation:**
  - `exportFullExcelWorkbook()`: Builds 6 sheets (`Branches`, `RateCard_Master`, `Branch_Overrides`, `Monthly_Costs`, `Daily_Dept_Revenue`, `Occupied_Dialysis_Slots`) using `XLSX.utils.json_to_sheet`.
  - `exportDailyEntriesCsv()`: Exports daily test logs to `.csv`.
  - `triggerJsonBackupDownload()`: Initiates browser download of full JSON state.
- **Verification:** Trigger `exportFullExcelWorkbook()`; verify `.xlsx` file downloads with 6 readable tabs.

### Step 9: Establish Zustand State Management
- **Goal:** Provide global state for branch selection, date filtering, and active navigation tab.
- **Files Modified/Created:** `src/store/useAppStore.ts`
- **Complete Code:** See Section 10.16.
- **Explanation:** Manages `branchId`, `startDate` (default `'2026-04-01'`), `endDate` (default `'2026-09-30'`), `department`, `activeTab`, and `isSampleDataLoaded` flag.
- **Verification:** Test mutating `setBranchId('br_dar_ul_shifa')` in React DevTools.

### Step 10: Setup Global Chart.js Components
- **Goal:** Register required Chart.js controllers, scales, and plugins globally.
- **Files Modified/Created:** `src/components/charts/chartSetup.ts`
- **Complete Code:** See Section 10.27.
- **Explanation:** Registers `CategoryScale`, `LinearScale`, `BarElement`, `PointElement`, `LineElement`, `ArcElement`, `Title`, `Tooltip`, `Legend`, and `Filler`.
- **Verification:** Import file in chart modules to prevent "category is not a registered scale" runtime crashes.

### Step 11: Create UI Primitives & Layout Components
- **Goal:** Build navigation shell, top bar, branch selector, date range picker, and KPI cards.
- **Files Modified/Created:**
  - `src/components/ui/KpiCard.tsx`
  - `src/components/ui/BranchSelector.tsx`
  - `src/components/ui/DateRangePicker.tsx`
  - `src/components/ui/SampleDataBadge.tsx`
  - `src/components/layout/AppShell.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/TopBar.tsx`
- **Complete Code:** See Section 10.20 through 10.26.
- **Explanation:** Renders sidebar navigation, responsive top bar, date range shortcuts (Full 6M, Q1, Q2, Sep '26), and animated "SAMPLE DATA MODE" status badge with reset dialog.
- **Verification:** Component renders in browser with responsive layout.

### Step 12: Build Chart Components
- **Goal:** Construct 5 interactive Chart.js visualization components.
- **Files Modified/Created:**
  - `src/components/charts/RevenueBarChart.tsx`
  - `src/components/charts/CostBreakdownDonut.tsx`
  - `src/components/charts/OccupancyTrendLine.tsx`
  - `src/components/charts/FootfallByDeptBar.tsx`
  - `src/components/charts/ProfitWaterfallChart.tsx`
- **Complete Code:** See Section 10.28 through 10.32.
- **Explanation:** Formats tooltips with `formatINR`, handles stacked departments, custom donut percentage legends, and P&L waterfall visual flows.
- **Verification:** Verify charts resize cleanly and render hover tooltips.

### Step 13: Build Application Pages
- **Goal:** Implement the 7 primary application views.
- **Files Modified/Created:**
  - `src/pages/Dashboard.tsx`
  - `src/pages/Dialysis.tsx`
  - `src/pages/DailyEntry.tsx`
  - `src/pages/Financials.tsx`
  - `src/pages/RateCard.tsx`
  - `src/pages/Settings.tsx`
  - `src/pages/DataExport.tsx`
- **Complete Code:** See Section 10.33 through 10.39.
- **Explanation:**
  - `Dashboard.tsx`: Reactively pulls data via `useLiveQuery` and computes metrics.
  - `Dialysis.tsx`: Generates month matrix, locks Sundays, handles click-to-toggle slot booking.
  - `DailyEntry.tsx`: Inline spreadsheet for logging daily diagnostic encounters.
  - `Financials.tsx`: 6-bucket monthly OPEX form and 6-month P&L ledger.
  - `RateCard.tsx`: Master price editor and branch override manager.
  - `Settings.tsx`: Capacity log versioning and audit trail.
  - `DataExport.tsx`: Export and backup/restore control center.
- **Verification:** Navigate to each tab and verify interactive operations mutate IndexedDB.

### Step 14: Bootstrap Application Entrypoints
- **Goal:** Wire database seeding on first boot and mount React application.
- **Files Modified/Created:** `src/App.tsx`, `src/main.tsx`, `src/index.css`.
- **Complete Code:** See Section 10.17 through 10.19.
- **Explanation:** `main.tsx` displays a temporary loading splash while checking/seeding IndexedDB, then mounts `App.tsx` which renders `AppShell` with the active tab.
- **Verification:** Run `npm run dev`. Refresh browser; verify database auto-seeds and renders dashboard.

### Step 15: GitHub Actions CI/CD Pipeline
- **Goal:** Automate production building and deployment to GitHub Pages.
- **Files Modified/Created:** `.github/workflows/deploy.yml`
- **Complete Code:** See Section 10.9.
- **Explanation:** Runs on pushes to `main`, sets up Node 24, runs `npm install` and `npm run build`, enables GitHub Pages with `enablement: true`, and deploys `./dist`.
- **Verification:** Push commit to GitHub; verify workflow completes with green checkmark.

---

# 5. KEY LOGIC DEEP-DIVES

### 5.1 Sunday Non-Working Day Exclusion & Occupancy Calculation
#### Logic Explanation
Dialysis units run scheduled shifts Monday through Saturday. Operating on Sunday is restricted to unbudgeted emergency cover and is closed in routine scheduling. Including Sundays in available capacity calculation artificially inflates total available slots, reducing calculated occupancy.
The formula for a selected interval $[D_{start}, D_{end}]$ is:
$$\text{Available Capacity Slots} = \sum_{d \in [D_{start}, D_{end}], \, \text{day}(d) \neq 0} \text{DailySlots}(d, \text{branch})$$
$$\text{Dialysis Occupancy \%} = \frac{\sum \text{Occupied Valid Slots}}{\text{Available Capacity Slots}} \times 100$$

#### Worked Example
Consider April 2026 (30 calendar days, 4 Sundays: April 5, 12, 19, 26):
- Calendar days = 30
- Sunday count = 4
- Operating working days = $30 - 4 = 26$ days
- Baseline capacity for Dar ul Shifa: 4 machines $\times$ 2 shifts = 8 slots/day
- Total available capacity denominator = $26 \times 8 = 208$ slots
*(Note: If Sundays were not excluded, denominator would be $30 \times 8 = 240$ slots).*
- If 175 slots were booked:
  - Correct Occupancy = $(175 / 208) \times 100 = \mathbf{84.13\%}$
  - Incorrect (Sunday-included) = $(175 / 240) \times 100 = 72.92\%$ (a 11.2% distortion).

### 5.2 Retroactive Capacity Resolution (`resolveDailyCapacity`)
#### Logic Explanation
Capacity changes across time (e.g., adding machines or introducing a twilight shift). When querying capacity for a given branch and date:
1. Filter `DialysisCapacityLog` where `branchId === targetBranch` AND `effectiveFrom <= targetDate`.
2. Sort ascending by `effectiveFrom`.
3. Return the latest record. If none match, fallback to earliest or default $4 \times 2$.

#### Code snippet (`financialEngine.ts`):
```ts
export function resolveDailyCapacity(
  branchId: string,
  dateStr: string,
  capacityLogs: DialysisCapacityLog[]
): { machineCount: number; slotsPerMachine: number; dailySlots: number } {
  const matching = capacityLogs
    .filter((l) => l.branchId === branchId && l.effectiveFrom <= dateStr)
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));

  if (matching.length === 0) {
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
```

### 5.3 Consultant Doctor Remuneration Models
The system supports three models:
1. `REVENUE_SHARE`: Doctor receives a flat percentage of consultation fees:
   $$\text{Payout}_{var} = \sum (\text{PatientCount} \times \text{Rate} \times (\text{RevSharePct} / 100))$$
2. `FIXED_MONTHLY`: Doctor receives a fixed monthly retainer:
   $$\text{Payout}_{fixed} = \text{MonthlyRetainerFee}$$
3. `HYBRID`: Doctor receives both fixed monthly guarantee and revenue share:
   $$\text{Payout}_{total} = \text{Payout}_{fixed} + \text{Payout}_{var}$$

#### Financial Engine Integration
In any filtered interval, fixed monthly doctor retainers are pro-rated daily:
$$\text{ProRatedFixedFee} = \sum_{d \in interval} \frac{\text{MonthlyFixedRetainer}}{\text{DaysInMonth}(d)}$$
$$\text{Total Doctor Payout} = \sum \text{VariablePayouts} + \text{ProRatedFixedFee}$$
$$\text{Total Clinic Operating Cost} = \text{ProRatedOPEX} + \text{Total Doctor Payout}$$

### 5.4 Mulberry32 Deterministic PRNG
Standard `Math.random()` produces different numbers on every reload. Mulberry32 is a 32-bit PRNG that produces an identical deterministic pseudo-random stream from an integer seed (`20260401`):

```ts
function createPrng(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

### 5.5 Indian Rupee (`en-IN`) Formatting
Numbers are formatted using Indian numbering brackets (thousands, lakhs, crores):
- `₹12,45,000` (12 Lakhs, 45 Thousand)
- Compact formatting:
  - $\ge 1,00,00,000 \implies \mathbf{Cr}$ (Crore)
  - $\ge 1,00,000 \implies \mathbf{L}$ (Lakh)
  - $\ge 1,000 \implies \mathbf{K}$ (Thousand)

---

# 6. DATA SPECIFICATIONS

### 6.1 Database Schema (IndexedDB Stores)
The Dexie database `ClinicChainDashboardDB` defines 8 stores:
1. `branches`: `id, code`
2. `capacityLogs`: `id, branchId, effectiveFrom, [branchId+effectiveFrom]`
3. `dialysisSlots`: `id, branchId, date, [branchId+date]`
4. `serviceCatalog`: `id, department`
5. `rateOverrides`: `id, branchId, serviceId, [branchId+serviceId]`
6. `dailyEntries`: `id, branchId, date, department, serviceId, [branchId+date]`
7. `monthlyCosts`: `id, branchId, yearMonth, [branchId+yearMonth]`
8. `meta`: `key`

### 6.2 Master Service Catalog (22 Clinical Procedures)
1. **DIALYSIS:**
   - `srv_dialysis_std`: Dialysis Session (Standard) — ₹1,800
2. **BLOOD_TEST (Pathology):**
   - `srv_bt_cbc`: CBC — ₹300
   - `srv_bt_kft`: KFT (Kidney Function) — ₹500
   - `srv_bt_lft`: LFT (Liver Function) — ₹600
   - `srv_bt_lipid`: Lipid Profile — ₹550
   - `srv_bt_hba1c`: HbA1c — ₹500
   - `srv_bt_tsh`: Thyroid (TSH) — ₹400
   - `srv_bt_creat`: Serum Creatinine — ₹200
3. **XRAY (Granular Sub-Modalities):**
   - `srv_xray_chest`: X-Ray Chest PA — ₹400
   - `srv_xray_ortho`: X-Ray Ortho / Spine — ₹450
   - `srv_xray_abd`: X-Ray Abdomen Erect — ₹400
   - `srv_xray_opg`: X-Ray Dental / OPG — ₹350
4. **USG (Ultrasound Sub-Modalities):**
   - `srv_usg_abd`: USG Whole Abdomen — ₹1,200
   - `srv_usg_kub`: USG KUB / Prostate — ₹1,100
   - `srv_usg_obs`: USG Obstetric / Pelvis — ₹1,300
   - `srv_usg_doppler`: USG Renal / Carotid Doppler — ₹1,800
5. **PHYSIO (Physiotherapy):**
   - `srv_physio_basic`: Basic Session — ₹500
   - `srv_physio_adv`: Advanced / Therapeutic — ₹800
   - `srv_physio_neuro`: Neuro / Rehab — ₹1,000
6. **CONSULTATION (Doctors):**
   - `srv_con_gp`: General Physician — Rate: ₹500 | Model: `FIXED_MONTHLY` | Fixed: ₹45,000/mo
   - `srv_con_nephro`: Nephrologist — Rate: ₹900 | Model: `HYBRID` | RevShare: 50% | Fixed: ₹30,000/mo
   - `srv_con_ortho`: Orthopaedic — Rate: ₹700 | Model: `REVENUE_SHARE` | RevShare: 65% | Fixed: ₹0

### 6.3 Baseline Capacity Timeline
- **Dar ul Shifa (`br_dar_ul_shifa`):**
  - From `2026-04-01`: 4 machines $\times$ 2 slots = 8 slots/day.
  - From `2026-07-01`: 6 machines $\times$ 2 slots = 12 slots/day (Q2 expansion).
- **Saifee Diagnostics Center (`br_saifee_diag`):**
  - From `2026-04-01`: 4 machines $\times$ 2 slots = 8 slots/day.
  - From `2026-08-01`: 4 machines $\times$ 3 slots = 12 slots/day (Added evening shift).

### 6.4 Synthetic Volume Generation & Growth Trend
During seed generation, every weekday $i \in [0, 182]$ applies a linear growth multiplier:
$$\text{growthFactor} = 1.0 + \left(\frac{i}{183}\right) \times 0.35$$
This simulates 35% compound operational growth from April to September 2026.

---

# 7. ERRORS, DEAD ENDS AND FIXES

### Error 1: Chart.js TypeScript Scale Options `ticks.font.weight` Type Mismatch
- **Symptoms:** During `npm run build`, `tsc` failed with:
  `error TS2322: Type 'string' is not assignable to type 'number | "bold" | "normal" ... in FootfallByDeptBar.tsx`
- **Cause:** In Chart.js typing, `ticks.font.weight` expects a strict literal union (`'bold' | 'normal' | number`), but TypeScript inferred string literal `'bold'` as generic `string`.
- **Fix:** Add `as const` type assertion:
  ```ts
  ticks: { font: { size: 11, family: 'Inter, sans-serif', weight: 'bold' as const } }
  ```
- **Warning:** Never pass un-casted string literals to Chart.js typography objects in strict TypeScript.

### Error 2: Property `machineCount` Missing on Dialysis Fallback Union Type
- **Symptoms:** `tsc` failed with:
  `error TS2339: Property 'machineCount' does not exist on type '{ machineCount: number; ... } | { maxMachines: number; ... }'`
- **Cause:** In `Dialysis.tsx`, the fallback object used `{ maxMachines: 4, maxSlotsPerMachine: 2 }` while `resolveDailyCapacity` returned `{ machineCount: number, slotsPerMachine: number }`.
- **Fix:** Unified the fallback property names to match:
  ```ts
  if (!capacityLogs) return { machineCount: 4, slotsPerMachine: 2, dailySlots: 8 };
  ```

### Error 3: Vite Production Bundle Size Warning (>500 kB)
- **Symptoms:** Vite output warning: `(!) Some chunks are larger than 500 kB after minification (dist/assets/index.js was ~853 kB)`.
- **Cause:** All libraries (`xlsx`, `chart.js`, `dexie`, `react`) were being bundled into a single monolithic bundle.
- **Fix:** Configured `build.rollupOptions.output.manualChunks` in `vite.config.ts`:
  ```ts
  manualChunks: {
    vendor: ['react', 'react-dom'],
    charts: ['chart.js', 'react-chartjs-2'],
    excel: ['xlsx'],
    db: ['dexie', 'dexie-react-hooks'],
  }
  ```
  Result: Chunks split cleanly into individual files all under 285 kB.

### Error 4: GitHub Actions Deployment `HttpError: Get Pages site failed`
- **Symptoms:** GitHub Actions failed during step `Setup GitHub Pages` with `HttpError: Not Found - Get Pages site failed`.
- **Cause:** The repository had not yet had GitHub Pages manually activated in repo settings, causing the `actions/configure-pages@v5` API call to fail.
- **Fix:** Added `enablement: true` to `.github/workflows/deploy.yml`:
  ```yaml
  - name: Setup GitHub Pages
    uses: actions/configure-pages@v5
    with:
      enablement: true
  ```
  This instructs the runner to automatically provision and enable GitHub Pages on first push.

### Error 5: Node.js 20 Deprecation Warning on GitHub Actions
- **Symptoms:** Warning: `Node.js 20 is deprecated... actions target Node.js 20 but are being forced to run on Node.js 24`.
- **Cause:** Workflow used `node-version: 20` on newer GitHub runner images.
- **Fix:** Updated `.github/workflows/deploy.yml` to `node-version: 24`.

### Error 6: PowerShell `&&` Command Chaining Failure
- **Symptoms:** PowerShell error: `The token '&&' is not a valid statement separator in this version`.
- **Cause:** Older Windows PowerShell 5.1 does not support bash-style `&&` chaining.
- **Fix:** Run commands as discrete PowerShell steps or separate with `;`.

---

# 8. TESTING AND VALIDATION

### Test Case 1: First Boot Deterministic Seed Verification
- **Input:** Open fresh browser session without existing IndexedDB.
- **Expected Output:**
  - Splash screen briefly shows `"Initializing local IndexedDB & verifying 6-month seed data..."`.
  - Header displays `"SAMPLE DATA MODE"` badge.
  - Total Revenue on Dashboard displays $\approx$ `₹1.03 Cr` to `₹1.08 Cr`.
  - Dialysis occupancy displays $\approx$ `80%` to `84%`.

### Test Case 2: Sunday Non-Working Day Lock
- **Input:** Navigate to Dialysis Slot Grid. Check Sundays (e.g., April 5, 12, 19, 26, 2026).
- **Expected Output:**
  - Column header displays `SUN` with gray background (`bg-slate-200/90`).
  - Cells display a locked padlock icon.
  - Clicking Sunday cells triggers no mutation and does not toggle occupancy.
  - Monthly working day count displays `26` (not 30).

### Test Case 3: Dialysis Capacity Expansion Transition
- **Input:**
  - Select Dar ul Shifa (`DUS`), view June 2026.
  - Switch month to July 2026.
- **Expected Output:**
  - June 2026 capacity banner shows: `4 Machines × 2 Shifts = 8 slots/day`.
  - July 2026 capacity banner shows: `6 Machines × 2 Shifts = 12 slots/day` (reflecting Q2 wing expansion log).
  - Grid automatically expands rows from Machine 1–4 to Machine 1–6.

### Test Case 4: Click-to-Toggle Slot Mutation
- **Input:** On `Dialysis.tsx`, click an empty slot on Monday, April 6 (Machine 1, Shift 1).
- **Expected Output:**
  - Cell turns teal with a checkmark `✓`.
  - Booked count increments by 1.
  - Occupancy % recalculates instantly.
  - "SAMPLE DATA MODE" badge updates to display `(Modified)`.

### Test Case 5: Inline Spreadsheet Daily Revenue Calculation
- **Input:** On `DailyEntry.tsx`, set date to `2026-04-15`, increment CBC count from 8 to 18 (+10 tests).
- **Expected Output:**
  - CBC rate is ₹300. Gross Revenue increases by $10 \times 300 = \mathbf{₹3,000}$.
  - Clicking "Save Spreadsheet Entries" writes records to IndexedDB and displays `"Saved to IndexedDB!"`.

### Test Case 6: OPEX Budget Editing & P&L Update
- **Input:** On `Financials.tsx`, select April 2026 for Dar ul Shifa. Change Rent from ₹1,40,000 to ₹1,80,000 (+₹40,000). Click "Save OPEX Sheet".
- **Expected Output:**
  - Fixed Monthly OPEX updates from ₹5,40,000 to ₹5,80,000.
  - P&L table row for `2026-04` updates Total Cost by +₹40,000 and Net Profit decreases by ₹40,000.

### Test Case 7: Multi-Sheet Excel Workbook Export
- **Input:** Navigate to `DataExport.tsx`. Click "Download .xlsx".
- **Expected Output:**
  - Browser downloads `Clinic_Dashboard_Export_YYYY-MM-DD.xlsx`.
  - Opening file reveals 6 functional sheets: `Branches`, `RateCard_Master`, `Branch_Overrides`, `Monthly_Costs`, `Daily_Dept_Revenue`, and `Occupied_Dialysis_Slots`.

### Test Case 8: Full State JSON Backup & Restore
- **Input:**
  1. Click "Export JSON State" $\implies$ downloads `clinic-state-backup-YYYY-MM-DD.json`.
  2. Click "Reset to Sample Data".
  3. Click "Select JSON to Restore" and upload the downloaded backup.
- **Expected Output:**
  - All customized slot bookings, OPEX changes, and overrides are restored.
  - Dashboard KPIs reflect restored state.

---

# 9. DEPLOYMENT AND RUNNING

### 9.1 Local Development
```powershell
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Open `http://localhost:5173/clinic-dashboard/` (or `http://localhost:5173/`).

### 9.2 Local Production Build & Preview
```powershell
# 1. Compile TypeScript and build bundle
npm run build

# 2. Preview the compiled production build locally
npm run preview
```
Open the printed local URL (typically `http://localhost:4173/clinic-dashboard/`).

### 9.3 GitHub Pages Live Deployment
1. Ensure the repository has GitHub Pages enabled under **Settings $\rightarrow$ Pages $\rightarrow$ Source: GitHub Actions**.
2. Commit and push changes to branch `main`:
```powershell
git add .
git commit -m "Deploy latest dashboard build"
git push origin main
```
3. GitHub Actions workflow `.github/workflows/deploy.yml` builds and publishes to:
`https://<YOUR_GITHUB_USERNAME>.github.io/clinic-dashboard/`


---

# 10. FINAL FULL SOURCE

Below is the complete, unabridged, copy-paste ready source code for every active file in the project.

### 10.1 `package.json`
```json
{
  "name": "clinic-multi-branch-poc",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "chart.js": "^4.4.4",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^3.6.0",
    "dexie": "^4.0.8",
    "dexie-react-hooks": "^1.1.7",
    "lucide-react": "^0.446.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "xlsx": "^0.18.5",
    "zustand": "^4.5.5",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.5.3",
    "vite": "^5.4.8"
  }
}
```

### 10.2 `vite.config.ts`
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/clinic-dashboard/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          excel: ['xlsx'],
          db: ['dexie', 'dexie-react-hooks'],
        },
      },
    },
  },
});
```

### 10.3 `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### 10.4 `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 10.5 `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        }
      }
    },
  },
  plugins: [],
}
```

### 10.6 `postcss.config.js`
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 10.7 `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230d9488'><path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Clinic Chain Dashboard — Multi-Branch Diagnostics & Dialysis</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-50 text-slate-800 antialiased font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 10.8 `.gitignore`
```
node_modules
dist
dist-ssr
*.local
.env
.env.*
.DS_Store
Thumbs.db
```

### 10.9 `.github/workflows/deploy.yml`
```yaml
name: Deploy Clinic Dashboard to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 24
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm install

      - name: Build production bundle
        run: npm run build

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5
        with:
          enablement: true

      - name: Upload dist to GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 10.10 `src/types/schema.ts`
```ts
export type BranchId = 'br_dar_ul_shifa' | 'br_saifee_diag' | string;

export type DepartmentId =
  | 'DIALYSIS'
  | 'BLOOD_TEST'
  | 'XRAY'
  | 'USG'
  | 'PHYSIO'
  | 'CONSULTATION';

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
}
```

### 10.11 `src/db/database.ts`
```ts
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
```

### 10.12 `src/db/seed.ts`
```ts
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
```

### 10.13 `src/engine/financialEngine.ts`
```ts
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
```

### 10.14 `src/engine/exportEngine.ts`
```ts
import * as XLSX from 'xlsx';
import { db } from '../db/database';

export async function exportFullExcelWorkbook(): Promise<void> {
  const [branches, slots, entries, costs, catalog, overrides] = await Promise.all([
    db.branches.toArray(),
    db.dialysisSlots.toArray(),
    db.dailyEntries.toArray(),
    db.monthlyCosts.toArray(),
    db.serviceCatalog.toArray(),
    db.rateOverrides.toArray(),
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(branches), 'Branches');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(catalog), 'RateCard_Master');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overrides), 'Branch_Overrides');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(costs), 'Monthly_Costs');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(entries), 'Daily_Dept_Revenue');
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(slots.filter((s) => s.isOccupied)),
    'Occupied_Dialysis_Slots'
  );

  XLSX.writeFile(wb, `Clinic_Dashboard_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportDailyEntriesCsv(): Promise<void> {
  const entries = await db.dailyEntries.toArray();
  const ws = XLSX.utils.json_to_sheet(entries);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daily-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function triggerJsonBackupDownload(): Promise<void> {
  const json = await db.exportToJsonBackup();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clinic-state-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

### 10.15 `src/utils/formatters.ts`
```ts
export function formatINR(amount: number, compact = false): string {
  const isNeg = amount < 0;
  const abs = Math.abs(Math.round(amount));
  if (compact) {
    if (abs >= 10000000) return `${isNeg ? '-' : ''}₹${(abs / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${isNeg ? '-' : ''}₹${(abs / 100000).toFixed(2)} L`;
    if (abs >= 1000) return `${isNeg ? '-' : ''}₹${(abs / 1000).toFixed(1)} K`;
  }
  return `${isNeg ? '-' : ''}₹${abs.toLocaleString('en-IN')}`;
}

export function formatPct(val: number, showPlus = true): string {
  const prefix = showPlus && val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}%`;
}

export function formatNumber(val: number): string {
  return Math.round(val).toLocaleString('en-IN');
}
```

### 10.16 `src/store/useAppStore.ts`
```ts
import { create } from 'zustand';
import { DepartmentId } from '../types/schema';

export type NavTab =
  | 'dashboard'
  | 'dialysis'
  | 'daily_entry'
  | 'financials'
  | 'rate_card'
  | 'export'
  | 'capacity';

interface AppState {
  branchId: 'ALL' | string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  department: 'ALL' | DepartmentId;
  activeTab: NavTab;
  isSampleDataLoaded: boolean;
  isEdited: boolean;

  setBranchId: (branchId: 'ALL' | string) => void;
  setDateRange: (start: string, end: string) => void;
  setDepartment: (dept: 'ALL' | DepartmentId) => void;
  setActiveTab: (tab: NavTab) => void;
  setMetaStatus: (loaded: boolean, edited: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  branchId: 'ALL',
  // Default covers the 6-month seed period (Apr 2026 to Sep 2026)
  startDate: '2026-04-01',
  endDate: '2026-09-30',
  department: 'ALL',
  activeTab: 'dashboard',
  isSampleDataLoaded: false,
  isEdited: false,

  setBranchId: (branchId) => set({ branchId }),
  setDateRange: (startDate, endDate) => set({ startDate, endDate }),
  setDepartment: (department) => set({ department }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setMetaStatus: (isSampleDataLoaded, isEdited) => set({ isSampleDataLoaded, isEdited }),
}));
```

### 10.17 `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-50 text-slate-800 font-sans antialiased;
  }
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

### 10.18 `src/App.tsx`
```tsx
import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Dialysis } from './pages/Dialysis';
import { DailyEntry } from './pages/DailyEntry';
import { Financials } from './pages/Financials';
import { RateCard } from './pages/RateCard';
import { Settings } from './pages/Settings';
import { DataExport } from './pages/DataExport';
import { db } from './db/database';

export const App: React.FC = () => {
  const { activeTab, setMetaStatus } = useAppStore();

  // On mount, sync meta status
  useEffect(() => {
    async function checkMeta() {
      const isLoaded = await db.meta.get('isSampleDataLoaded');
      const isEdited = await db.meta.get('isEdited');
      setMetaStatus(Boolean(isLoaded?.value ?? true), Boolean(isEdited?.value ?? false));
    }
    checkMeta();
  }, [setMetaStatus]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'dialysis':
        return <Dialysis />;
      case 'daily_entry':
        return <DailyEntry />;
      case 'financials':
        return <Financials />;
      case 'rate_card':
        return <RateCard />;
      case 'capacity':
        return <Settings />;
      case 'export':
        return <DataExport />;
      default:
        return <Dashboard />;
    }
  };

  return <AppShell>{renderActiveTab()}</AppShell>;
};

export default App;
```

### 10.19 `src/main.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { seedDatabase } from './db/seed';

async function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  // Render quick splash while IndexedDB is checked/seeded on very first boot
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
          <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight">ClinicChain Dashboard</h1>
      </div>
      <p className="text-xs text-teal-400 font-medium animate-pulse">
        Initializing local IndexedDB & verifying 6-month seed data...
      </p>
    </div>
  );

  try {
    await seedDatabase(false);
  } catch (err) {
    console.error('Failed to initialize local IndexedDB:', err);
  }

  // Render application
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
```


### 10.20 `src/components/ui/BranchSelector.tsx`
```tsx
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Building2 } from 'lucide-react';

export const BranchSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { branchId, setBranchId } = useAppStore();

  return (
    <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
      <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
      <select
        value={branchId}
        onChange={(e) => setBranchId(e.target.value)}
        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 shadow-xs hover:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer"
      >
        <option value="ALL">🏢 All Branches (Consolidated)</option>
        <option value="br_dar_ul_shifa">🏥 Dar ul Shifa (DUS)</option>
        <option value="br_saifee_diag">🔬 Saifee Diagnostics Center (SDC)</option>
      </select>
    </div>
  );
};
```

### 10.21 `src/components/ui/DateRangePicker.tsx`
```tsx
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Calendar } from 'lucide-react';

export const DateRangePicker: React.FC = () => {
  const { startDate, endDate, setDateRange } = useAppStore();

  const handlePreset = (start: string, end: string) => {
    setDateRange(start, end);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-xs">
        <Calendar className="w-3.5 h-3.5 text-teal-600" />
        <span className="text-slate-500 font-medium">From</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setDateRange(e.target.value, endDate)}
          className="border-none p-0 text-slate-800 font-medium text-xs focus:ring-0 focus:outline-hidden cursor-pointer"
        />
        <span className="text-slate-400">→</span>
        <span className="text-slate-500 font-medium">To</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setDateRange(startDate, e.target.value)}
          className="border-none p-0 text-slate-800 font-medium text-xs focus:ring-0 focus:outline-hidden cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => handlePreset('2026-04-01', '2026-09-30')}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            startDate === '2026-04-01' && endDate === '2026-09-30'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Full 6M
        </button>
        <button
          type="button"
          onClick={() => handlePreset('2026-04-01', '2026-06-30')}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            startDate === '2026-04-01' && endDate === '2026-06-30'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Q1
        </button>
        <button
          type="button"
          onClick={() => handlePreset('2026-07-01', '2026-09-30')}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            startDate === '2026-07-01' && endDate === '2026-09-30'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Q2
        </button>
        <button
          type="button"
          onClick={() => handlePreset('2026-09-01', '2026-09-30')}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            startDate === '2026-09-01' && endDate === '2026-09-30'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sep '26
        </button>
      </div>
    </div>
  );
};
```

### 10.22 `src/components/ui/KpiCard.tsx`
```tsx
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPct } from '../../utils/formatters';

interface KpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  deltaPct?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  variant?: 'teal' | 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose';
  isInverseDelta?: boolean; // if true, positive delta is bad (e.g. cost)
}

const colorMap = {
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-700',
    accent: 'text-teal-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-700',
    accent: 'text-blue-600',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-700',
    accent: 'text-indigo-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
    accent: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    accent: 'text-amber-600',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-700',
    accent: 'text-rose-600',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subValue,
  deltaPct,
  deltaLabel = 'vs prior period',
  icon: Icon,
  variant = 'teal',
  isInverseDelta = false,
}) => {
  const c = colorMap[variant];

  // For revenue/profit: positive is good (green), negative is bad (red)
  // For cost: positive is bad (red), negative is good (green)
  const isPositive = deltaPct !== undefined && deltaPct > 0;
  const isNeutral = deltaPct === undefined || Math.abs(deltaPct) < 0.05;
  const isGood = isInverseDelta ? !isPositive : isPositive;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${c.iconBg}`}>
          <Icon className={`w-4 h-4 ${c.iconText}`} />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {subValue && <span className="text-xs text-slate-500 font-medium">{subValue}</span>}
      </div>

      {deltaPct !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          {isNeutral ? (
            <span className="inline-flex items-center text-slate-500 font-medium">
              <Minus className="w-3.5 h-3.5 mr-0.5" /> 0.0%
            </span>
          ) : (
            <span
              className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {formatPct(deltaPct)}
            </span>
          )}
          <span className="text-slate-400 text-[11px] truncate">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
};
```

### 10.23 `src/components/ui/SampleDataBadge.tsx`
```tsx
import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { seedDatabase } from '../../db/seed';
import { RotateCcw, Database, AlertCircle, CheckCircle } from 'lucide-react';

export const SampleDataBadge: React.FC = () => {
  const { isSampleDataLoaded, isEdited, setMetaStatus } = useAppStore();
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await seedDatabase(true);
      setMetaStatus(true, false);
      setShowConfirm(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset sample data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Database className="w-3.5 h-3.5 text-amber-600" />
        <span>SAMPLE DATA MODE</span>
        {isEdited && (
          <span className="text-[10px] text-amber-600 font-normal border-l border-amber-300 pl-1.5">
            (Modified)
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isResetting}
        className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-md transition-colors"
        title="Reset all tables to standard 6-month deterministic seed data"
      >
        <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
        <span>Reset to Sample Data</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-semibold text-slate-900">Reset to Sample Data?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              This will overwrite any custom data, overrides, and daily logs with the default 6-month deterministic seed dataset (Apr 2026 – Sep 2026).
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-3.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isResetting}
                className="px-3.5 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 10.24 `src/components/layout/AppShell.tsx`
```tsx
import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

### 10.25 `src/components/layout/Sidebar.tsx`
```tsx
import React from 'react';
import { useAppStore, NavTab } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Activity,
  FileSpreadsheet,
  CircleDollarSign,
  Tag,
  Sliders,
  Download,
  Stethoscope,
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  sublabel?: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Executive Overview',
    sublabel: 'Consolidated KPIs & P&L',
    icon: LayoutDashboard,
  },
  {
    id: 'dialysis',
    label: 'Dialysis Slot Grid',
    sublabel: 'Shift booking & occupancy',
    icon: Activity,
  },
  {
    id: 'daily_entry',
    label: 'Daily Revenue Grid',
    sublabel: 'Multi-service spreadsheet',
    icon: FileSpreadsheet,
  },
  {
    id: 'financials',
    label: 'Financials & OPEX',
    sublabel: 'Cost buckets & payouts',
    icon: CircleDollarSign,
  },
  {
    id: 'rate_card',
    label: 'Rate Card & Payouts',
    sublabel: 'Catalog & branch overrides',
    icon: Tag,
  },
  {
    id: 'capacity',
    label: 'Capacity Log',
    sublabel: 'Machine & shift audit',
    icon: Sliders,
  },
  {
    id: 'export',
    label: 'Data Portability',
    sublabel: 'Excel, CSV, JSON state',
    icon: Download,
  },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/40">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-tight leading-tight">
            ClinicChain
          </h1>
          <p className="text-[11px] text-teal-400 font-medium">Diagnostics & Dialysis</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Management Console
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs leading-none">{item.label}</div>
                {item.sublabel && (
                  <div
                    className={`text-[10px] truncate mt-1 ${
                      isActive ? 'text-teal-100' : 'text-slate-500'
                    }`}
                  >
                    {item.sublabel}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 bg-slate-950/20">
        <div className="flex items-center justify-between mb-1">
          <span>Target FY:</span>
          <span className="text-slate-300 font-mono font-medium">2026–2027</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Engine Mode:</span>
          <span className="text-teal-400 font-medium">IndexedDB Local</span>
        </div>
      </div>
    </aside>
  );
};
```

### 10.26 `src/components/layout/TopBar.tsx`
```tsx
import React from 'react';
import { useAppStore, NavTab } from '../../store/useAppStore';
import { BranchSelector } from '../ui/BranchSelector';
import { DateRangePicker } from '../ui/DateRangePicker';
import { SampleDataBadge } from '../ui/SampleDataBadge';

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Executive Financial & Operational KPI Dashboard',
    subtitle: 'Consolidated multi-branch P&L, footfall, Sunday-safe occupancy & payouts',
  },
  dialysis: {
    title: 'Dialysis Shift Matrix & Occupancy Planner',
    subtitle: 'Interactive click-to-toggle booking grid with Sunday non-working lock',
  },
  daily_entry: {
    title: 'Daily Department Revenue & Footfall Entry',
    subtitle: 'Inline spreadsheet grid for real-time daily operational recording',
  },
  financials: {
    title: 'Monthly OPEX Cost Buckets & Doctor Payouts',
    subtitle: '6-bucket expense allocation with pro-rated daily calculations',
  },
  rate_card: {
    title: 'Service Catalog & Doctor Payout Configurator',
    subtitle: 'Master pricing, branch rate overrides & doctor revenue-share models',
  },
  capacity: {
    title: 'Dialysis Machine & Shift Capacity Logs',
    subtitle: 'Historical capacity timeline with strict retroactive calculation safeguards',
  },
  export: {
    title: 'Data Portability & Database State Operations',
    subtitle: 'Multi-tab Excel workbook, CSV export & complete JSON state migration',
  },
};

export const TopBar: React.FC = () => {
  const { activeTab } = useAppStore();
  const meta = TAB_TITLES[activeTab];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 shadow-xs">
      {/* Top row: Page title and Sample data badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
            {meta.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{meta.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <SampleDataBadge />
        </div>
      </div>

      {/* Bottom row: Global Controls (Branch Selector + Date Range Picker) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Branch:
          </span>
          <BranchSelector />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Period:
          </span>
          <DateRangePicker />
        </div>
      </div>
    </header>
  );
};
```

### 10.27 `src/components/charts/chartSetup.ts`
```ts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
```

### 10.28 `src/components/charts/CostBreakdownDonut.tsx`
```tsx
import React from 'react';
import './chartSetup';
import { Doughnut } from 'react-chartjs-2';
import { formatINR } from '../../utils/formatters';

interface CostBreakdownDonutProps {
  rent: number;
  electricity: number;
  staffing: number;
  consumables: number;
  licensing: number;
  other: number;
  doctorPayouts: number;
}

export const CostBreakdownDonut: React.FC<CostBreakdownDonutProps> = ({
  rent,
  electricity,
  staffing,
  consumables,
  licensing,
  other,
  doctorPayouts,
}) => {
  const total = rent + electricity + staffing + consumables + licensing + other + doctorPayouts;

  const data = {
    labels: [
      'Staffing',
      'Rent',
      'Consumables',
      'Doctor Payouts',
      'Electricity',
      'Licensing',
      'Other OPEX',
    ],
    datasets: [
      {
        data: [staffing, rent, consumables, doctorPayouts, electricity, licensing, other],
        backgroundColor: [
          '#0284c7', // Sky 600 - Staffing
          '#4f46e5', // Indigo 600 - Rent
          '#d97706', // Amber 600 - Consumables
          '#10b981', // Emerald 500 - Doctor Payouts
          '#ea580c', // Orange 600 - Electricity
          '#8b5cf6', // Violet 500 - Licensing
          '#64748b', // Slate 500 - Other
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: { size: 11, family: 'Inter, sans-serif' },
          generateLabels: (chart: any) => {
            const dataObj = chart.data;
            if (dataObj.labels.length && dataObj.datasets.length) {
              return dataObj.labels.map((label: string, i: number) => {
                const value = dataObj.datasets[0].data[i];
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return {
                  text: `${label} (${pct}%)`,
                  fillStyle: dataObj.datasets[0].backgroundColor[i],
                  strokeStyle: '#ffffff',
                  lineWidth: 1,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${formatINR(val)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Cost Structure Breakdown</h3>
          <p className="text-xs text-slate-500">6 OPEX buckets + dynamic doctor payouts</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Cost</span>
          <p className="text-base font-bold text-slate-900 leading-none mt-0.5">
            {formatINR(total, true)}
          </p>
        </div>
      </div>
      <div className="h-64 w-full relative flex items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};
```

### 10.29 `src/components/charts/FootfallByDeptBar.tsx`
```tsx
import React from 'react';
import './chartSetup';
import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../../utils/formatters';

interface FootfallByDeptProps {
  deptFootfall: {
    department: string;
    count: number;
    color: string;
  }[];
}

export const FootfallByDeptBar: React.FC<FootfallByDeptProps> = ({ deptFootfall }) => {
  const data = {
    labels: deptFootfall.map((d) => d.department),
    datasets: [
      {
        label: 'Patients / Sessions',
        data: deptFootfall.map((d) => d.count),
        backgroundColor: deptFootfall.map((d) => d.color),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${formatNumber(context.raw)} patients`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10, family: 'Inter, sans-serif' } },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter, sans-serif', weight: 'bold' as const } },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Patient Volume by Department</h3>
          <p className="text-xs text-slate-500">Total clinical patient encounters</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
```

### 10.30 `src/components/charts/OccupancyTrendLine.tsx`
```tsx
import React from 'react';
import './chartSetup';
import { Line } from 'react-chartjs-2';
import { formatPct } from '../../utils/formatters';

interface OccupancyTrendLineProps {
  trendData: {
    dateLabel: string;
    occupancyPct: number;
    occupiedSlots: number;
    availableSlots: number;
  }[];
}

export const OccupancyTrendLine: React.FC<OccupancyTrendLineProps> = ({ trendData }) => {
  const data = {
    labels: trendData.map((d) => d.dateLabel),
    datasets: [
      {
        label: 'Dialysis Occupancy %',
        data: trendData.map((d) => d.occupancyPct),
        borderColor: '#0d9488', // teal-600
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const idx = context.dataIndex;
            const item = trendData[idx];
            return [
              ` Occupancy: ${formatPct(item.occupancyPct, false)}`,
              ` Occupied: ${item.occupiedSlots} slots`,
              ` Available: ${item.availableSlots} slots (Excl. Sundays)`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, family: 'Inter, sans-serif' }, maxTicksLimit: 12 },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 11, family: 'Inter, sans-serif' },
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Dialysis Occupancy Trend</h3>
          <p className="text-xs text-slate-500">
            Weekly trajectory (Sundays strictly excluded from denominator)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
          <span className="text-xs font-semibold text-teal-800">Capacity %</span>
        </div>
      </div>
      <div className="h-64 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
```

### 10.31 `src/components/charts/ProfitWaterfallChart.tsx`
```tsx
import React from 'react';
import './chartSetup';
import { Bar } from 'react-chartjs-2';
import { formatINR } from '../../utils/formatters';

interface ProfitWaterfallProps {
  grossRevenue: number;
  fixedOpex: number;
  doctorPayouts: number;
  netProfit: number;
}

export const ProfitWaterfallChart: React.FC<ProfitWaterfallProps> = ({
  grossRevenue,
  fixedOpex,
  doctorPayouts,
  netProfit,
}) => {
  const data = {
    labels: ['Gross Revenue', 'Monthly OPEX', 'Doctor Payouts', 'Net Profit'],
    datasets: [
      {
        label: 'Financial Flow',
        data: [grossRevenue, -fixedOpex, -doctorPayouts, netProfit],
        backgroundColor: [
          '#0d9488', // teal-600 - Revenue
          '#ef4444', // red-500 - OPEX
          '#f59e0b', // amber-500 - Doctor Payout
          netProfit >= 0 ? '#10b981' : '#dc2626', // emerald or red - Profit
        ],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const raw = context.raw || 0;
            return ` ${context.label}: ${formatINR(raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter, sans-serif' } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 10, family: 'Inter, sans-serif' },
          callback: (value: any) => formatINR(Number(value), true),
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">P&L Waterfall Bridge</h3>
          <p className="text-xs text-slate-500">Gross revenue minus operating expenditures and doctor fees</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Net Result</span>
          <p
            className={`text-base font-bold leading-none mt-0.5 ${
              netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatINR(netProfit, true)}
          </p>
        </div>
      </div>
      <div className="h-64 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
```

### 10.32 `src/components/charts/RevenueBarChart.tsx`
```tsx
import React from 'react';
import './chartSetup';
import { Bar } from 'react-chartjs-2';
import { formatINR } from '../../utils/formatters';

interface RevenueBarChartProps {
  monthlyData: {
    month: string;
    dialysis: number;
    bloodTest: number;
    xray: number;
    usg: number;
    physio: number;
    consultation: number;
  }[];
}

export const RevenueBarChart: React.FC<RevenueBarChartProps> = ({ monthlyData }) => {
  const labels = monthlyData.map((d) => d.month);

  const data = {
    labels,
    datasets: [
      {
        label: 'Dialysis',
        data: monthlyData.map((d) => d.dialysis),
        backgroundColor: '#0d9488', // teal-600
        borderRadius: 4,
      },
      {
        label: 'Blood Tests',
        data: monthlyData.map((d) => d.bloodTest),
        backgroundColor: '#f43f5e', // rose-500
        borderRadius: 4,
      },
      {
        label: 'X-Ray',
        data: monthlyData.map((d) => d.xray),
        backgroundColor: '#3b82f6', // blue-500
        borderRadius: 4,
      },
      {
        label: 'USG / Doppler',
        data: monthlyData.map((d) => d.usg),
        backgroundColor: '#8b5cf6', // purple-500
        borderRadius: 4,
      },
      {
        label: 'Physiotherapy',
        data: monthlyData.map((d) => d.physio),
        backgroundColor: '#f59e0b', // amber-500
        borderRadius: 4,
      },
      {
        label: 'Consultation',
        data: monthlyData.map((d) => d.consultation),
        backgroundColor: '#10b981', // emerald-500
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { size: 11, family: 'Inter, sans-serif' },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            return ` ${context.dataset.label}: ${formatINR(val)}`;
          },
          footer: (tooltipItems: any[]) => {
            let sum = 0;
            tooltipItems.forEach((item) => {
              sum += item.parsed.y || 0;
            });
            return `Total: ${formatINR(sum)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter, sans-serif' } },
      },
      y: {
        stacked: true,
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 11, family: 'Inter, sans-serif' },
          callback: (value: any) => formatINR(Number(value), true),
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Monthly Revenue by Department</h3>
          <p className="text-xs text-slate-500">Stacked distribution across clinical service units</p>
        </div>
      </div>
      <div className="h-72 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
```


### 10.33 `src/pages/Dashboard.tsx`
```tsx
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
```

### 10.34 `src/pages/Dialysis.tsx`
```tsx
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
} from '../types/schema';
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
  const { branchId, setBranchId } = useAppStore();

  // If ALL branches selected globally, default to Dar ul Shifa for slot-level matrix
  const activeBranchId: BranchId =
    branchId === 'ALL' ? 'br_dar_ul_shifa' : (branchId as BranchId);

  // Month navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date('2026-04-01T00:00:00'));

  // Live data
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const capacityLogs = useLiveQuery(() => db.capacityLogs.toArray(), []);
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
  };

  return (
    <div className="space-y-6">
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
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="br_dar_ul_shifa">🏥 Dar ul Shifa (DUS)</option>
            <option value="br_saifee_diag">🔬 Saifee Diagnostics Center (SDC)</option>
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
```

### 10.35 `src/pages/DailyEntry.tsx`
```tsx
import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { ServiceCatalogItem, DailyDepartmentEntry, BranchId } from '../types/schema';
import { formatINR, formatNumber } from '../utils/formatters';
import { parseISO, getDay, format } from 'date-fns';
import {
  Calendar,
  Building,
  Save,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';

export const DailyEntry: React.FC = () => {
  const { branchId, setBranchId } = useAppStore();

  const activeBranchId: BranchId =
    branchId === 'ALL' ? 'br_dar_ul_shifa' : (branchId as BranchId);

  // Selected Date state
  const [selectedDate, setSelectedDate] = useState<string>('2026-04-15');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live queries
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const catalog = useLiveQuery(() => db.serviceCatalog.toArray(), []);
  const rateOverrides = useLiveQuery(
    () => db.rateOverrides.where('branchId').equals(activeBranchId).toArray(),
    [activeBranchId]
  );
  const existingEntries = useLiveQuery(
    () =>
      db.dailyEntries
        .where('[branchId+date]')
        .equals([activeBranchId, selectedDate])
        .toArray(),
    [activeBranchId, selectedDate]
  );

  const isSunday = useMemo(() => {
    return getDay(parseISO(selectedDate)) === 0;
  }, [selectedDate]);

  // Non-dialysis catalog items
  const nonDialysisServices = useMemo(() => {
    if (!catalog) return [];
    return catalog.filter((c) => c.department !== 'DIALYSIS' && c.isActive);
  }, [catalog]);

  // Working state for counts in the grid
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Sync counts from DB when date or branch changes
  React.useEffect(() => {
    if (existingEntries) {
      const initialCounts: Record<string, number> = {};
      existingEntries.forEach((entry) => {
        initialCounts[entry.serviceId] = entry.patientCount;
      });
      setCounts(initialCounts);
    }
  }, [existingEntries]);

  // Lookup rate and payout model for each service
  const getServiceInfo = (service: ServiceCatalogItem) => {
    const override = rateOverrides?.find((o) => o.serviceId === service.id);
    const rate = override?.overrideRate ?? service.defaultRate;
    const payoutModel = override?.overridePayoutModel ?? service.payoutModel;
    const revSharePct = override?.overrideRevSharePct ?? service.defaultRevSharePct;
    return { rate, payoutModel, revSharePct };
  };

  const handleCountChange = (serviceId: string, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setCounts((prev) => ({ ...prev, [serviceId]: num }));
  };

  // Compute daily totals
  const dailyTotals = useMemo(() => {
    let totalPatients = 0;
    let totalRevenue = 0;
    let totalDocPayout = 0;

    nonDialysisServices.forEach((srv) => {
      const count = counts[srv.id] || 0;
      const { rate, payoutModel, revSharePct } = getServiceInfo(srv);
      const rev = count * rate;
      let docPayout = 0;
      if (
        srv.department === 'CONSULTATION' &&
        (payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID')
      ) {
        docPayout = Math.round(rev * (revSharePct / 100));
      }

      totalPatients += count;
      totalRevenue += rev;
      totalDocPayout += docPayout;
    });

    return { totalPatients, totalRevenue, totalDocPayout };
  }, [nonDialysisServices, counts, rateOverrides]);

  // Save all row values to IndexedDB
  const handleSaveAll = async () => {
    const recordsToPut: DailyDepartmentEntry[] = [];

    nonDialysisServices.forEach((srv) => {
      const count = counts[srv.id] || 0;
      const { rate, payoutModel, revSharePct } = getServiceInfo(srv);
      const rev = count * rate;
      const docPayout =
        srv.department === 'CONSULTATION' &&
        (payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID')
          ? Math.round(rev * (revSharePct / 100))
          : 0;

      recordsToPut.push({
        id: `${activeBranchId}_${selectedDate}_${srv.id}`,
        branchId: activeBranchId,
        date: selectedDate,
        department: srv.department,
        serviceId: srv.id,
        patientCount: count,
        rate,
        revenue: rev,
        doctorVariablePayout: docPayout,
      });
    });

    await db.dailyEntries.bulkPut(recordsToPut);
    await db.meta.put({ key: 'isEdited', value: true });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Branch selector */}
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-600" />
            <select
              value={activeBranchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800"
            >
              <option value="br_dar_ul_shifa">🏥 Dar ul Shifa (DUS)</option>
              <option value="br_saifee_diag">🔬 Saifee Diagnostics Center (SDC)</option>
            </select>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Entry Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-pulse">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Saved to IndexedDB!
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Spreadsheet Entries</span>
          </button>
        </div>
      </div>

      {/* Sunday Warning Alert */}
      {isSunday && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3 text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Sunday Non-Working Day:</span> Sunday entries are not part of routine baseline schedules. Any entries logged here will reflect in the financial ledger, but dialysis capacity excludes Sundays.
          </div>
        </div>
      )}

      {/* Daily Totals Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Total Patients / Tests Logged
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatNumber(dailyTotals.totalPatients)}
          </p>
          <span className="text-xs text-slate-400">Excludes dialysis sessions</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Gross Department Revenue
          </span>
          <p className="text-2xl font-bold text-teal-700 mt-1">
            {formatINR(dailyTotals.totalRevenue)}
          </p>
          <span className="text-xs text-slate-400">Sum of patient counts × applied rates</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Doctor Share Variable Payout
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {formatINR(dailyTotals.totalDocPayout)}
          </p>
          <span className="text-xs text-slate-400">Auto-allocated to consulting specialists</span>
        </div>
      </div>

      {/* Inline Spreadsheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Diagnostic & Clinical Services Sheet ({format(parseISO(selectedDate), 'EEEE, dd MMMM yyyy')})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Edit patient counts inline — revenue updates dynamically
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Payout Model</th>
                <th className="px-4 py-3 text-right">Applied Rate</th>
                <th className="px-4 py-3 text-center w-36">Patient Count</th>
                <th className="px-4 py-3 text-right">Gross Revenue</th>
                <th className="px-4 py-3 text-right">Doctor Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nonDialysisServices.map((srv) => {
                const count = counts[srv.id] || 0;
                const { rate, payoutModel, revSharePct } = getServiceInfo(srv);
                const revenue = count * rate;
                const docPayout =
                  srv.department === 'CONSULTATION' &&
                  (payoutModel === 'REVENUE_SHARE' || payoutModel === 'HYBRID')
                    ? Math.round(revenue * (revSharePct / 100))
                    : 0;

                const deptColorMap: Record<string, string> = {
                  BLOOD_TEST: 'bg-rose-50 text-rose-700 border-rose-200',
                  XRAY: 'bg-blue-50 text-blue-700 border-blue-200',
                  USG: 'bg-purple-50 text-purple-700 border-purple-200',
                  PHYSIO: 'bg-amber-50 text-amber-700 border-amber-200',
                  CONSULTATION: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                };

                return (
                  <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          deptColorMap[srv.department] || 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        {srv.department.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      {srv.name}
                      {srv.subCategory && (
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          ({srv.subCategory})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {srv.department === 'CONSULTATION' ? (
                        <span className="text-[11px] font-medium text-slate-700">
                          {payoutModel} ({revSharePct}%)
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-800">
                      {formatINR(rate)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) => handleCountChange(srv.id, e.target.value)}
                        className="w-24 text-center py-1 px-2 border border-slate-300 rounded-md font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                      {formatINR(revenue)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-amber-600">
                      {docPayout > 0 ? formatINR(docPayout) : '—'}
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
```

### 10.36 `src/pages/Financials.tsx`
```tsx
import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { MonthlyCostRecord, BranchId } from '../types/schema';
import { formatINR, formatPct } from '../utils/formatters';
import { parseISO, format, getDaysInMonth, getDay } from 'date-fns';
import {
  CircleDollarSign,
  Building,
  Save,
  CheckCircle,
  FileText,
  Calculator,
  Percent,
} from 'lucide-react';

export const Financials: React.FC = () => {
  const { branchId, setBranchId } = useAppStore();

  const activeBranchId: BranchId =
    branchId === 'ALL' ? 'br_dar_ul_shifa' : (branchId as BranchId);

  // Month selector state for OPEX editing
  const [selectedYm, setSelectedYm] = useState<string>('2026-04');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live queries
  const branches = useLiveQuery(() => db.branches.toArray(), []);
  const monthlyCosts = useLiveQuery(() => db.monthlyCosts.toArray(), []);
  const dailyEntries = useLiveQuery(() => db.dailyEntries.toArray(), []);
  const dialysisSlots = useLiveQuery(() => db.dialysisSlots.toArray(), []);
  const catalog = useLiveQuery(() => db.serviceCatalog.toArray(), []);
  const rateOverrides = useLiveQuery(() => db.rateOverrides.toArray(), []);

  // Current record being edited
  const currentCostRecord = useMemo(() => {
    return (
      monthlyCosts?.find(
        (c) => c.branchId === activeBranchId && c.yearMonth === selectedYm
      ) ?? {
        id: `${activeBranchId}_${selectedYm}`,
        branchId: activeBranchId,
        yearMonth: selectedYm,
        rent: 140000,
        electricity: 40000,
        staffing: 200000,
        consumables: 100000,
        licensing: 15000,
        other: 15000,
        fixedOpeXTotal: 510000,
      }
    );
  }, [monthlyCosts, activeBranchId, selectedYm]);

  // Form state
  const [formState, setFormState] = useState({
    rent: currentCostRecord.rent,
    electricity: currentCostRecord.electricity,
    staffing: currentCostRecord.staffing,
    consumables: currentCostRecord.consumables,
    licensing: currentCostRecord.licensing,
    other: currentCostRecord.other,
  });

  React.useEffect(() => {
    setFormState({
      rent: currentCostRecord.rent,
      electricity: currentCostRecord.electricity,
      staffing: currentCostRecord.staffing,
      consumables: currentCostRecord.consumables,
      licensing: currentCostRecord.licensing,
      other: currentCostRecord.other,
    });
  }, [currentCostRecord]);

  const handleInputChange = (field: keyof typeof formState, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setFormState((prev) => ({ ...prev, [field]: num }));
  };

  const calculatedOpexTotal =
    formState.rent +
    formState.electricity +
    formState.staffing +
    formState.consumables +
    formState.licensing +
    formState.other;

  const handleSaveOpex = async () => {
    const updated: MonthlyCostRecord = {
      id: `${activeBranchId}_${selectedYm}`,
      branchId: activeBranchId,
      yearMonth: selectedYm,
      rent: formState.rent,
      electricity: formState.electricity,
      staffing: formState.staffing,
      consumables: formState.consumables,
      licensing: formState.licensing,
      other: formState.other,
      fixedOpeXTotal: calculatedOpexTotal,
    };

    await db.monthlyCosts.put(updated);
    await db.meta.put({ key: 'isEdited', value: true });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Comprehensive 6-month P&L table
  const pnlSummary = useMemo(() => {
    if (!branches || !monthlyCosts || !dailyEntries || !dialysisSlots || !catalog || !rateOverrides) {
      return [];
    }

    const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
    const activeBranchList =
      branchId === 'ALL' ? branches : branches.filter((b) => b.id === branchId);

    const rows: {
      yearMonth: string;
      branchName: string;
      branchCode: string;
      dialysisRev: number;
      deptRev: number;
      grossRev: number;
      fixedOpex: number;
      doctorPayouts: number;
      totalCost: number;
      netProfit: number;
      marginPct: number;
    }[] = [];

    months.forEach((ym) => {
      activeBranchList.forEach((br) => {
        // Dialysis revenue (excluding Sundays)
        const dialRev = dialysisSlots
          .filter(
            (s) =>
              s.branchId === br.id &&
              s.date.startsWith(ym) &&
              s.isOccupied &&
              getDay(parseISO(s.date)) !== 0
          )
          .reduce((sum, s) => sum + s.appliedRate, 0);

        // Non-dialysis revenue and variable doctor payouts
        const dEntries = dailyEntries.filter(
          (e) => e.branchId === br.id && e.date.startsWith(ym)
        );
        const deptRev = dEntries.reduce((sum, e) => sum + e.revenue, 0);
        const variableDoc = dEntries.reduce(
          (sum, e) => sum + (e.doctorVariablePayout || 0),
          0
        );

        // Fixed doctor monthly fees
        let fixedDoc = 0;
        const consults = catalog.filter((c) => c.department === 'CONSULTATION');
        consults.forEach((srv) => {
          const ov = rateOverrides.find(
            (o) => o.branchId === br.id && o.serviceId === srv.id
          );
          const model = ov?.overridePayoutModel ?? srv.payoutModel;
          const fee = ov?.overrideFixedMonthlyFee ?? srv.defaultFixedMonthlyFee;
          if (model === 'FIXED_MONTHLY' || model === 'HYBRID') {
            fixedDoc += fee;
          }
        });

        // Fixed OPEX
        const costRec = monthlyCosts.find(
          (c) => c.branchId === br.id && c.yearMonth === ym
        );
        const fixedOpex = costRec?.fixedOpeXTotal ?? 0;

        const grossRev = dialRev + deptRev;
        const totalDoc = variableDoc + fixedDoc;
        const totalCost = fixedOpex + totalDoc;
        const netProfit = grossRev - totalCost;
        const marginPct = grossRev > 0 ? (netProfit / grossRev) * 100 : 0;

        rows.push({
          yearMonth: ym,
          branchName: br.name,
          branchCode: br.code,
          dialysisRev: dialRev,
          deptRev,
          grossRev,
          fixedOpex,
          doctorPayouts: totalDoc,
          totalCost,
          netProfit,
          marginPct,
        });
      });
    });

    return rows;
  }, [branches, branchId, monthlyCosts, dailyEntries, dialysisSlots, catalog, rateOverrides]);

  return (
    <div className="space-y-6">
      {/* OPEX Editor Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-teal-600" />
              Monthly OPEX Budget & Allocation Form
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure the 6 standard monthly operating expense buckets for pro-rated calculations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Selector */}
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" />
              <select
                value={activeBranchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="br_dar_ul_shifa">🏥 Dar ul Shifa (DUS)</option>
                <option value="br_saifee_diag">🔬 Saifee Diagnostics Center (SDC)</option>
              </select>
            </div>

            {/* Month Selector */}
            <select
              value={selectedYm}
              onChange={(e) => setSelectedYm(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="2026-04">April 2026</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-09">September 2026</option>
            </select>

            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Saved!
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveOpex}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save OPEX Sheet</span>
            </button>
          </div>
        </div>

        {/* 6 Input Buckets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              1. Facility Rent (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.rent}
              onChange={(e) => handleInputChange('rent', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              2. Electricity & Power (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.electricity}
              onChange={(e) => handleInputChange('electricity', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              3. Nursing & Staffing (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.staffing}
              onChange={(e) => handleInputChange('staffing', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              4. Consumables (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.consumables}
              onChange={(e) => handleInputChange('consumables', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              5. Licensing & Compliance (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.licensing}
              onChange={(e) => handleInputChange('licensing', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              6. Other General OPEX (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formState.other}
              onChange={(e) => handleInputChange('other', e.target.value)}
              className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Total Banner */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Total Fixed Monthly OPEX (6 Buckets):
          </span>
          <span className="text-lg font-bold text-slate-900">
            {formatINR(calculatedOpexTotal)}
          </span>
        </div>
      </div>

      {/* 6-Month P&L Master Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Consolidated 6-Month P&L Ledger (April 2026 – September 2026)
            </h3>
            <p className="text-xs text-slate-500">
              Complete breakdown including Dialysis, Granular Diagnostics, Monthly OPEX, and Doctor Payouts
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3 text-right">Dialysis Rev</th>
                <th className="px-4 py-3 text-right">Dept Rev</th>
                <th className="px-4 py-3 text-right font-bold text-slate-900">Gross Rev</th>
                <th className="px-4 py-3 text-right">Fixed OPEX</th>
                <th className="px-4 py-3 text-right text-amber-600">Doctor Payouts</th>
                <th className="px-4 py-3 text-right font-bold text-rose-700">Total Cost</th>
                <th className="px-4 py-3 text-right font-bold">Net Profit</th>
                <th className="px-4 py-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pnlSummary.map((row, idx) => {
                const isProfitable = row.netProfit >= 0;
                return (
                  <tr key={`${row.yearMonth}_${row.branchCode}_${idx}`} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 font-bold text-slate-800">
                      {format(parseISO(`${row.yearMonth}-01`), 'MMM yyyy')}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-700">
                      {row.branchName} ({row.branchCode})
                    </td>
                    <td className="px-4 py-2.5 text-right text-teal-700">
                      {formatINR(row.dialysisRev)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700">
                      {formatINR(row.deptRev)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                      {formatINR(row.grossRev)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-600">
                      {formatINR(row.fixedOpex)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-amber-600">
                      {formatINR(row.doctorPayouts)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-rose-700">
                      {formatINR(row.totalCost)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-bold ${
                        isProfitable ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatINR(row.netProfit)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-semibold ${
                        isProfitable ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatPct(row.marginPct, false)}
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
```

### 10.37 `src/pages/RateCard.tsx`
```tsx
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
```

### 10.38 `src/pages/Settings.tsx`
```tsx
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { DialysisCapacityLog, BranchId } from '../types/schema';
import {
  Sliders,
  Plus,
  Trash2,
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
  History,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const Settings: React.FC = () => {
  const capacityLogs = useLiveQuery(() => db.capacityLogs.toArray(), []);
  const branches = useLiveQuery(() => db.branches.toArray(), []);

  // Form state
  const [branchId, setBranchId] = useState<BranchId>('br_dar_ul_shifa');
  const [effectiveFrom, setEffectiveFrom] = useState('2026-10-01');
  const [machineCount, setMachineCount] = useState<number>(6);
  const [slotsPerMachine, setSlotsPerMachine] = useState<number>(2);
  const [note, setNote] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

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

    const id = `${branchId}_${effectiveFrom}`;
    const logRecord: DialysisCapacityLog = {
      id,
      branchId,
      effectiveFrom,
      machineCount: Number(machineCount),
      slotsPerMachine: Number(slotsPerMachine),
      note: note.trim() || 'Capacity update',
    };

    try {
      await db.capacityLogs.put(logRecord);
      await db.meta.put({ key: 'isEdited', value: true });
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
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
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
      </div>

      {/* Add New Capacity Record Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-600" />
          Record New Capacity Expansion or Machine Fleet Change
        </h4>

        {statusMsg && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleAddLog} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value as BranchId)}
              className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
            >
              <option value="br_dar_ul_shifa">🏥 Dar ul Shifa (DUS)</option>
              <option value="br_saifee_diag">🔬 Saifee Diagnostics Center (SDC)</option>
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors shrink-0"
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
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
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
```

### 10.39 `src/pages/DataExport.tsx`
```tsx
import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import {
  exportFullExcelWorkbook,
  exportDailyEntriesCsv,
  triggerJsonBackupDownload,
} from '../engine/exportEngine';
import { seedDatabase } from '../db/seed';
import { useAppStore } from '../store/useAppStore';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Database,
  CheckCircle,
  AlertCircle,
  FileText,
  Table,
} from 'lucide-react';

export const DataExport: React.FC = () => {
  const { setMetaStatus } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Table counts for audit overview
  const branchCount = useLiveQuery(() => db.branches.count());
  const catalogCount = useLiveQuery(() => db.serviceCatalog.count());
  const overrideCount = useLiveQuery(() => db.rateOverrides.count());
  const dailyCount = useLiveQuery(() => db.dailyEntries.count());
  const slotCount = useLiveQuery(() => db.dialysisSlots.count());
  const costCount = useLiveQuery(() => db.monthlyCosts.count());
  const capacityCount = useLiveQuery(() => db.capacityLogs.count());

  const handleExportExcel = async () => {
    setLoadingAction('excel');
    try {
      await exportFullExcelWorkbook();
      setFeedback({ type: 'success', message: 'Multi-tab Excel workbook generated and downloaded!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to generate Excel file.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportCsv = async () => {
    setLoadingAction('csv');
    try {
      await exportDailyEntriesCsv();
      setFeedback({ type: 'success', message: 'Daily department entries CSV downloaded successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export CSV.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportJson = async () => {
    setLoadingAction('json');
    try {
      await triggerJsonBackupDownload();
      setFeedback({ type: 'success', message: 'Full database JSON backup snapshot downloaded!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export JSON backup.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingAction('import');
    try {
      const text = await file.text();
      await db.restoreFromJsonBackup(text);
      setMetaStatus(true, true);
      setFeedback({
        type: 'success',
        message: 'Successfully restored all IndexedDB tables from backup JSON! Refreshing view...',
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Restore failed: ${err?.message || 'Invalid or corrupted JSON backup file.'}`,
      });
    } finally {
      setLoadingAction(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetSample = async () => {
    setLoadingAction('reset');
    try {
      await seedDatabase(true);
      setMetaStatus(true, false);
      setFeedback({
        type: 'success',
        message: 'Database reset to default 6-month deterministic seed dataset! Refreshing view...',
      });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to reset sample data.' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Database Live Audit Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Local Browser IndexedDB Inventory (`Dexie.js`)
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Branches</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{branchCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Service Items</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{catalogCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Branch Overrides</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{overrideCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Daily Dept Logs</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{dailyCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Dialysis Slots</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{slotCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Monthly Costs</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{costCount ?? '—'}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Capacity Logs</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{capacityCount ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Export / Backup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Multi-tab Excel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Export Full Excel Workbook</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Generates a 6-tab `.xlsx` file containing Branches, Rate Card, Overrides, Monthly OPEX, Daily Department Revenue, and Dialysis Sessions.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={loadingAction === 'excel'}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{loadingAction === 'excel' ? 'Exporting...' : 'Download .xlsx'}</span>
          </button>
        </div>

        {/* 2. CSV Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Export Daily Revenue CSV</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Extracts granular daily clinical test encounters, patient footfall, applied rates, and doctor payouts as clean `.csv` records.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={loadingAction === 'csv'}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{loadingAction === 'csv' ? 'Exporting...' : 'Download .csv'}</span>
          </button>
        </div>

        {/* 3. JSON Backup State */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Full State Backup (JSON)</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Dumps 100% of the IndexedDB state into a portable `.json` file for zero-data-loss backup, device migration, or offline archiving.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportJson}
            disabled={loadingAction === 'json'}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{loadingAction === 'json' ? 'Dumping...' : 'Export JSON State'}</span>
          </button>
        </div>

        {/* 4. JSON Restore State */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Restore State (JSON)</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Select a previously exported `.json` file. Validates schema and bulk-reloads all 8 tables directly into IndexedDB.
            </p>
          </div>
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            onChange={handleImportJsonFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loadingAction === 'import'}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>{loadingAction === 'import' ? 'Validating...' : 'Select JSON to Restore'}</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Seed Reset */}
      <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              Reset Database to Initial 6-Month Seed Data
            </h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Overwrites all edits and reverts to the default deterministic dataset covering April 1, 2026 to September 30, 2026.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetSample}
            disabled={loadingAction === 'reset'}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loadingAction === 'reset' ? 'animate-spin' : ''}`} />
            <span>{loadingAction === 'reset' ? 'Resetting...' : 'Reset to Sample Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

# 11. LIMITATIONS AND NEXT STEPS

### 11.1 Known Technical Limitations
1. **Single-Browser Isolation:** All data lives inside the browser's IndexedDB. If an administrator opens the application in a different browser (e.g., Firefox instead of Chrome) or on a different physical computer, the database will initialize from scratch with the deterministic seed data unless a JSON backup is imported.
2. **Browser Storage Clearing Risk:** If a user performs a "Clear All Browsing Data" action including IndexedDB/site data, the custom records will be purged. Mitigation: Periodic JSON state backups via `DataExport.tsx`.
3. **No Patient PII / Appointment Slot Scheduling:** Slots are marked as occupied (`isOccupied: true`) with applied rates, but do not record patient names, medical record numbers (MRN), or diagnostic reports.

### 11.2 Recommended Next Steps & Roadmap
1. **P2P Syncing via WebRTC / CRDTs:** Implement Yjs or Automerge over WebRTC to allow local multi-device synchronization across clinic reception and nursing stations without requiring a centralized cloud database.
2. **Shift-Specific Pricing Modifiers:** Leverage `DialysisSlotType` (`EMERGENCY`, `SINGLE_USE`) and `BranchRateOverride.emergencyRateSurcharge` in the matrix UI to allow shift-based night surcharge calculations.
3. **Bi-Directional Excel Import:** Currently, Excel export is supported (`.xlsx`). Adding a SheetJS file drop reader to parse external diagnostic lab equipment CSVs directly into `DailyDepartmentEntry` records would eliminate manual spreadsheet data entry.

---

# 12. REPLICATION CHECKLIST

Follow this checklist to rebuild the project from zero in under 10 minutes:

- [ ] **Step 1:** Initialize an empty folder and create `package.json` with dependencies matching Section 10.1.
- [ ] **Step 2:** Run `npm install` to download dependencies.
- [ ] **Step 3:** Create configuration files: `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `.gitignore`.
- [ ] **Step 4:** Create `src/types/schema.ts` with all 8 database interfaces.
- [ ] **Step 5:** Create `src/db/database.ts` (Dexie class) and `src/db/seed.ts` (Mulberry32 seed generator).
- [ ] **Step 6:** Create `src/utils/formatters.ts` (`formatINR`, `formatPct`, `formatNumber`).
- [ ] **Step 7:** Create `src/engine/financialEngine.ts` and `src/engine/exportEngine.ts`.
- [ ] **Step 8:** Create `src/store/useAppStore.ts` (Zustand store).
- [ ] **Step 9:** Create `src/index.css`, `src/App.tsx`, and `src/main.tsx`.
- [ ] **Step 10:** Create UI primitives in `src/components/ui/` (`KpiCard.tsx`, `BranchSelector.tsx`, `DateRangePicker.tsx`, `SampleDataBadge.tsx`).
- [ ] **Step 11:** Create layout components in `src/components/layout/` (`AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`).
- [ ] **Step 12:** Create Chart components in `src/components/charts/` (`chartSetup.ts`, and the 5 chart visualizers).
- [ ] **Step 13:** Create all 7 pages in `src/pages/` (`Dashboard.tsx`, `Dialysis.tsx`, `DailyEntry.tsx`, `Financials.tsx`, `RateCard.tsx`, `Settings.tsx`, `DataExport.tsx`).
- [ ] **Step 14:** Create `.github/workflows/deploy.yml` with `enablement: true` and `node-version: 24`.
- [ ] **Step 15:** Run `npm run build` to verify zero TypeScript errors and confirm production chunk splitting.
- [ ] **Step 16:** Run `npm run dev` and navigate to `http://localhost:5173/clinic-dashboard/` to verify local operation and seed data initialization.
