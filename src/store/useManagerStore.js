/**
 * useManagerStore — all shifts, trips, drivers, vehicles, inspections (manager).
 *
 * AIRTABLE: This store hydrates from mock data files today. On migration each
 * collection becomes a fetch hook against the corresponding Airtable table:
 *   drivers      → GET /Drivers
 *   vehicles     → GET /Vehicles
 *   shifts       → GET /Shifts (+ linked /Trips)
 *   inspections  → GET /Inspections
 *   settings     → GET /Location_Settings + /Inspection_Checklist_Items
 * Mutations (flag vehicle, edit notes, toggle checklist item) become PATCH calls.
 */

import { create } from 'zustand'
import { mockDrivers } from '../data/mockDrivers'
import { mockVehicles } from '../data/mockVehicles'
import { mockShifts, allTrips, REFERENCE_TODAY } from '../data/mockShifts'
import { mockInspections } from '../data/mockInspections'
import { inspectionGroups } from '../data/inspectionItems'

// Seed the checklist "active" config from the canonical item list.
const initialChecklist = inspectionGroups.flatMap((g) =>
  g.items.map((i) => ({ key: i.key, label: i.label, category: g.label, active: true })),
)

export const useManagerStore = create((set, get) => ({
  // Hydrated collections (clone so mutations don't touch the seed modules)
  drivers: mockDrivers.map((d) => ({ ...d })),
  vehicles: mockVehicles.map((v) => ({ ...v })),
  shifts: mockShifts,
  trips: allTrips,
  inspections: mockInspections,
  referenceToday: REFERENCE_TODAY,

  // Settings
  settings: {
    locationName: 'Halifax, NS',
    locationCode: 'YHZ',
    notifications: {
      failedInspectionAlerts: true,
      dailySummaryEmail: true,
      shiftReminderTexts: false,
      maintenanceDueAlerts: true,
    },
  },
  checklist: initialChecklist,

  // Report generation timestamps (per report type)
  reportTimestamps: {
    daily: null,
    inspection: null,
    operations: null,
  },

  // ---- Mutations ----------------------------------------------------------
  // AIRTABLE: PATCH /Vehicles → Status = 'flagged'
  flagVehicle: (vehicleId, flagged = true) =>
    set((s) => ({
      vehicles: s.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, status: flagged ? 'flagged' : v.inspectionResult === 'fail' ? 'flagged' : 'active' }
          : v,
      ),
    })),

  setVehicleStatus: (vehicleId, status) =>
    set((s) => ({
      vehicles: s.vehicles.map((v) => (v.id === vehicleId ? { ...v, status } : v)),
    })),

  // AIRTABLE: PATCH /Vehicles → Maintenance_Notes
  updateMaintenanceNotes: (vehicleId, notes) =>
    set((s) => ({
      vehicles: s.vehicles.map((v) =>
        v.id === vehicleId ? { ...v, maintenanceNotes: notes } : v,
      ),
    })),

  // AIRTABLE: PATCH /Location_Settings
  updateSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),

  toggleNotification: (key) =>
    set((s) => ({
      settings: {
        ...s.settings,
        notifications: { ...s.settings.notifications, [key]: !s.settings.notifications[key] },
      },
    })),

  // AIRTABLE: PATCH /Inspection_Checklist_Items → Active
  toggleChecklistItem: (key) =>
    set((s) => ({
      checklist: s.checklist.map((c) => (c.key === key ? { ...c, active: !c.active } : c)),
    })),

  markReportGenerated: (type) =>
    set((s) => ({
      reportTimestamps: { ...s.reportTimestamps, [type]: new Date().toISOString() },
    })),
}))

// ---- Aggregation selectors (pure functions over store data) --------------

export const selectTodayShifts = (state) =>
  state.shifts.filter((s) => s.date === state.referenceToday)

export const selectTodayTrips = (state) =>
  state.trips.filter((t) => t.date === state.referenceToday)

// Completed trips today (all 4 timestamps logged)
export const selectTodayCompletedTrips = (state) =>
  selectTodayTrips(state).filter((t) => t.status === 'complete')

export const selectTodayKpis = (state) => {
  const todayTrips = selectTodayTrips(state)
  const completed = todayTrips.filter((t) => t.status === 'complete')
  const totalPax = todayTrips.reduce(
    (sum, t) => sum + (t.paxToAirport || 0) + (t.paxFromAirport || 0),
    0,
  )
  const activeShifts = selectTodayShifts(state).filter((s) => s.status === 'active')
  const activeVehicleIds = new Set(activeShifts.map((s) => s.vehicleId))
  const idleVehicles = state.vehicles.filter(
    (v) => !activeVehicleIds.has(v.id) && v.status !== 'out-of-service',
  )
  // Failed inspection items flagged today / unresolved
  const failedInspections = state.inspections.filter(
    (i) => i.overallResult === 'fail',
  )
  const flaggedVehicles = state.vehicles.filter((v) => v.status === 'flagged')

  return {
    totalTrips: completed.length,
    totalPax,
    activeVehicles: activeVehicleIds.size,
    idleVehicles: idleVehicles.length,
    flaggedItems: flaggedVehicles.length,
    failedInspections: failedInspections.length,
  }
}

export default useManagerStore
