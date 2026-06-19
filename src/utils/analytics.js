/**
 * analytics.js — aggregation helpers for the manager dashboard & reports.
 * Pure functions over the mock collections (shifts, trips, inspections).
 *
 * AIRTABLE: these computations would run server-side or via Airtable formula
 * fields / rollups once migrated; kept client-side here for the concept.
 */

import { dateKey } from './formatters'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6am … 11pm

const tripCompletedHour = (trip) => {
  const t = trip.arriveLotTime || trip.departLotTime
  return t ? new Date(t).getHours() : null
}

const addDays = (dateStr, delta) => {
  const d = new Date(`${dateStr}T12:00:00`)
  d.setDate(d.getDate() + delta)
  return dateKey(d)
}

/** Hourly trip counts: today vs yesterday vs 7-day average. */
export function buildDailyTrend(trips, referenceToday) {
  const todayKey = referenceToday
  const yesterdayKey = addDays(referenceToday, -1)
  const last7Keys = Array.from({ length: 7 }, (_, i) => addDays(referenceToday, -(i + 1)))

  const countByHour = (filterKeys) => {
    const map = {}
    HOURS.forEach((h) => (map[h] = 0))
    trips
      .filter((t) => t.status === 'complete' && filterKeys.includes(t.date))
      .forEach((t) => {
        const h = tripCompletedHour(t)
        if (h != null && map[h] != null) map[h]++
      })
    return map
  }

  const todayMap = countByHour([todayKey])
  const yestMap = countByHour([yesterdayKey])
  const weekMap = countByHour(last7Keys)

  return HOURS.map((h) => ({
    hour: h,
    label: formatHour(h),
    today: todayMap[h],
    yesterday: yestMap[h],
    avg: Math.round((weekMap[h] / 7) * 10) / 10,
  }))
}

function formatHour(h) {
  const ampm = h >= 12 ? 'p' : 'a'
  const hr = h % 12 || 12
  return `${hr}${ampm}`
}

/** Chronological feed of today's trip events (most recent first). */
export function buildActivityFeed(shifts, referenceToday, drivers, vehicles, limit = 40) {
  const driverName = (id) => drivers.find((d) => d.id === id)?.name || id
  const vehicleNum = (id) => vehicles.find((v) => v.id === id)?.busNum || id

  const events = []
  shifts
    .filter((s) => s.date === referenceToday)
    .forEach((shift) => {
      shift.trips.forEach((trip) => {
        const ctx = { driver: driverName(shift.driverId), vehicle: vehicleNum(shift.vehicleId), tripNum: trip.tripNumber }
        if (trip.departLotTime)
          events.push({ ...ctx, time: trip.departLotTime, type: 'Departed lot', pax: trip.paxToAirport, color: 'green' })
        if (trip.arriveAirportTime)
          events.push({ ...ctx, time: trip.arriveAirportTime, type: 'Arrived at airport', pax: trip.paxToAirport, color: 'amber' })
        if (trip.departAirportTime)
          events.push({ ...ctx, time: trip.departAirportTime, type: 'Departed airport', pax: trip.paxFromAirport, color: 'info' })
        if (trip.arriveLotTime)
          events.push({ ...ctx, time: trip.arriveLotTime, type: 'Arrived at lot', pax: trip.paxFromAirport, color: 'green' })
      })
    })

  return events.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, limit)
}

/** Per-driver stats over a set of shifts. */
export function driverStats(driverId, shifts, inspections, referenceToday) {
  const myShifts = shifts.filter((s) => s.driverId === driverId)
  const today = myShifts.filter((s) => s.date === referenceToday)

  const allTrips = myShifts.flatMap((s) => s.trips)
  const completed = allTrips.filter((t) => t.status === 'complete')
  const todayTrips = today.flatMap((s) => s.trips).filter((t) => t.status === 'complete')

  const totalPax = completed.reduce((sum, t) => sum + (t.paxToAirport || 0) + (t.paxFromAirport || 0), 0)
  const todayPax = todayTrips.reduce((sum, t) => sum + (t.paxToAirport || 0) + (t.paxFromAirport || 0), 0)

  const myInspections = inspections.filter((i) => i.driverId === driverId)

  // Inspection compliance: of the driver's COMPLETED shifts, what fraction had
  // a fully completed (all items + signature) pre-trip inspection. Skipped or
  // partial inspections drag the score down; complete ones lift it.
  const endedShifts = myShifts.filter((s) => s.status === 'complete')
  const compliantShifts = endedShifts.filter((s) => s.inspectionStatus === 'complete')
  const complianceRate = endedShifts.length
    ? Math.round((compliantShifts.length / endedShifts.length) * 100)
    : 100
  const missedInspections = endedShifts.length - compliantShifts.length

  return {
    shiftCount: myShifts.length,
    totalTrips: completed.length,
    todayTrips: todayTrips.length,
    totalPax,
    todayPax,
    avgTripsPerShift: myShifts.length ? Math.round((completed.length / myShifts.length) * 10) / 10 : 0,
    complianceRate,
    endedShifts: endedShifts.length,
    compliantShifts: compliantShifts.length,
    missedInspections,
    onShiftToday: today.some((s) => s.status === 'active'),
    shifts: [...myShifts].sort((a, b) => (a.date < b.date ? 1 : -1)),
    inspections: myInspections,
  }
}

