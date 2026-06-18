/**
 * useShiftStore — current driver shift state (driver app).
 *
 * AIRTABLE: This entire store simulates the live shift record. On migration:
 *   - startShift()      → POST /Shifts (create record), POST /Inspections placeholder
 *   - logStep()         → PATCH /Trips (update current trip leg timestamp)
 *   - completeTrip()    → POST /Trips (finalize trip record)
 *   - saveInspection()  → PATCH /Inspections (write results + signature)
 *   - endShift()        → PATCH /Shifts (set End_Time, Odo_End)
 *
 * Persisted to localStorage so a tablet refresh mid-shift keeps state.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { allInspectionItems } from '../data/inspectionItems'
import { minutesBetween } from '../utils/formatters'

const emptyTrip = () => ({
  departLotTime: null,
  arriveAirportTime: null,
  departAirportTime: null,
  arriveLotTime: null,
  paxToAirport: 0,
  paxFromAirport: 0,
})

const emptyInspectionResults = () =>
  allInspectionItems.reduce((acc, item) => {
    acc[item.key] = null // null = not checked, 'pass' | 'fail'
    return acc
  }, {})

const initialState = {
  // Shift setup
  shiftStarted: false,
  driverId: '',
  vehicleId: '',
  shiftDate: '',
  odoStart: '',
  odoEnd: '',
  startedAt: null,

  // Inspection
  inspectionComplete: false,
  inspectionResults: emptyInspectionResults(),
  fuelLevel: '',
  inspectionNotes: '',
  inspectionSignature: '',

  // Trips
  currentStep: 1, // 1–4, the next action to perform
  currentTripNum: 1,
  currentTrip: emptyTrip(),
  trips: [], // completed trips
}

export const useShiftStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      startShift: ({ driverId, vehicleId, shiftDate, odoStart }) =>
        set({
          shiftStarted: true,
          driverId,
          vehicleId,
          shiftDate,
          odoStart,
          startedAt: new Date().toISOString(),
          currentStep: 1,
          currentTripNum: 1,
          currentTrip: emptyTrip(),
          trips: [],
        }),

      // Passenger counters
      setPaxToAirport: (value) =>
        set((s) => ({ currentTrip: { ...s.currentTrip, paxToAirport: clamp(value, 0, 20) } })),
      setPaxFromAirport: (value) =>
        set((s) => ({ currentTrip: { ...s.currentTrip, paxFromAirport: clamp(value, 0, 20) } })),

      // Log the timestamp for the given step (1–4). Auto-advances.
      logStep: (step) => {
        const now = new Date().toISOString()
        const s = get()
        if (step !== s.currentStep) return // enforce in-order

        if (step === 1) {
          set({
            currentTrip: { ...s.currentTrip, departLotTime: now },
            currentStep: 2,
          })
        } else if (step === 2) {
          set({
            currentTrip: { ...s.currentTrip, arriveAirportTime: now },
            currentStep: 3,
          })
        } else if (step === 3) {
          set({
            currentTrip: { ...s.currentTrip, departAirportTime: now },
            currentStep: 4,
          })
        } else if (step === 4) {
          const finished = { ...s.currentTrip, arriveLotTime: now }
          const completedTrip = {
            id: `local-T${s.currentTripNum}`,
            tripNumber: s.currentTripNum,
            ...finished,
            durationMin: minutesBetween(finished.departLotTime, finished.arriveLotTime),
            status: 'complete',
          }
          set({
            trips: [...s.trips, completedTrip],
            currentTripNum: s.currentTripNum + 1,
            currentTrip: emptyTrip(),
            currentStep: 1,
          })
        }
      },

      // Inspection actions
      setInspectionItem: (key, value) =>
        set((s) => ({ inspectionResults: { ...s.inspectionResults, [key]: value } })),
      setFuelLevel: (fuelLevel) => set({ fuelLevel }),
      setInspectionNotes: (inspectionNotes) => set({ inspectionNotes }),
      setInspectionSignature: (inspectionSignature) => set({ inspectionSignature }),
      saveInspection: () => set({ inspectionComplete: true }),

      setOdoEnd: (odoEnd) => set({ odoEnd }),

      endShift: () => set({ ...initialState, inspectionResults: emptyInspectionResults() }),
      reset: () => set({ ...initialState, inspectionResults: emptyInspectionResults() }),
    }),
    {
      name: 'shuttlelog-driver-shift',
    },
  ),
)

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

// Derived selectors (call with store values) -------------------------------
export const selectTripTotals = (trips) => {
  const totalTrips = trips.length
  const paxTo = trips.reduce((sum, t) => sum + (t.paxToAirport || 0), 0)
  const paxFrom = trips.reduce((sum, t) => sum + (t.paxFromAirport || 0), 0)
  return { totalTrips, paxTo, paxFrom, totalPax: paxTo + paxFrom }
}
