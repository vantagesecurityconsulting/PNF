/**
 * Status derivation + color mapping.
 * "Color = meaning" — green=good/departing, amber=in progress/at airport,
 * blue=returning, red=problem, gray=idle.
 */

// Trip step (1–4) metadata used by the driver app status strip.
export const TRIP_STEPS = [
  { step: 1, key: 'depart-lot', label: 'Depart Parking Lot', short: 'Departing', color: 'green' },
  { step: 2, key: 'arrive-airport', label: 'Arrive at Airport', short: 'At Airport', color: 'amber' },
  { step: 3, key: 'depart-airport', label: 'Depart Airport', short: 'Returning', color: 'info' },
  { step: 4, key: 'arrive-lot', label: 'Arrive at Parking Lot', short: 'At Lot', color: 'green' },
]

// Map the *next action* step to a fleet status label/color.
// step 1 = about to depart lot (idle/in lot), 2 = en route, 3 = at airport, 4 = returning.
export function stepToFleetStatus(step) {
  switch (step) {
    case 1:
      return { key: 'in-lot', label: 'In Lot', color: 'gray' }
    case 2:
      return { key: 'en-route', label: 'En Route', color: 'green' }
    case 3:
      return { key: 'at-airport', label: 'At Airport', color: 'amber' }
    case 4:
      return { key: 'returning', label: 'Returning', color: 'info' }
    default:
      return { key: 'in-lot', label: 'In Lot', color: 'gray' }
  }
}

/**
 * Given a shift's trips, derive the current "live" fleet status.
 * Looks at the last trip; if it has open legs, infers the active step.
 */
export function deriveLiveStatus(shift) {
  if (!shift || shift.status !== 'active') {
    return { key: 'in-lot', label: 'In Lot', color: 'gray', step: 1 }
  }
  const trips = shift.trips || []
  const last = trips[trips.length - 1]
  if (!last) return { key: 'in-lot', label: 'In Lot', color: 'gray', step: 1 }

  // Determine which leg is open on the most recent trip.
  let step
  if (!last.departLotTime) step = 1
  else if (!last.arriveAirportTime) step = 2
  else if (!last.departAirportTime) step = 3
  else if (!last.arriveLotTime) step = 4
  else step = 1 // last trip complete, waiting in lot for next

  const status = stepToFleetStatus(step)
  return { ...status, step }
}

// Vehicle roster status (active / idle / flagged / out-of-service).
export const VEHICLE_STATUS = {
  active: { label: 'Active', color: 'green', dot: '🟢' },
  idle: { label: 'Idle', color: 'amber', dot: '🟡' },
  flagged: { label: 'Flagged', color: 'red', dot: '🔴' },
  'out-of-service': { label: 'Out of Service', color: 'gray', dot: '⚫' },
}

// Tailwind class sets for the named brand colors.
export const COLOR_CLASSES = {
  green: {
    text: 'text-green',
    bg: 'bg-green',
    bgLight: 'bg-green-light',
    border: 'border-green',
    chipBg: 'bg-green-light',
    chipText: 'text-green-dark',
    solidBg: 'bg-green',
    solidHover: 'hover:bg-green-dark',
  },
  amber: {
    text: 'text-amber',
    bg: 'bg-amber',
    bgLight: 'bg-amber/10',
    border: 'border-amber',
    chipBg: 'bg-amber/15',
    chipText: 'text-amber',
    solidBg: 'bg-amber',
    solidHover: 'hover:brightness-95',
  },
  info: {
    text: 'text-info',
    bg: 'bg-info',
    bgLight: 'bg-info/10',
    border: 'border-info',
    chipBg: 'bg-info/12',
    chipText: 'text-info',
    solidBg: 'bg-info',
    solidHover: 'hover:brightness-95',
  },
  red: {
    text: 'text-danger',
    bg: 'bg-danger',
    bgLight: 'bg-danger/10',
    border: 'border-danger',
    chipBg: 'bg-danger/12',
    chipText: 'text-danger',
    solidBg: 'bg-danger',
    solidHover: 'hover:brightness-95',
  },
  gray: {
    text: 'text-graytext',
    bg: 'bg-gray-200',
    bgLight: 'bg-gray-100',
    border: 'border-gray-300',
    chipBg: 'bg-gray-100',
    chipText: 'text-graytext',
    solidBg: 'bg-gray-400',
    solidHover: 'hover:bg-gray-500',
  },
}

export const colorClass = (color) => COLOR_CLASSES[color] || COLOR_CLASSES.gray