/** 30-day trips-per-day series for a driver (for the bar chart). */
export function driverDailySeries(driverId, shifts, referenceToday, days = 30) {
  const keys = Array.from({ length: days }, (_, i) => addDays(referenceToday, -(days - 1 - i)))
  const counts = {}
  keys.forEach((k) => (counts[k] = 0))
  shifts
    .filter((s) => s.driverId === driverId)
    .forEach((s) => {
      if (counts[s.date] != null) {
        counts[s.date] += s.trips.filter((t) => t.status === 'complete').length
      }
    })
  return keys.map((k) => ({
    date: k,
    label: new Date(`${k}T12:00:00`).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    trips: counts[k],
  }))
}

/** Per-vehicle stats (fleet utilization + this week's trips). */
export function vehicleStats(vehicleId, shifts, inspections, referenceToday) {
  const myShifts = shifts.filter((s) => s.vehicleId === vehicleId)
  const weekKeys = Array.from({ length: 7 }, (_, i) => addDays(referenceToday, -i))
  const trips = myShifts.flatMap((s) => s.trips).filter((t) => t.status === 'complete')
  const weekTrips = myShifts
    .filter((s) => weekKeys.includes(s.date))
    .flatMap((s) => s.trips)
    .filter((t) => t.status === 'complete')
  const totalPax = trips.reduce((sum, t) => sum + (t.paxToAirport || 0) + (t.paxFromAirport || 0), 0)
  const myInspections = inspections
    .filter((i) => i.vehicleId === vehicleId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const failedCount = myInspections.reduce(
    (sum, i) => sum + Object.values(i.results).filter((v) => v === 'fail').length,
    0,
  )
  return {
    totalTrips: trips.length,
    weekTrips: weekTrips.length,
    totalPax,
    inspections: myInspections,
    inspectionCount: myInspections.length,
    failedItems: failedCount,
  }
}

/** Aggregate stats over a date range (operations summary report). */
export function rangeSummary(shifts, inspections, drivers, vehicles, startKey, endKey) {
  const inRange = (d) => d >= startKey && d <= endKey
  const shiftsInRange = shifts.filter((s) => inRange(s.date))
  const days = new Set(shiftsInRange.map((s) => s.date)).size || 1

  const allTrips = shiftsInRange.flatMap((s) => s.trips).filter((t) => t.status === 'complete')
  const totalPax = allTrips.reduce((sum, t) => sum + (t.paxToAirport || 0) + (t.paxFromAirport || 0), 0)

  const byDriver = drivers.map((d) => {
    const ds = shiftsInRange.filter((s) => s.driverId === d.id)
    const ts = ds.flatMap((s) => s.trips).filter((t) => t.status === 'complete')
    const paxTo = ts.reduce((sum, t) => sum + (t.paxToAirport || 0), 0)
    const paxFrom = ts.reduce((sum, t) => sum + (t.paxFromAirport || 0), 0)
    return { name: d.name, shifts: ds.length, trips: ts.length, paxTo, paxFrom, totalPax: paxTo + paxFrom }
  }).filter((d) => d.shifts > 0)

  const byVehicle = vehicles.map((v) => {
    const vs = shiftsInRange.filter((s) => s.vehicleId === v.id)
    const ts = vs.flatMap((s) => s.trips).filter((t) => t.status === 'complete')
    const totalP = ts.reduce((sum, t) => sum + (t.paxToAirport || 0) + (t.paxFromAirport || 0), 0)
    const insp = inspections.filter((i) => i.vehicleId === v.id && inRange(i.date))
    const failed = insp.reduce((sum, i) => sum + Object.values(i.results).filter((x) => x === 'fail').length, 0)
    return { busNum: v.busNum, trips: ts.length, totalPax: totalP, inspections: insp.length, failedItems: failed }
  }).filter((v) => v.trips > 0 || v.inspections > 0)

  // approximate distance: 8km round trip per completed trip
  const totalKm = allTrips.length * 8

  return {
    kpis: {
      totalTrips: allTrips.length,
      totalPax,
      avgTripsPerDay: Math.round((allTrips.length / days) * 10) / 10,
      totalKm,
    },
    byDriver,
    byVehicle,
  }
}
