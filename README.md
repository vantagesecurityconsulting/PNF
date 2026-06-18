# ShuttleLog — Park'N Fly Halifax Edition

A full-stack **concept / prototype** for shuttle trip logging and fleet operations
at Park'N Fly Halifax (YHZ). Built to communicate the complete product vision to
stakeholders and to the developers who will later wire it to an **Airtable** backend.

> All data is mock/seed data held in a Zustand store — there is **no backend yet**.
> Every point where a real Airtable API call will go is marked with an
> `// AIRTABLE:` comment.

## Two interfaces

| Interface | Route | Optimized for | Purpose |
|-----------|-------|---------------|---------|
| **Driver App** | `/driver` | Tablet (768px) | In-bus trip logging, pre-trip inspections, end-of-shift PDF reports |
| **Manager Dashboard** | `/manager` | Desktop (1280px+) | Live fleet status, trip history, driver roster, analytics, PDF reports |

A landing page at `/` lets you jump into either interface.

## Getting started

```bash
npm install
npm run dev
```

Then open:
- `http://localhost:5173/driver` — Driver tablet app
- `http://localhost:5173/manager` — Manager dashboard

```bash
npm run build    # production build
npm run preview  # preview the production build
```

## Tech stack

- **React** (Vite) + **React Router v6**
- **Tailwind CSS** (brand design system in `tailwind.config.js` / `src/index.css`)
- **Zustand** for state (`src/store/`) — simulates what Airtable will provide
- **Recharts** for dashboard charts
- **jsPDF** + **jsPDF-AutoTable** for PDF report generation (`src/utils/pdfGenerator.js`)
- **Lucide React** for icons

## Project structure

```
src/
  components/
    driver/    DriverLayout (bottom tab bar)
    manager/   ManagerLayout (collapsible sidebar)
    shared/    Button, Badge, Card, Modal, SlideOver, Toast, KpiCard,
               DataTable, BigButton, PassengerCounter, InspectionToggle,
               TripStatusStrip, VehicleCard, DriverAvatar, ProgressBar, Logo …
  pages/
    driver/    DriverApp, TripLog, Inspection, DriverTrips, EndShift
    manager/   Dashboard, Trips, Fleet, Drivers, DriverDetail, Reports, Settings
  store/       useShiftStore (driver), useManagerStore, useToastStore
  data/        mockDrivers, mockVehicles, mockShifts, mockInspections, inspectionItems
  utils/       formatters, status, analytics, pdfGenerator
  hooks/       useFakeLoad (simulated API delay)
```

## Driver flow

1. **Start shift** — pick driver, vehicle, odometer start (warns if the vehicle's
   last inspection is >24 h old or failed).
2. **Pre-trip inspection** — 28-item grouped checklist (pass/fail), fuel level,
   notes, typed signature, live progress bar.
3. **Trip log** — four-step cycle (Depart Lot → Arrive Airport → Depart Airport →
   Arrive Lot). Steps unlock in order, each tap stamps the time; passenger counts
   are captured each direction. Trips auto-save and the cycle resets.
4. **End shift** — odometer end + auto-calculated distance, then export a
   **Full Shift Report** or **Inspection Report** PDF.

## Manager features

- **Dashboard** — today's KPIs, live fleet cards, hourly trend chart
  (today vs. yesterday vs. 7-day average), activity feed, quick actions.
- **All Trips** — filterable 30-day table with a detail slide-over + PDF export.
- **Fleet** — vehicle roster with inspection results, per-vehicle detail panel
  (inspection history, failed-item callouts, editable maintenance notes).
- **Drivers** — roster cards → driver detail with a 30-day bar chart and shift history.
- **Reports** — Daily Shift, Fleet Inspection, and Operations Summary PDFs.
- **Settings** — location config, inspection-checklist manager, notification
  toggles, and an Airtable integration placeholder.

## Airtable migration

The seed data lives in `src/data/`. Each file carries a header comment naming its
target Airtable table, and read/write points throughout the app are tagged with
`// AIRTABLE:` comments describing the exact request and fields. Swap the mock
imports for fetch hooks against the `ParkNFly_Halifax` base and the UI is unchanged.

---

*ShuttleLog v1.0 Concept · Built for Park'N Fly Halifax · June 2026*
